#!/usr/bin/env python3
# mkcharts.py - Market Summary charts for the live page: static base layers (grid, axis, labels) for the sessions that
# are drawn live in the browser, and complete images for sessions that are already over (Wednesday US, Thursday Tokyo).
# Paths come from ../../live/live.json (livegen.py), the same numbers live.js uses.
import os, json
from charts import render, Y0, Y1
HERE = os.path.dirname(os.path.abspath(__file__)); RES = os.path.join(HERE, 'res')
LIVE = json.load(open(os.path.join(HERE, '..', 'live', 'live.json')))
FONT = None
for root, _, fs in os.walk('/usr/share/fonts'):
    if 'DejaVuSans.ttf' in fs: FONT = os.path.join(root, 'DejaVuSans.ttf')      # Verdana-like
WM = {(x, y): tuple(c) for x, y, c in json.load(open(os.path.join(HERE, 'wm.json')))}   # "(c)Yahoo! Inc" pixels from an archived chart
def bottom_for(labels): return labels[0] - (Y1 - Y0) * (labels[0] - labels[-1]) / (88 - Y0)   # lowest label sits at y=88 as in the originals
def ser(vals): return list(enumerate(vals))
US_X = [(30, '7am'), (150, '9am'), (270, '11am'), (390, '1pm')]
SPEC = {}
L = [3400, 3300, 3200, 3100, 3000]
SPEC['us'] = dict(render([], 3391.87, L, US_X, '', WM, FONT, os.path.join(RES, 'chart_w5000_base.png'), ytop=L[0], ybot=bottom_for(L), base=True), prev=3391.87)
L4 = [3415, 3410, 3405, 3400, 3395, 3390]
render(ser(LIVE['NOV4']), 3406.18, L4, US_X, 'Nov  4, 1:00pm', WM, FONT, os.path.join(RES, 'chart_w5000_nov4.png'), ytop=L4[0], ybot=bottom_for(L4))
LF = [3100, 3050, 3000, 2950]
SPEC['eu'] = dict(render([], 3085.51, LF, [(60, '9am'), (180, '11am'), (300, '1pm'), (420, '3pm')], '', WM, FONT, os.path.join(RES, 'chart_ftse_base.png'), ytop=LF[0], ybot=bottom_for(LF), minutes=510, ticks=range(0, 511, 60), base=True), prev=3085.51)
LN = [6200, 6000, 5800, 5600]
render(ser(LIVE['N225_5']), 6146.00, LN, [(60, '10am'), (180, '12pm'), (300, '2pm')], 'Nov  5, 3:00pm', WM, FONT, os.path.join(RES, 'chart_n225.png'), ytop=LN[0], ybot=bottom_for(LN), minutes=360, ticks=range(0, 361, 60))
LN6 = [5750, 5700, 5650, 5600, 5550, 5500]
SPEC['asia'] = dict(render([], 5733.61, LN6, [(60, '10am'), (180, '12pm'), (300, '2pm')], '', WM, FONT, os.path.join(RES, 'chart_n225_nov6_base.png'), ytop=LN6[0], ybot=bottom_for(LN6) - 4, minutes=360, ticks=range(0, 361, 60), base=True), prev=5733.61)
wm = [[x, y, list(c)] for (x, y), c in WM.items()]
for k in SPEC: SPEC[k]['wm'] = wm; SPEC[k]['stamp'] = ''
json.dump(SPEC, open(os.path.join(HERE, 'yf_specs.json'), 'w'))
print('charts + specs written', {k: (round(v['ytop']), round(v['ybot'])) for k, v in SPEC.items()})
