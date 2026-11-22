#!/usr/bin/env python3
# mkcharts.py - draws the three Market Summary charts into res/ (run before mkyf.py).
# Pacific Exchange session 6:30am-1:00pm PT; FTSE 8:00-16:30 London; Nikkei 9:00-15:00 Tokyo (lunch drawn flat).
import os, json
from charts import render, path, Y0, Y1
HERE = os.path.dirname(os.path.abspath(__file__)); RES = os.path.join(HERE, 'res')
FONT = '/usr/share/fonts/dejavu/DejaVuSans.ttf'   # Verdana-like; any DejaVu Sans path works
for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu-sans-fonts/DejaVuSans.ttf'):
    if os.path.exists(f): FONT = f
WM = {(x, y): tuple(c) for x, y, c in json.load(open(os.path.join(HERE, 'wm.json')))}   # "(c)Yahoo! Inc" pixels from an archived chart
def bottom_for(labels): return labels[0] - (Y1 - Y0) * (labels[0] - labels[-1]) / (88 - Y0)   # lowest label sits at y=88 as in the originals

# Wilshire 5000, Thu Nov 5 2009: gap down, -10% at 7:41 -> one-hour market-wide halt, low after the reopen, partial rebound
prev = 3391.87
keys = [(0, 3186.0), (14, 3141), (33, 3163), (58, 3093), (71, 3052.2), (131, 3052.2), (146, 3006), (155, 2985.3), (178, 3021), (206, 3048),
        (232, 3030), (262, 3076), (290, 3101), (318, 3083), (352, 3068), (374, 3043), (390, 3057.04)]
L = [3400, 3300, 3200, 3100, 3000]
render(path(prev, keys, seed=11, vol=0.0011, halts=[(71, 131)]), prev, L, [(30, '7am'), (150, '9am'), (270, '11am'), (390, '1pm')],
       'Nov  5, 1:00pm', WM, FONT, os.path.join(RES, 'chart_w5000.png'), ytop=L[0], ybot=bottom_for(L))
# FTSE 100
prev = 3085.51
keys = [(0, 2998.0), (40, 2972), (95, 2989), (150, 2961), (210, 2978), (270, 2946), (330, 2958), (390, 2941.2), (450, 2970), (495, 2955), (510, 2964.18)]
L = [3100, 3050, 3000, 2950]
render(path(prev, keys, minutes=510, seed=5, vol=0.0008), prev, L, [(60, '9am'), (180, '11am'), (300, '1pm'), (420, '3pm')],
       'Nov  5, 4:35pm', WM, FONT, os.path.join(RES, 'chart_ftse.png'), ytop=L[0], ybot=bottom_for(L), minutes=510, ticks=range(0, 511, 60))
# Nikkei 225
prev = 6146.00
keys = [(0, 5844.0), (30, 5790), (75, 5812), (120, 5761), (210, 5761), (250, 5724), (300, 5752), (330, 5739), (360, 5733.61)]
L = [6200, 6000, 5800, 5600]
render(path(prev, keys, minutes=360, seed=7, vol=0.0009, halts=[(120, 210)]), prev, L, [(60, '10am'), (180, '12pm'), (300, '2pm')],
       'Nov  5, 3:00pm', WM, FONT, os.path.join(RES, 'chart_n225.png'), ytop=L[0], ybot=bottom_for(L), minutes=360, ticks=range(0, 361, 60))
print('charts written to', RES)
