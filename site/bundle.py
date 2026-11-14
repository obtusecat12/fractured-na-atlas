#!/usr/bin/env python3
"""Inline assets into index.html. Usage: python3 bundle.py src.html index.html
Markers in src.html (each on its own; replaced verbatim):
  <!--INLINE_JS:d3.min.js-->            -> <script>…file…</script>
  <!--INLINE_JS:topojson-client.min.js-->
  <!--INLINE_JS:app.js-->               (your own code file, optional)
  <!--INLINE_CSS:style.css-->           (your own css file, optional)
  <!--FONTS-->                          -> <style>@font-face for VT323, ShareTechMono, IBMPlexMono 400/600</style>
  <!--DATA:map.topo.json:id-->          -> <script type="application/json" id="id">…</script>
  (same for night_layers.json, factions_meta.json (pretty-printed, hand-editable), cities.json, projection.json)
  __NIGHT_SRC__ -> JSON object {layer: jpeg data URL} from night/*.jpg (see night_layers.json)
  __RELIEF_DATAURL__                    -> data:image/jpeg;base64,… (use inside JS string)
Never open the big data files yourself; this script inlines them."""
import sys, base64, json, re, os
D = os.path.dirname(os.path.abspath(__file__))
src = open(sys.argv[1], encoding='utf-8').read()
def rd(f, mode='r'): return open(os.path.join(D, f), mode, **({} if 'b' in mode else {'encoding': 'utf-8'})).read()
def font(fam, f, w):
    return "@font-face{font-family:'%s';src:url(data:font/woff2;base64,%s) format('woff2');font-weight:%d;font-display:block}" % (fam, base64.b64encode(rd(f, 'rb')).decode(), w)
if '<!--FONTS-->' in src: fonts = '<style>' + font('VT323', 'VT323.woff2', 400) + font('ShareTechMono', 'ShareTechMono.woff2', 400) + font('IBMPlexMono', 'IBMPlexMono-400.woff2', 400) + font('IBMPlexMono', 'IBMPlexMono-600.woff2', 600) + '</style>'
if '<!--FONTS-->' in src: src = src.replace('<!--FONTS-->', fonts)
src = re.sub(r'<!--INLINE_JS:([\w.\-]+)-->', lambda m: '<script>' + rd(m.group(1)).replace('</script', '<\\/script') + '</script>', src)
src = re.sub(r'<!--INLINE_CSS:([\w.\-]+)-->', lambda m: '<style>' + rd(m.group(1)) + '</style>', src)
def data(m):
    f, i = m.group(1), m.group(2); txt = rd(f)
    if f in ('factions_meta.json', 'cities.json'): txt = json.dumps(json.loads(txt), ensure_ascii=False, indent=1)
    return '<script type="application/json" id="%s">%s</script>' % (i, txt.replace('</', '<\\/'))
src = re.sub(r'<!--DATA:([\w.\-]+):([\w\-]+)-->', data, src)
src = src.replace('__RELIEF_DATAURL__', 'data:image/jpeg;base64,' + base64.b64encode(rd('relief.jpg', 'rb')).decode())
ns = {}
for n in json.loads(rd('night_layers.json'))['layers']:
    ns[n] = 'data:image/jpeg;base64,' + base64.b64encode(rd('night/%s.jpg' % n, 'rb')).decode()
src = src.replace('__NIGHT_SRC__', json.dumps(ns))
open(sys.argv[2], 'w', encoding='utf-8').write(src)
print('wrote', sys.argv[2], len(src), 'bytes')
