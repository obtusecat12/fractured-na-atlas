# Terrain helper for v3.5: AWS Terrain Tiles (terrarium, z9, ~300 m) sampled on a map-space grid.
# Tiles are cached in ../work/dem/ (not in the repo; re-downloaded on demand).
import os, math, urllib.request, numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates
import v35_proj as PJ
HERE = os.path.dirname(os.path.abspath(__file__)); CACHE = os.path.join(HERE, '../work/dem/'); os.makedirs(CACHE, exist_ok=True)
Z = 9
def _tile(x, y):
    f = CACHE + '%d_%d_%d.png' % (Z, x, y)
    if not os.path.exists(f):
        open(f, 'wb').write(urllib.request.urlopen('https://s3.amazonaws.com/elevation-tiles-prod/terrarium/%d/%d/%d.png' % (Z, x, y), timeout=60).read())
    a = np.asarray(Image.open(f).convert('RGB')).astype(np.float32)
    return a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
def elevation(lon, lat):
    n = 2 ** Z; fx = (lon + 180) / 360 * n * 256
    r = np.radians(lat); fy = (1 - np.log(np.tan(r) + 1 / np.cos(r)) / np.pi) / 2 * n * 256
    x0, x1 = int(fx.min() // 256), int(fx.max() // 256); y0, y1 = int(fy.min() // 256), int(fy.max() // 256)
    mos = np.zeros(((y1 - y0 + 1) * 256, (x1 - x0 + 1) * 256), np.float32)
    for ty in range(y0, y1 + 1):
        for tx in range(x0, x1 + 1): mos[(ty - y0) * 256:(ty - y0 + 1) * 256, (tx - x0) * 256:(tx - x0 + 1) * 256] = _tile(tx, ty)
    return map_coordinates(mos, [fy - y0 * 256 - .5, fx - x0 * 256 - .5], order=1, mode='nearest')
def grid(x0, y0, x1, y1, res):
    """map-space grid (cell centres) -> X, Y, elevation (m)"""
    xs = x0 + (np.arange(int((x1 - x0) / res)) + .5) * res; ys = y0 + (np.arange(int((y1 - y0) / res)) + .5) * res
    X, Y = np.meshgrid(xs, ys); lon, lat = PJ.inv(X, Y)
    return X, Y, elevation(lon, lat)
