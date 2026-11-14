import json,math
g=json.load(open('geo.json')); W,H=g['W'],g['H']
DROP={'Secaucus, NJ','Pittsburgh, PA','Columbus, OH','Omaha, NE','Portland, ME','Buffalo, NY'}
g['sites']=[x for x in g['sites'] if x['name'] not in DROP]
OFF={'Quincy':(40,-10),'New York':(34,-6),'Boston':(26,-12),'Washington':(14,8),'Seattle':(-30,0),'Houston':(22,6),'San Antonio':(-22,0),'Denver':(-22,0),'Council Bluffs':(-14,-4),'Kansas City':(6,0),'Lenoir':(-36,-56),'Santa Clara':(-18,0),'Las Vegas':(16,-2),'Ashburn':(-52,-14)}
S={s['name'].split(',')[0]:s for s in g['sites']}
L=[('Seattle','Quincy'),('Seattle','The Dalles'),('Seattle','Spokane'),('Spokane','Billings'),('Billings','Bismarck'),('Bismarck','Minneapolis'),('Minneapolis','Chicago'),
('The Dalles','Boise'),('Boise','Salt Lake City'),('The Dalles','Sacramento'),('Sacramento','Santa Clara'),('Sacramento','Reno'),('Reno','Salt Lake City'),('Santa Clara','Los Angeles'),
('Los Angeles','Las Vegas'),('Los Angeles','Phoenix'),('Las Vegas','Salt Lake City'),('Salt Lake City','Cheyenne'),('Cheyenne','Denver'),('Denver','Colorado Springs'),
('Denver','Kansas City'),('Phoenix','El Paso'),('El Paso','Albuquerque'),('Albuquerque','Amarillo'),('Amarillo','Oklahoma City'),('Oklahoma City','Dallas'),('El Paso','San Antonio'),
('San Antonio','Houston'),('Dallas','Houston'),('Dallas','Kansas City'),('Kansas City','St. Louis'),('Kansas City','Council Bluffs'),('Council Bluffs','Chicago'),
('St. Louis','Chicago'),('St. Louis','Nashville'),('Dallas','Memphis'),('Memphis','Nashville'),('Houston','New Orleans'),('New Orleans','Atlanta'),('Nashville','Atlanta'),
('Atlanta','Jacksonville'),('Jacksonville','Miami'),('Atlanta','Charlotte'),('Charlotte','Lenoir'),('Charlotte','Ashburn'),('Ashburn','Washington'),('Ashburn','Chicago'),('Chicago','Detroit'),('Detroit','New York'),('Ashburn','New York'),('New York','Boston'),('Seattle','Anchorage'),('Los Angeles','Honolulu')]
def bad(s): return s['st']!='ok'
o=[]
o.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Tahoma,Verdana,Segoe UI,sans-serif">')
o.append('''<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b8fdc"/><stop offset=".55" stop-color="#1d5aa8"/><stop offset="1" stop-color="#0a2b63"/></linearGradient>
<radialGradient id="vg" cx=".5" cy=".42" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient>
<linearGradient id="land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe3f8"/><stop offset=".5" stop-color="#93bdea"/><stop offset="1" stop-color="#6a9fd9"/></linearGradient>
<filter id="ds" x="-10%" y="-10%" width="130%" height="130%"><feGaussianBlur in="SourceAlpha" stdDeviation="4"/><feOffset dx="5" dy="7"/><feComponentTransfer><feFuncA type="linear" slope=".55"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="ds2" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur in="SourceAlpha" stdDeviation="1.6"/><feOffset dx="2" dy="3"/><feComponentTransfer><feFuncA type="linear" slope=".6"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<linearGradient id="rb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0c3f86"/><stop offset=".35" stop-color="#3f8fe6"/><stop offset=".6" stop-color="#2a74cf"/><stop offset="1" stop-color="#0b3577"/></linearGradient>
<linearGradient id="rt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe0ff"/><stop offset="1" stop-color="#5aa2ee"/></linearGradient>
<linearGradient id="kf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2b2f36"/><stop offset=".5" stop-color="#4a515c"/><stop offset="1" stop-color="#23272d"/></linearGradient>
<linearGradient id="ks" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a1d22"/><stop offset="1" stop-color="#3a4049"/></linearGradient>
<linearGradient id="kt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d7dde5"/><stop offset="1" stop-color="#8d96a3"/></linearGradient>
<linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".5" stop-color="#fff" stop-opacity=".18"/><stop offset=".51" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient>
<linearGradient id="xr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a6e"/><stop offset=".5" stop-color="#e01b12"/><stop offset="1" stop-color="#8e0703"/></linearGradient>
<radialGradient id="qy" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#fff6b0"/><stop offset=".55" stop-color="#f6c51c"/><stop offset="1" stop-color="#a87400"/></radialGradient>
<radialGradient id="sh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<symbol id="router" viewBox="-22 -18 44 36" overflow="visible">
 <ellipse cx="2" cy="14" rx="22" ry="6" fill="url(#sh)"/>
 <path d="M-19 -6v12a19 7 0 0 0 38 0v-12z" fill="url(#rb)" stroke="#06244f" stroke-width=".8"/>
 <ellipse cx="0" cy="-6" rx="19" ry="7" fill="url(#rt)" stroke="#06244f" stroke-width=".8"/>
 <g fill="#fff" stroke="#0b3a7a" stroke-width=".4"><path d="M-13 -6l4-2.2v1.4h4v1.6h-4v1.4z"/><path d="M13 -6l-4 2.2v-1.4h-4v-1.6h4v-1.4z"/><path d="M-3 -11.5l5 0 -2.5 2.3z"/><path d="M-2.5 -.5l5 0 -2.5-2.3z"/></g>
 <path d="M-17 -2a19 7 0 0 0 34 0" fill="none" stroke="#9fd0ff" stroke-opacity=".6"/>
</symbol>
<symbol id="rack" viewBox="-20 -30 40 60" overflow="visible">
 <ellipse cx="4" cy="25" rx="20" ry="5" fill="url(#sh)"/>
 <path d="M-14 -20l6-6h20l-6 6z" fill="url(#kt)" stroke="#111" stroke-width=".6"/>
 <path d="M6 -20l6-6v44l-6 6z" fill="url(#ks)" stroke="#111" stroke-width=".6"/>
 <rect x="-14" y="-20" width="20" height="44" fill="url(#kf)" stroke="#111" stroke-width=".6"/>
 <g fill="#8a939f">''' + ''.join(f'<rect x="-12" y="{-18+i*5.2}" width="16" height="3.6" rx=".4"/>' for i in range(8)) + '''</g>
 <g>''' + ''.join(f'<rect x="1.4" y="{-17.2+i*5.2}" width="1.6" height="1.6" fill="{["#3dff4a","#3dff4a","#ffb300","#3dff4a"][i%4]}"/>' for i in range(8)) + '''</g>
 <rect x="-14" y="-20" width="20" height="44" fill="url(#gl)" opacity=".5"/>
</symbol>
<symbol id="tower" viewBox="-14 -26 28 52" overflow="visible">
 <ellipse cx="2" cy="23" rx="12" ry="3.5" fill="url(#sh)"/>
 <path d="M-8 22L0 -16 8 22" fill="none" stroke="#7d0e0e" stroke-width="2.2"/><path d="M-8 22L0 -16 8 22" fill="none" stroke="#e8e8e8" stroke-width="1.2" stroke-dasharray="5 4"/>
 <path d="M-6 14L4 4M6 14L-4 4M-4 4L2 -6M4 4L-2 -6" stroke="#9aa3ad" stroke-width=".8"/>
 <rect x="-1.2" y="-22" width="2.4" height="7" fill="#c7cdd4" stroke="#444" stroke-width=".4"/><circle cx="0" cy="-22.5" r="1.6" fill="#ff3020"/>
 <g fill="none" stroke="#c6ecff" stroke-width="1.3" stroke-linecap="round"><path d="M5 -24a7 7 0 0 1 0 9"/><path d="M8.5 -27a12 12 0 0 1 0 15"/><path d="M-5 -24a7 7 0 0 0 0 9"/><path d="M-8.5 -27a12 12 0 0 0 0 15"/></g>
</symbol>
<symbol id="xmark" viewBox="-12 -12 24 24" overflow="visible"><g stroke-linecap="round"><path d="M-8 -8L8 8M8 -8L-8 8" stroke="#4a0200" stroke-width="7.5"/><path d="M-8 -8L8 8M8 -8L-8 8" stroke="url(#xr)" stroke-width="5.5"/><path d="M-7 -8.5L-3 -4.5M7 -8.5L3 -4.5" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/></g></symbol>
<symbol id="qmark" viewBox="-11 -11 22 22" overflow="visible"><circle r="9.5" fill="url(#qy)" stroke="#5a3d00" stroke-width="1"/><ellipse cx="0" cy="-4.5" rx="6.5" ry="3.8" fill="#fff" opacity=".45"/><text y="5" text-anchor="middle" font-size="14" font-weight="bold" fill="#3b2600" font-family="Arial">?</text></symbol>
</defs>''')
o.append(f'<rect width="{W}" height="{H}" fill="url(#bg)"/>')
# faint grid like a Visio page
o.append('<g stroke="#fff" stroke-opacity=".06">'+''.join(f'<path d="M{x} 0V{H}"/>' for x in range(0,W,20))+''.join(f'<path d="M0 {y}H{W}"/>' for y in range(0,H,20))+'</g>')
o.append(f'<path d="{g["nation"]}" fill="url(#land)" stroke="#fff" stroke-width="1.6" filter="url(#ds)"/>')
o.append(f'<path d="{g["states"]}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width=".6"/>')
o.append(f'<rect width="{W}" height="{H}" fill="url(#vg)"/>')
# links
for a,b in L:
    A,B=S[a],S[b]; d=f'M{A["x"]} {A["y"]}L{B["x"]} {B["y"]}'
    if bad(A) or bad(B):
        o.append(f'<path d="{d}" stroke="#0a234d" stroke-width="4" stroke-dasharray="7 5" opacity=".7"/><path d="{d}" stroke="#ffd34d" stroke-width="2" stroke-dasharray="7 5"/>')
    else:
        o.append(f'<path d="{d}" stroke="#0a234d" stroke-width="4.5" opacity=".75"/><path d="{d}" stroke="#7fe36b" stroke-width="2.4"/><path d="{d}" stroke="#eaffdf" stroke-width=".7" opacity=".8"/>')
# nodes
for s in g['sites']:
    x,y=s['x'],s['y']; t=s['type']
    sym,w,h={'ix':('router',36,29),'dc':('rack',26,39),'tw':('tower',18,34)}[t]
    o.append(f'<use href="#{sym}" x="{x-w/2}" y="{y-h/2-4}" width="{w}" height="{h}" filter="url(#ds2)"/>')
    if s['st']=='gilead': o.append(f'<use href="#xmark" x="{x-11}" y="{y-15}" width="22" height="22"/>')
    elif s['st']=='silence': o.append(f'<use href="#qmark" x="{x+3}" y="{y-24}" width="17" height="17"/>')
    o.append(f'<title>{s["name"]}</title>') if False else None
    if t!='tw':
        nm=s['name']; sub=s['sub']; dx,dy=OFF.get(nm.split(',')[0],(0,0)); x=x+dx; y=y+dy
        fs=9.5 if t!='tw' else 8.5
        o.append(f'<text x="{x}" y="{y+h/2+7}" text-anchor="middle" font-size="{fs}" font-weight="bold" fill="#fff" stroke="#062456" stroke-width="2.6" paint-order="stroke" stroke-linejoin="round">{nm}</text>')
        if sub: o.append(f'<text x="{x}" y="{y+h/2+17}" text-anchor="middle" font-size="8" fill="#d8ecff" stroke="#062456" stroke-width="2.2" paint-order="stroke" stroke-linejoin="round">{sub.replace("&","&amp;")}</text>')
# header ribbon
o.append(f'''<g filter="url(#ds2)"><rect x="12" y="10" width="{W-24}" height="30" rx="5" fill="#0d2f66" stroke="#9cc6f2" stroke-width="1"/><rect x="13" y="11" width="{W-26}" height="14" rx="4" fill="#fff" opacity=".18"/></g>
<text x="26" y="30" font-size="13" font-weight="bold" fill="#fff">NATIONAL COMMUNICATIONS SYSTEM · BACKBONE STATUS</text>
<text x="{W-24}" y="30" font-size="10" fill="#bfe0ff" text-anchor="end">NCS-NOC · 11/04/2009 17:12 EST</text>''')
# legend strip (Gulf of Mexico)
lx,ly=318,H-44
o.append(f'<g filter="url(#ds2)"><rect x="{lx}" y="{ly}" width="350" height="36" rx="5" fill="#0d2f66" fill-opacity=".88" stroke="#9cc6f2"/></g>')
it=[('<use href="#router" x="{X}" y="{Y}" width="18" height="14"/>','Exchange'),('<use href="#rack" x="{X}" y="{Y}" width="11" height="17"/>','Data center'),('<use href="#tower" x="{X}" y="{Y}" width="9" height="17"/>','Relay'),
    ('<path d="M{X} {Y2}h16" stroke="#7fe36b" stroke-width="2.4"/>','Up'),('<path d="M{X} {Y2}h16" stroke="#ffd34d" stroke-width="2" stroke-dasharray="5 3"/>','Degraded'),
    ('<use href="#xmark" x="{X}" y="{Y}" width="13" height="13"/>','Lost'),('<use href="#qmark" x="{X}" y="{Y}" width="13" height="13"/>','No telemetry')]
cx=lx+8
for k,(sv,t) in enumerate(it):
    row=k//4; col=k%4; X=lx+8+col*86; Y=ly+3+row*16
    o.append(sv.replace('{X}',str(X)).replace('{Y}',str(Y)).replace('{Y2}',str(Y+8)))
    o.append(f'<text x="{X+20}" y="{Y+11}" font-size="9" fill="#e6f2ff">{t}</text>')
o.append('</svg>')
open('topo.svg','w').write('\n'.join(o)); print(sum(len(x) for x in o))
