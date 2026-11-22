#!/usr/bin/env python3
"""Build site/index.html from site/src.html.

  python3 site/bundle.py site/src.html site/index.html            # default: scripts as external files (small index.html)
  python3 site/bundle.py site/src.html site/index.html --inline   # old behaviour: everything in one ~20 MB file

Markers in src.html (each on its own; replaced verbatim):
  <!--INLINE_JS:a1.js-->        default -> <script src="a1.js?v=<hash>"></script>   (blocking, same order as before)
                                --inline -> <script>…file…</script>
  <!--INLINE_CSS:style.css-->   -> <style>…file…</style> (always inline; small)
  <!--FONTS-->                  -> <style>@font-face …</style>
  <!--DATA:map.topo.json:id-->  -> <script type="application/json" id="id">…</script> (always inline; read synchronously by a1.js)
  __NIGHT_SRC__                 default -> {"layer": "night/layer.jpg?v=<hash>"}   --inline -> data URLs
  __RELIEF_DATAURL__            default -> relief.jpg?v=<hash>                     --inline -> data URL
Why external by default (2026-11-22): a 20 MB HTML has to download and parse before anything shows (LCP ~4 s), it
competes with boot.mp4 while the boot animation plays, and every change means re-uploading 20 MB. External files are
fetched in parallel by the preload scanner, cached separately, and the ?v= hash busts the cache when a file changes.
Scripts stay blocking (no defer) so they run in exactly the same order and at the same point as when inlined.
Never open the big data files yourself; this script inlines them."""
import sys, base64, json, re, os, hashlib
D = os.path.dirname(os.path.abspath(__file__))
args = [a for a in sys.argv[1:] if not a.startswith('--')]
INLINE = '--inline' in sys.argv
src = open(args[0], encoding='utf-8').read()
def rd(f, mode='r'): return open(os.path.join(D, f), mode, **({} if 'b' in mode else {'encoding': 'utf-8'})).read()
def ver(f): return hashlib.sha1(rd(f, 'rb')).hexdigest()[:10]
def font(fam, f, w):
    return "@font-face{font-family:'%s';src:url(data:font/woff2;base64,%s) format('woff2');font-weight:%d;font-display:block}" % (fam, base64.b64encode(rd(f, 'rb')).decode(), w)
if '<!--FONTS-->' in src:
    fonts = '<style>' + font('VT323', 'VT323.woff2', 400) + font('ShareTechMono', 'ShareTechMono.woff2', 400) + font('IBMPlexMono', 'IBMPlexMono-400.woff2', 400) + font('IBMPlexMono', 'IBMPlexMono-600.woff2', 600) + '</style>'
    src = src.replace('<!--FONTS-->', fonts)
if INLINE:
    src = re.sub(r'<!--INLINE_JS:([\w.\-]+)-->', lambda m: '<script>' + rd(m.group(1)).replace('</script', '<\\/script') + '</script>', src)
else:
    src = re.sub(r'<!--INLINE_JS:([\w.\-]+)-->', lambda m: '<script src="%s?v=%s"></script>' % (m.group(1), ver(m.group(1))), src)
src = re.sub(r'<!--INLINE_CSS:([\w.\-]+)-->', lambda m: '<style>' + rd(m.group(1)) + '</style>', src)
def data(m):
    f, i = m.group(1), m.group(2); txt = rd(f)
    if f in ('factions_meta.json', 'cities.json'): txt = json.dumps(json.loads(txt), ensure_ascii=False, indent=1)
    return '<script type="application/json" id="%s">%s</script>' % (i, txt.replace('</', '<\\/'))
src = re.sub(r'<!--DATA:([\w.\-]+):([\w\-]+)-->', data, src)
if INLINE: src = src.replace('__RELIEF_DATAURL__', 'data:image/jpeg;base64,' + base64.b64encode(rd('relief.jpg', 'rb')).decode())
else: src = src.replace('__RELIEF_DATAURL__', 'relief.jpg?v=' + ver('relief.jpg'))
ns = {}
for n in json.loads(rd('night_layers.json'))['layers']:
    f = 'night/%s.jpg' % n
    ns[n] = ('data:image/jpeg;base64,' + base64.b64encode(rd(f, 'rb')).decode()) if INLINE else (f + '?v=' + ver(f))
src = src.replace('__NIGHT_SRC__', json.dumps(ns))
src = src.replace('__BOOT_V__', ver('boot.mp4'))
open(args[1], 'w', encoding='utf-8').write(src)
print('wrote', args[1], len(src), 'bytes', '(inline)' if INLINE else '(external scripts)')
