# Reproject NASA Black Marble 2016 (500m gray tiles A1,B1) into map space -> build/night_src.npy (float radiance-ish 0..1)
import numpy as np, json, sys
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
pj=json.load(open('../build/projection.json'));W,H=pj['W'],pj['H']
SC=float(sys.argv[1]) if len(sys.argv)>1 else 1.0
w,h=int(W*SC),int(H*SC)
y0,y1=np.radians(pj['parallels']);n=(np.sin(y0)+np.sin(y1))/2;c=1+np.sin(y0)*(2*n-np.sin(y0));r0=np.sqrt(c)/n
k=pj['scale'];tx,ty=pj['translate']
yc=r0-np.sqrt(c-2*n*np.sin(np.radians(33.6442)))/n
def inv(px,py):
    x=(px-tx)/k;y=(ty-py)/k+yc;r0y=r0-y
    l=np.arctan2(x,np.abs(r0y))*np.sign(r0y)
    lat=np.arcsin(np.clip((c-(x*x+r0y*r0y)*n*n)/(2*n),-1,1))
    return np.degrees(l/n)-pj['rotate'][0], np.degrees(lat)
xs=(np.arange(w)+.5)/SC; ys=(np.arange(h)+.5)/SC
out=np.zeros((h,w),np.float32)
tiles={}
for t,lon0 in (('A1',-180),('B1',-90)):
    tiles[t]=(np.asarray(Image.open('../data/nightlights/BM_%s.jpg'%t)),lon0)
for j0 in range(0,h,256):
    X,Y=np.meshgrid(xs,ys[j0:j0+256]); lon,lat=inv(X,Y)
    blk=np.zeros(X.shape,np.float32)
    for t,(img,lon0) in tiles.items():
        m=(lon>=lon0)&(lon<lon0+90)&(lat>0)&(lat<90)
        if not m.any(): continue
        fx=(lon[m]-lon0)*240-.5; fy=(90-lat[m])*240-.5
        ix=np.clip(fx.astype(int),0,21598); iy=np.clip(fy.astype(int),0,21598); ax=np.clip(fx-ix,0,1); ay=np.clip(fy-iy,0,1)
        v=lambda a,b: img[iy+b,ix+a].astype(np.float32)
        blk[m]=(v(0,0)*(1-ax)+v(1,0)*ax)*(1-ay)+(v(0,1)*(1-ax)+v(1,1)*ax)*ay
    out[j0:j0+256]=blk/255.
np.save('../build/night_src.npy',out)
Image.fromarray((out*255).astype(np.uint8)).save('../build/night_src_preview.png')
print(w,h,out.mean(),out.max())
