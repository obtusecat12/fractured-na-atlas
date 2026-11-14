# Precompute label anchors per faction part in map space: pole of inaccessibility + medial-axis centreline -> build/labels.json
import json, numpy as np
from shapely.geometry import shape
from shapely.ops import polylabel
from scipy import ndimage as ndi
from skimage.morphology import skeletonize
import rasterio.features as rf
from rasterio.transform import Affine
from collections import deque
F=json.load(open('../build/_pf.json'))['features']
def longest_path(sk):
    ys,xs=np.nonzero(sk); 
    if len(ys)<2: return None
    idx={(y,x):i for i,(y,x) in enumerate(zip(ys,xs))}
    nb=[[] for _ in ys]
    for i,(y,x) in enumerate(zip(ys,xs)):
        for dy in (-1,0,1):
            for dx in (-1,0,1):
                if (dy or dx) and (y+dy,x+dx) in idx: nb[i].append(idx[(y+dy,x+dx)])
    def bfs(s):
        dist=[-1]*len(ys); prev=[-1]*len(ys); dist[s]=0; q=deque([s]); last=s
        while q:
            u=q.popleft(); last=u
            for v in nb[u]:
                if dist[v]<0: dist[v]=dist[u]+1; prev[v]=u; q.append(v)
        far=max(range(len(ys)),key=lambda i:dist[i]); return far,prev
    a,_=bfs(0); b,prev=bfs(a)
    p=[b]
    while p[-1]!=a and prev[p[-1]]>=0: p.append(prev[p[-1]])
    return [(xs[i],ys[i]) for i in p]
from shapely.ops import unary_union
N=json.load(open('../build/_pn.json')); N=N['features'] if 'features' in N else [N]
nat=unary_union([shape(x['geometry']).buffer(0) for x in N])
sil=nat.difference(unary_union([shape(x['geometry']).buffer(0.5) for x in F])).buffer(-1).buffer(1)
F=F+[{'id':'_silence','geometry':sil.__geo_interface__}]
out={}
for f in F:
    g=shape(f['geometry']); parts=sorted(getattr(g,'geoms',[g]),key=lambda p:-p.area)
    A0=parts[0].area; L=[]
    for p in parts[:14]:
        if p.area<25 or (p.area<0.004*A0 and p.area<400): continue
        pole=polylabel(p,tolerance=0.5); r=p.exterior.distance(pole)
        for h in p.interiors: r=min(r,h.distance(pole))
        x0,y0,x1,y1=p.bounds; res=max(0.5,np.sqrt(p.area)/160)
        Wd=int((x1-x0)/res)+5; Hd=int((y1-y0)/res)+5
        tr=Affine(res,0,x0-2*res,0,res,y0-2*res)
        m=rf.rasterize([(p,1)],out_shape=(Hd,Wd),transform=tr).astype(bool)
        m=ndi.binary_closing(m,iterations=2)&ndi.binary_dilation(m,iterations=1)
        dt=ndi.distance_transform_edt(m)
        sk=skeletonize(ndi.gaussian_filter(m.astype(float),1.2)>0.5)
        path=longest_path(sk); line=[]
        if path and len(path)>6:
            P=np.array(path,float); n=len(P); w=max(3,n//12)
            K=np.ones(w)/w
            sx=np.convolve(np.r_[np.full(w,P[0,0]),P[:,0],np.full(w,P[-1,0])],K,'same')[w:-w]
            sy=np.convolve(np.r_[np.full(w,P[0,1]),P[:,1],np.full(w,P[-1,1])],K,'same')[w:-w]
            hw=dt[P[:,1].astype(int),P[:,0].astype(int)]*res
            # trim ends where the medial axis runs into tips (half-width tiny)
            step=max(1,n//48)
            for i in list(range(0,n,step))+[n-1]:
                line.append([round(x0-2*res+sx[i]*res+res/2,1),round(y0-2*res+sy[i]*res+res/2,1),round(float(hw[i]),1)])
        L.append({'a':round(p.area,1),'p':[round(pole.x,1),round(pole.y,1)],'r':round(r,1),'b':[round(v,1) for v in p.bounds],'l':line})
    out[f['id']]=L
json.dump(out,open('../build/labels.json','w'))
print({k:len(v) for k,v in out.items()}, len(json.dumps(out)))
# grid of candidate spots inside radio silence (for repeated labels when zoomed in)
from shapely.geometry import Point
from shapely import prepared
ps=prepared.prep(sil); G=[]
x0,y0,x1,y1=sil.bounds; bd=sil.boundary
for y in np.arange(y0,y1,60):
    for x in np.arange(x0,x1,60):
        q=Point(x,y)
        if ps.contains(q):
            d=bd.distance(q)
            if d>12: G.append([round(x),round(y),round(d,1)])
out['_silgrid']=G
json.dump(out,open('../build/labels.json','w')); print('grid',len(G))
