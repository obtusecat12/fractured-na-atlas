
# charts.py - Yahoo! Finance 2009 1-day chart (239x110) in the ichart style, drawn from scratch
# Layout, colours and watermark measured from archived ichart.finance.yahoo.com PNGs (2007-2009).
import numpy as np, random
from PIL import Image, ImageDraw, ImageFont
FILL=(226,233,245); FRAME=(214,220,236); LINE=(67,83,141); RED=(255,0,0); TXT=(110,110,110)
X0,X1,Y0,Y1=55,208,9,95          # frame
def _font(path,size): return ImageFont.truetype(path,size)
def render(series, prev, ylabels, xlabels, top, wm, font, out, ytop=None, ybot=None, minutes=390, ticks=None):
    """series: list of (minute, value). ylabels: values (top label = frame top). xlabels: [(minute, text)]"""
    im=Image.new('RGB',(239,110),'white'); d=ImageDraw.Draw(im)
    vt = ytop if ytop is not None else ylabels[0]; vb = ybot
    def Y(v): return Y0 + (vt - v) * (Y1 - Y0) / (vt - vb)
    def X(m): return X0 + 1 + m * (X1 - X0 - 2) / minutes
    # gridlines (same colour as the area fill)
    for v in ylabels[1:]:
        y=int(round(Y(v))); d.line([(X0+1,y),(X1-1,y)],fill=FILL)
    # area under the line
    pts=[(X(m),Y(v)) for m,v in series]
    poly=[(pts[0][0],Y1-1)]+pts+[(pts[-1][0],Y1-1)]
    d.polygon([(round(x),round(y)) for x,y in poly],fill=FILL)
    # previous close: 3 on / 4 off
    yp=int(round(Y(prev)))
    if Y0<yp<Y1:
        for x in range(X0+2,X1-1):
            if (x-62)%7<3: im.putpixel((x,yp),RED)
    # price line
    d.line([(round(x),round(y)) for x,y in pts],fill=LINE,width=1)
    # frame + hour ticks
    d.rectangle([X0,Y0,X1,Y1],outline=FRAME)
    for h in (ticks if ticks is not None else range(30,minutes+1,60)):
        x=int(round(X(h)))
        if X0<=x<=X1: im.putpixel((x,Y1+1),FILL)
    # watermark (copied pixel colours, measured over the fill)
    for (x,y),c in wm.items(): im.putpixel((x,y),c)
    # labels
    f11=_font(font,11); f9=_font(font,9)
    for v in ylabels:
        s=f"{v:d}" if float(v).is_integer() else f"{v}"
        n=len(s); y=int(round(Y(v)))-4 if v!=ylabels[0] else 5
        x0=48-7*n
        for j,ch in enumerate(s):
            w=d.textlength(ch,font=f11); d.text((x0+7*j+(7-w)/2+0.5,y),ch,font=f11,fill=TXT,anchor='lt')
    for m,s in xlabels:
        d.text((X(m),100),s,font=f11,fill=TXT,anchor='mt')
    d.text((56,0),top,font=f9,fill=TXT,anchor='lt')
    im.quantize(colors=64,method=Image.Quantize.MEDIANCUT).save(out,optimize=True)
    return im

def path(prev, keys, minutes=390, seed=1, vol=0.0009, halts=()):
    """keys: [(minute, value)] anchor points; random-walk bridge between anchors; halts: [(m0,m1)] flat."""
    rnd=random.Random(seed); out=[]
    for (m0,v0),(m1,v1) in zip(keys,keys[1:]):
        flat=any(a<=m0 and m1<=b for a,b in halts)
        n=m1-m0; walk=[0.0]
        for i in range(n): walk.append(walk[-1]+rnd.gauss(0,1))
        for i in range(n):
            t=i/n
            if flat: v=v0
            else:
                br=walk[i]-t*walk[n]
                v=v0+(v1-v0)*t+br*vol*prev
            out.append((m0+i,v))
    out.append(keys[-1]); return out
