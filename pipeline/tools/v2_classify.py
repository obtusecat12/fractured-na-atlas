# Classify ref/factions_v2.png pixels into faction labels inside the US outline -> work/v2/labels.npy
import numpy as np, json
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
PAL = [('gilead',(222,202,173)),('usg',(1,41,103)),('jefferson',(10,65,131)),('lincoln',(32,96,166)),('sequoyah',(7,106,171)),
 ('fema',(10,29,89)),('frc',(40,52,148)),('agg',(28,106,150)),('lds',(0,105,143)),('texas',(55,143,189)),('wvbc',(121,32,31)),
 ('cascadia',(59,105,58)),('dwg',(157,6,55)),('srl',(240,8,8)),('nafr',(101,57,10)),('utdr',(123,1,1)),('water',(203,229,252))]
NAMES=[p[0] for p in PAL]
img=np.asarray(Image.open('../ref/factions_v2.png').convert('RGB')).astype(np.float32)
H,W,_=img.shape
cols=np.array([p[1] for p in PAL],np.float32)
d=((img[:,:,None,:]-cols[None,None])**2).sum(-1)
lab=d.argmin(-1); dm=d.min(-1)
known=dm<22**2
# nation mask
nm=Image.new('L',(W,H),0); dr=ImageDraw.Draw(nm)
for poly in json.load(open('../work/v2/nation_px.json')):
    for i,r in enumerate(poly): dr.polygon([tuple(p) for p in r],fill=255 if i==0 else 0)
nat=np.asarray(nm)>127
region=ndi.binary_dilation(nat,iterations=4)
region[800:,1690:]=False
# icons (yellow/black trefoils) -> unknown
yel=(img[...,0]>190)&(img[...,1]>150)&(img[...,2]<110)
icon=ndi.binary_dilation(yel,iterations=9)
known&=~icon
W_ID=NAMES.index('water')
lab=np.where(known,lab,-1); lab[~region]=-2
# water inside land: keep as unknown so it's filled by neighbours (lakes are drawn separately)
lab[(lab==W_ID)&nat]=-1
lab[(lab==W_ID)]=-2
sl0=Image.new('L',(W,H),0); d0=ImageDraw.Draw(sl0)
for l in json.load(open('../work/v2/states_px.json')): d0.line([tuple(p) for p in l],fill=255,width=4)
st0=np.asarray(sl0)>0
teal=(img[...,1]>img[...,0]+20)&(img[...,2]>img[...,0]+20)&(img.max(-1)-img.min(-1)<130)
lab[st0&(lab>0)&teal&~ndi.binary_opening(lab>0,iterations=2)]=-1
# nearest-label fill of unknowns within region
unk=(lab==-1)
idx=ndi.distance_transform_edt(lab<0,return_distances=False,return_indices=True)
filled=lab[idx[0],idx[1]]
filled[~region]=-2
# fill region pixels that only see -2 (ocean): fallback gilead
filled[(filled<0)&region]=0
np.save('../work/v2/labels.npy',filled.astype(np.int16))
json.dump(NAMES,open('../work/v2/names.json','w'))
cnt={NAMES[i]:int((filled==i).sum()) for i in range(len(NAMES)-1)}
print(cnt)
# preview
rgb=np.zeros((H,W,3),np.uint8)+255
for i,(n,c) in enumerate(PAL[:-1]): rgb[filled==i]=c
Image.fromarray(rgb).save('../work/v2/labels_preview.png')
# ---- thin (anti-aliased) line pixels: unmix against tan background ----
tan=np.array(PAL[0][1],np.float32)
cand=[(i,np.array(c,np.float32)) for i,(n,c) in enumerate(PAL) if n not in ('gilead','water')]
cand.append((-9,np.array((50,135,145),np.float32)))  # default teal river/state line (distractor)
cand.append((-9,np.array((90,90,90),np.float32)))    # grey/black outlines (distractor)
P=img.reshape(-1,3); best=np.full(len(P),1e9,np.float32); bl=np.full(len(P),-1,np.int32); ba=np.zeros(len(P),np.float32)
for i,c in cand:
    v=c-tan; a=np.clip(((P-tan)@v)/(v@v),0,1)   # weight of colour c
    r=np.sqrt(((P-(tan+a[:,None]*v))**2).sum(1))
    m=r<best; best[m]=r[m]; bl[m]=i; ba[m]=a[m]
wat=np.array(PAL[-1][1],np.float32)
for i,c in cand:
    if i>=0 and NAMES[i] not in ('wvbc','utdr','dwg','srl','nafr'): continue
    v=c-wat; a=np.clip(((P-wat)@v)/(v@v),0,1)
    r=np.sqrt(((P-(wat+a[:,None]*v))**2).sum(1))
    m=r<best; best[m]=r[m]; bl[m]=i; ba[m]=a[m]
bl=bl.reshape(H,W); best=best.reshape(H,W); ba=ba.reshape(H,W)
sl=Image.new('L',(W,H),0); d2=ImageDraw.Draw(sl)
for l in json.load(open('../work/v2/states_px.json')): d2.line([tuple(p) for p in l],fill=255,width=4)
stl=np.asarray(sl)>0
thin=(bl>=0)&(best<16)&(ba>=0.35)&region&~icon&((filled==0)|(lab==-2)|(lab==-1))&~stl&((img.max(-1)-img.min(-1))>=45)&ndi.binary_dilation(nat,iterations=3)
lab2=filled.copy(); lab2[thin]=bl[thin]
np.save('../work/v2/labels.npy',lab2.astype(np.int16))
print('thin px',int(thin.sum()),{NAMES[i]:int((thin&(bl==i)).sum()) for i in range(len(NAMES)-1) if (thin&(bl==i)).sum()})
for i,(n,c) in enumerate(PAL[:-1]): rgb[lab2==i]=c
Image.fromarray(rgb).save('../work/v2/labels_preview.png')
