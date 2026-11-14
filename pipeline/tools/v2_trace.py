# Trace labelled raster into polygons (pixel space) + snap thin lines to real roads -> work/v2/trace_px.json
import numpy as np, json
from scipy import ndimage as ndi
from PIL import Image, ImageDraw
import rasterio.features as rf
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
lab=np.load('../work/v2/labels.npy'); NAMES=json.load(open('../work/v2/names.json'))
H,W=lab.shape
sl=Image.new('L',(W,H),0); d2=ImageDraw.Draw(sl)
for l in json.load(open('../work/v2/states_px.json')): d2.line([tuple(p) for p in l],fill=255,width=9)
stl=np.asarray(sl)>0
roads=json.load(open('../work/v2/roads_px.json'))
_x=[];_y=[];_lo=[];_la=[];_id=[]
for k,r in enumerate(roads):
    px=np.array(r['px']); ll=np.array(r['ll'])
    for a in range(len(px)-1):
        L=max(1,int(np.hypot(*(px[a+1]-px[a]))))
        t=np.arange(L)/L
        _x.append(px[a,0]+(px[a+1,0]-px[a,0])*t); _y.append(px[a,1]+(px[a+1,1]-px[a,1])*t)
        _lo.append(ll[a,0]+(ll[a+1,0]-ll[a,0])*t); _la.append(ll[a,1]+(ll[a+1,1]-ll[a,1])*t); _id.append(np.full(L,k))
RX=np.clip(np.round(np.concatenate(_x)).astype(int),0,W-1); RY=np.clip(np.round(np.concatenate(_y)).astype(int),0,H-1)
RLON=np.concatenate(_lo); RLAT=np.concatenate(_la); RID=np.concatenate(_id)
UP=4
out={'polys':{},'lines':{},'ribbons':{}}
def polys_of(mask,up=UP,smooth=True):
    if smooth:
        m=ndi.zoom(mask.astype(np.float32),up,order=1)
        m=ndi.gaussian_filter(m,up*0.35)>0.5
    else: m=mask
    gs=[shape(g) for g,v in rf.shapes(m.astype(np.uint8),mask=m,connectivity=8)]
    if not gs: return None
    u=unary_union(gs).buffer(0)
    from shapely import affinity
    u=affinity.scale(u,1/up,1/up,origin=(0,0)) if smooth else u
    return u.simplify(0.25)
st=np.ones((3,3),bool)
img=np.asarray(Image.open('../ref/factions_v2.png').convert('RGB')).astype(int)
mx=img.max(-1); mn=img.min(-1)
yel=(img[...,0]>190)&(img[...,1]>150)&(img[...,2]<110)
sl2=Image.new('L',(W,H),0); d3_=ImageDraw.Draw(sl2)
for l in json.load(open('../work/v2/states_px.json')): d3_.line([tuple(p) for p in l],fill=255,width=7)
stl2=np.asarray(sl2)>0
thickall=np.zeros((H,W),bool); TH={}
for i,n in enumerate(NAMES):
    if n in ('gilead','water'): continue
    m=lab==i; t=ndi.binary_opening(m,structure=st); TH[i]=t; thickall|=t
RED=[NAMES.index(x) for x in ('wvbc','utdr','dwg','srl','nafr')]
redthick=np.zeros((H,W),bool)
for i in RED: redthick|=TH[i]
redthin=np.isin(lab,RED)&~redthick
if redthin.any():
    rl=np.where(redthick,lab,0)
    dist,ind=ndi.distance_transform_edt(~redthick,return_indices=True)
    lab=lab.copy(); lab[redthin]=rl[ind[0],ind[1]][redthin]
dark=(mx<150)&(mx-mn<45)&~stl2&~ndi.binary_dilation(yel,iterations=9)&~thickall&(lab>=0)
dark[800:,1690:]=False
bridged=ndi.binary_dilation(dark,iterations=5)
cl,k=ndi.label(bridged,structure=st); sz=ndi.sum(dark,cl,range(1,k+1))
AREA={i:int(TH[i].sum()) for i in TH}
DARK={}
for j in range(k):
    if sz[j]<10: continue
    cb=cl==j+1; c=cb&dark; ys,xs=np.nonzero(cb)
    y0,y1,x0,x1=max(0,ys.min()-6),ys.max()+7,max(0,xs.min()-6),xs.max()+7
    ring=ndi.binary_dilation(cb[y0:y1,x0:x1],iterations=4)
    touch={i:int((TH[i][y0:y1,x0:x1]&ring).sum()) for i in TH}
    touch={i:v for i,v in touch.items() if v>0}
    if not touch: print('darkline',int(sz[j]),'at',int(xs.mean()),int(ys.mean()),'-> NONE'); continue
    best=max(touch,key=lambda i:touch[i])
    DARK.setdefault(best,np.zeros((H,W),bool)); DARK[best]|=c
    print('darkline',int(sz[j]),'at',int(xs.mean()),int(ys.mean()),'->',NAMES[best],{NAMES[i]:v for i,v in touch.items()})
for i,n in enumerate(NAMES):
    if n in ('gilead','water'): continue
    m=lab==i
    if not m.any(): continue
    thick=ndi.binary_opening(m,structure=st)
    # drop specks
    cl,k=ndi.label(thick); sz=ndi.sum(thick,cl,range(1,k+1))
    keep=np.isin(cl,[j+1 for j,s in enumerate(sz) if s>=(4 if n in ('nafr','srl','utdr','dwg') else 14)]); thick&=keep
    thin=m&~ndi.binary_dilation(thick,iterations=1)&~stl
    if i in DARK: thin|=DARK[i]
    # road snapping
    near=ndi.binary_dilation(m&~stl|thick,structure=st)
    ok=near[RY,RX]; tk=~ndi.binary_dilation(thin,structure=st)[RY,RX]
    lines=[]
    # runs of consecutive ok samples within same road piece
    brk=np.nonzero(np.diff(np.r_[0,(ok).astype(int),0])!=0)[0]
    for s0,s1 in zip(brk[::2],brk[1::2]):
        # split by road id
        ids=RID[s0:s1]
        for rid in np.unique(ids):
            sel=np.arange(s0,s1)[ids==rid]
            if len(sel)>=5 and (~tk[sel]).sum()>=4: lines.append(np.c_[RLON[sel],RLAT[sel]].round(5).tolist())
    # thin pixels explained by roads
    used=np.zeros_like(m)
    # (approximate) mark pixels near accepted road runs via re-projection is skipped; ribbons only from thin comps far from any accepted line
    P=polys_of(thick)
    if P is not None and not P.is_empty: out['polys'][n]=mapping(P)
    out['lines'][n]=lines
    thb=ndi.binary_dilation(thin,iterations=2)
    cl,k=ndi.label(thb,structure=st); sz=ndi.sum(thin,cl,range(1,k+1))
    rib=np.isin(cl,[j+1 for j,s in enumerate(sz) if s>=(6 if (n in ('wvbc','utdr','dwg','srl','nafr') or i in DARK) else 15)])&ndi.binary_dilation(thin)
    if rib.any():
        from skimage.morphology import skeletonize
        from shapely.geometry import MultiLineString
        from shapely.ops import linemerge
        sk=skeletonize(ndi.binary_closing(rib|ndi.binary_dilation(rib)&ndi.binary_erosion(ndi.binary_dilation(rib,iterations=2)),structure=st))
        ys,xs=np.nonzero(sk); S=set(zip(ys.tolist(),xs.tolist())); segs=[]
        for (y,x) in S:
            for dy,dx in ((0,1),(1,0),(1,1),(1,-1)):
                if (y+dy,x+dx) in S:
                    if dy==1 and dx!=0 and ((y+1,x) in S or (y,x+dx) in S): continue
                    segs.append(((x+.5,y+.5),(x+dx+.5,y+dy+.5)))
        if segs:
            M=linemerge(MultiLineString(segs)).simplify(0.6)
            out['ribbons'][n]=mapping(M)
    print(n,'thick',int(thick.sum()),'thin',int(thin.sum()),'roadruns',len(lines),'ribbonpx',int(rib.sum()))
json.dump(out,open('../work/v2/trace_px.json','w'))
