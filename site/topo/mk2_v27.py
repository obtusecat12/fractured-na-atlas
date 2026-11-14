# mk2.py — v2.7 topology: canvas 2.5D renderer. Builds ../topopage.js from tpl2.js + geo.json + icons.json
import json, re
g = json.load(open('geo.json'))
DROP = {'Secaucus, NJ','Pittsburgh, PA','Columbus, OH','Omaha, NE','Portland, ME','Buffalo, NY'}
sites = [s for s in g['sites'] if s['name'] not in DROP]
mk = open('mk.py').read()
L = eval(re.search(r"^L=(\[.*?\])\n", mk, re.S | re.M).group(1))
OFF = eval(re.search(r"^OFF=(\{.*?\})\n", mk, re.M).group(1))
S = {s['name'].split(',')[0]: i for i, s in enumerate(sites)}
links = [[S[a], S[b]] for a, b in L]
# firewalls: on link (a,b) at fraction t from a (protected side = a)
FW = [('Los Angeles','Las Vegas',.32), ('Sacramento','Reno',.42), ('Ashburn','Chicago',.3), ('New York','Detroit',.36), ('Seattle','Spokane',.45)]
fws = [[S[a], S[b], t] for a, b, t in FW]
FIRE = ['Chicago', 'Atlanta', 'Phoenix']
D = {
  'W': g['W'], 'H': g['H'], 'nation': g['nation'], 'states': g['states'],
  'sites': [{'x': s['x'], 'y': s['y'], 't': s['type'], 'st': s['st'], 'n': s['name'], 'sub': s.get('sub', ''),
             'off': OFF.get(s['name'].split(',')[0], (0, 0)), 'fire': s['name'].split(',')[0] in FIRE} for s in sites],
  'links': links, 'fw': fws, 'icons': json.load(open('icons.json'))
}
tpl = open('tpl2.js').read()
js = tpl.replace('__TOPO_DATA__', json.dumps(D, separators=(',', ':')).replace('</', '<\\/'))
open('../topopage.js', 'w').write(js)
print('topopage.js', len(js))
