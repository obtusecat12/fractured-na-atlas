# site projection (conic equal-area as in projection.json): forward and inverse, map space W=4000
import json, os, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
pj = json.load(open(os.path.join(HERE, '../../site/projection.json')))
y0_, y1_ = np.radians(pj['parallels']); n = (np.sin(y0_) + np.sin(y1_)) / 2; c = 1 + np.sin(y0_) * (2 * n - np.sin(y0_)); r0 = np.sqrt(c) / n
k = pj['scale']; tx, ty = pj['translate']; yc = r0 - np.sqrt(c - 2 * n * np.sin(np.radians(33.6442))) / n
def fwd(lon, lat):
    l = np.radians(np.asarray(lon) + pj['rotate'][0]); p = np.radians(lat); r = np.sqrt(c - 2 * n * np.sin(p)) / n
    return tx + k * r * np.sin(l * n), ty - k * (r0 - r * np.cos(l * n) - yc)
def inv(px, py):
    x = (np.asarray(px) - tx) / k; y = (ty - np.asarray(py)) / k + yc; r0y = r0 - y
    l = np.arctan2(x, np.abs(r0y)) * np.sign(r0y)
    lat = np.arcsin(np.clip((c - (x * x + r0y * r0y) * n * n) / (2 * n), -1, 1))
    return np.degrees(l / n) - pj['rotate'][0], np.degrees(lat)
