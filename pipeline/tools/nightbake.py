# Bake night-light layers from real NASA Black Marble 2016 radiance (build/night_src.npy) + faction masks.
# Output: build/night/*.jpg + build/night/layers.json
import numpy as np, json, os
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter, zoom as ndzoom
B='../build/'; os.makedirs(B+'night',exist_ok=True)
import sys
SC=float(sys.argv[1]) if len(sys.argv)>1 else 1.0
pj=json.load(open(B+'projection.json'));W0,H0=pj['W'],pj['H'];W,H=int(W0*SC),int(H0*SC)
R=np.load(B+'night_src.npy')            # 0..1 gray (gamma-encoded jpeg values)
R=np.clip((R-0.02)/0.98,0,1)**1.25     # remove noise floor, linearise
y0,y1=np.radians(pj['parallels']);n=(np.sin(y0)+np.sin(y1))/2;c=1+np.sin(y0)*(2*n-np.sin(y0));r0=np.sqrt(c)/n
k=pj['scale'];tx,ty=pj['translate'];yc=r0-np.sqrt(c-2*n*np.sin(np.radians(33.6442)))/n
def fwd(lon,lat):
    l=np.radians(lon+pj['rotate'][0]);p=np.radians(lat);r=np.sqrt(c-2*n*np.sin(p))/n
    return tx+k*r*np.sin(l*n), ty-k*(r0-r*np.cos(l*n)-yc)
def polys(g):
    return [g['coordinates']] if g['type']=='Polygon' else g['coordinates'] if g['type']=='MultiPolygon' else []
def mask_of(feats,proj=False):
    im=Image.new('L',(W,H),0);d=ImageDraw.Draw(im)
    for f in feats:
        for p in polys(f['geometry']):
            for i,ring in enumerate(p):
                pts=[fwd(*q) if proj else q for q in ring]
                d.polygon([(float(x)*SC,float(y)*SC) for x,y in pts],fill=255 if i==0 else 0)
    return np.asarray(im)>127
pf=json.load(open(B+'_pf.json'))['features']; pn=json.load(open(B+'_pn.json'))['features']
M={f['id']:None for f in pf}
for f in pf: M[f['id']]=mask_of([f])
M['none']=mask_of(pn)
for kk in list(M):
    if kk.startswith('gilead_'): M['gilead']=M['gilead']|M.pop(kk)
    elif kk.startswith('usg_'): M['usg']=M['usg']|M.pop(kk)
# nuclear strike zones: dead
ex=json.load(open(B+'extras.json'))
Yn,Xn=np.ogrid[0:H,0:W]; NUKE=np.zeros((H,W),bool)
for nz in ex['nuclear']: NUKE|=((Xn-nz['x']*SC)**2+(Yn-nz['y']*SC)**2)<(nz['r']*1.7*SC)**2
hatch=mask_of(json.load(open(B+'hatch.geojson'))['features'],True)
us=np.zeros((H,W),bool)
for v in M.values(): us|=v
rng=np.random.default_rng(7)
def cells(p,cs):
    g=rng.random((H//cs+1,W//cs+1))<p
    return np.kron(g,np.ones((cs,cs),bool))[:H,:W]
# weight per layer
L={}
L['static']=R*(~us) + R*sum(M[i] for i in ['usg','jefferson','lincoln','sequoyah','lds','texas','cascadia'])
L['static']=L['static']+R*M['dwg']*0.9
L['static']+=R*(M['wvbc']|M['srl']|M['nafr']|M['utdr']|M['vtr']|M['gmr']|M['csa'])*0.38 + R*M['bw']*0.95 + R*(M['mxo']&~hatch)*0.75
L['fema']=R*M['fema']*0.85
L['frc']=R*M['frc']
L['agg']=R*M['agg']*cells(0.16,5)
L['mxoC']=R*(M['mxo']&hatch)*cells(0.35,4)
# Gilead: lights out, except a regular grid of cold checkpoint lamps + Washington
gil=np.zeros((H,W),np.float32); gm=M['gilead']
yy,xx=np.mgrid[0:H:int(13*SC),0:W:int(13*SC)]; sel=gm[yy,xx]
gil[yy[sel],xx[sel]]=1.4
gil+=R*gm*0.06
wx,wy=fwd(-77.04,38.9); Y,X=np.ogrid[0:H,0:W]
gil+=R*(((X-wx*SC)**2+(Y-wy*SC)**2)<(14*SC)**2)*1.0
L['gilead']=gil
for kk in L: L[kk]=L[kk]*(~NUKE)
AMB=[(0,(0,0,0)),(.05,(34,16,0)),(.22,(140,70,14)),(.45,(232,150,58)),(.7,(255,205,130)),(.9,(255,238,200)),(1,(255,255,245))]
COLD=[(0,(0,0,0)),(.1,(30,40,64)),(.4,(140,165,205)),(.7,(205,222,255)),(1,(255,255,255))]
def lut(st):
    v=np.linspace(0,1,256);o=np.zeros((256,3))
    for ch in range(3): o[:,ch]=np.interp(v,[s[0] for s in st],[s[1][ch] for s in st])
    return o.astype(np.uint8)
def tone(a,lt,gain=1.5):
    d=a*1.0+0.3*gaussian_filter(a,2.0*SC)+0.18*gaussian_filter(a,8*SC)
    t=1-np.exp(-gain*d)
    return lt[np.clip((t*255).astype(int),0,255)]
meta={'W':W0,'H':H0,'scale':SC,'layers':{}}
for name,a in L.items():
    a=a.astype(np.float32)
    ys,xs=np.nonzero(a>0.002)
    if not len(ys): continue
    pad=int(40*SC);x0=max(0,xs.min()-pad);x1=min(W,xs.max()+pad);y0_=max(0,ys.min()-pad);y1_=min(H,ys.max()+pad)
    if name=='static': x0,y0_,x1,y1_=0,0,W,H
    rgb=tone(a[y0_:y1_,x0:x1],lut(COLD if name=='gilead' else AMB))
    fn='night/%s.jpg'%name
    Image.fromarray(rgb).save(B+fn,quality=88 if name=='static' else 85,optimize=True)
    meta['layers'][name]={'file':fn,'x':int(x0),'y':int(y0_),'w':int(x1-x0),'h':int(y1_-y0_)}
    print(name,meta['layers'][name],os.path.getsize(B+fn))
meta['dc']=[float(wx),float(wy)]
json.dump(meta,open(B+'night/layers.json','w'))
# preview composite
comp=np.zeros((H,W,3),np.float32)
for name,m in meta['layers'].items():
    im=np.asarray(Image.open(B+m['file'])).astype(np.float32)
    comp[m['y']:m['y']+m['h'],m['x']:m['x']+m['w']]+=im
Image.fromarray(np.clip(comp,0,255).astype(np.uint8)).resize((W0,H0)).save(B+'night/preview.png')
