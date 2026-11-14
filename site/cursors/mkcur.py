#!/usr/bin/env python3
"""Build site/cursors.js from the Windows 7 Aero cursor PNGs in this folder.
Source: Windows 7 default Aero cursor set (aero_*.cur / aero_busy.ani / aero_working.ani),
via the Xcursor port https://github.com/lLexian/Windows-7-Aero-Cursors_Linux (Default theme),
which repackages http://www.rw-designer.com/cursor-set/windows-7-rip . (c) Microsoft; used as a
period-accurate replica reference only. Frames were decoded from Xcursor at the 32px nominal size,
alpha un-premultiplied, hotspots and frame delays kept from the files (see cursors.json).
Usage: python3 site/cursors/mkcur.py   (then run bundle.py as usual)"""
import base64, json, os
D = os.path.dirname(os.path.abspath(__file__))
meta = json.load(open(os.path.join(D, 'cursors.json')))
out = {}
for k, m in meta.items():
    files = [k + '.png'] if m['frames'] == 1 else ['%s_%02d.png' % (k, i) for i in range(m['frames'])]
    out[k] = {'hot': m['hot'], 'delay': m['delay'],
              'f': ['data:image/png;base64,' + base64.b64encode(open(os.path.join(D, f), 'rb').read()).decode() for f in files]}
tpl = open(os.path.join(D, 'cursors_tpl.js'), encoding='utf-8').read()
js = tpl.replace('/*W7C_DATA*/{}', json.dumps(out, separators=(',', ':')))
open(os.path.join(D, '..', 'cursors.js'), 'w', encoding='utf-8').write(js)
print('wrote cursors.js', len(js), 'bytes')
