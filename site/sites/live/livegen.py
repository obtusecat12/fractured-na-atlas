#!/usr/bin/env python3
# livegen.py - the 24-hour loop of Thursday Nov 5 2009 (Pacific time) shared by the Yahoo! Finance and FINVIZ replicas.
# Every visit computes "now" in PT and replays the same day: Pacific Exchange 6:30am-1:00pm with the 7:41-8:41 halt,
# London/Frankfurt/Paris 0:00-8:30am PT, Tokyo/Hong Kong for Friday Nov 6 in the evening, metals and crude around the clock.
# Writes live.json (paths) next to this file; live.js reads it in the browser.
import json, math, os, random
HERE = os.path.dirname(os.path.abspath(__file__))

def bridge(prev, keys, seed, vol, halts=(), n=None):
    """per-minute Brownian bridge through anchor points [(minute, value)]; flat inside halts"""
    rnd = random.Random(seed); out = []
    for (m0, v0), (m1, v1) in zip(keys, keys[1:]):
        flat = any(a <= m0 and m1 <= b for a, b in halts)
        k = m1 - m0; w = [0.0]
        for _ in range(k): w.append(w[-1] + rnd.gauss(0, 1))
        for i in range(k):
            t = i / k
            out.append(v0 if flat else v0 + (v1 - v0) * t + (w[i] - t * w[k]) * vol * prev)
    out.append(keys[-1][1])
    return out

def r(v, d=2): return round(v, d)

# ---- Pacific Exchange session (minute 0 = 6:30am PT) ----
W_PREV, W_CLOSE = 3391.87, 3057.04
SHAPE = [(0, .9393), (14, .9261), (33, .9325), (58, .9119), (71, .8999), (131, .8999), (146, .8862), (155, .8801), (178, .8907), (206, .8987),
         (232, .8934), (262, .9069), (290, .9143), (318, .9090), (352, .9046), (374, .8972)]
HALT = (71, 131)                                   # 7:41-8:41am PT
w5000 = bridge(W_PREV, [(m, W_PREV * f) for m, f in SHAPE] + [(390, W_CLOSE)], 11, 0.0011, [HALT])
U = [(v - W_PREV) / (W_CLOSE - W_PREV) for v in w5000]          # 0 = Wednesday close, 1 = Thursday close
# Wednesday Nov 4 (the blast came at 1:41pm PT, after the close): a soft, slightly lower day
nov4 = bridge(3406.18, [(0, 3409.0), (45, 3399.5), (120, 3412.4), (200, 3404.1), (270, 3396.2), (330, 3389.0), (370, 3394.6), (390, 3391.87)], 21, 0.00035)

# ---- 24h curves (minute of day PT) ----
def curve(keys, seed, vol, base):
    return bridge(base, keys, seed, vol)
gold = curve([(0, 2731.0), (180, 2768.0), (390, 2801.0), (470, 2884.0), (600, 2871.0), (780, 2912.5), (960, 2918.0), (1200, 2926.4), (1439, 2931.2)], 31, 0.0004, 2725.2)
oil = curve([(0, 160.4), (240, 163.1), (390, 165.0), (470, 170.2), (600, 168.4), (780, 171.35), (1000, 172.0), (1439, 173.05)], 32, 0.0006, 158.55)
G = [(v - 2725.2) / (2912.5 - 2725.2) for v in gold]            # metals progress, 1 at 1pm PT
tnx = bridge(11.204, [(0, 11.26), (120, 11.31), (210, 11.30), (210 + 1, 11.48), (280, 11.57), (390, 11.625)], 41, 0.00025)   # 10am auction jump

# ---- Europe Nov 5 (0:00-8:30am PT) ----
def europe(prev, close, seed, vol):
    k = [(0, .972), (40, .9635), (95, .9688), (150, .9597), (210, .9652), (270, .9548), (330, .9587), (390, .9532), (450, .9625), (495, .9578)]
    f = close / prev; scale = (1 - f) / (1 - .9607)
    return bridge(prev, [(m, prev * (1 - (1 - x) * scale)) for m, x in k] + [(510, close)], seed, vol)
ftse = europe(3085.51, 2964.18, 5, 0.0008); dax = europe(3219.85, 3071.25, 6, 0.0009); cac = europe(2140.99, 2048.92, 7, 0.0009)

# ---- Asia Fri Nov 6 (evening PT): Tokyo 4pm-10pm PT with lunch, Hong Kong 5:30pm-midnight PT with lunch ----
n225 = bridge(5733.61, [(0, 5611.0), (30, 5574.0), (75, 5590.0), (120, 5552.0), (210, 5552.0), (250, 5521.0), (300, 5537.0), (330, 5509.0), (360, 5512.40)], 51, 0.0009, [(120, 210)])
hsi = bridge(9512.06, [(0, 9322.0), (40, 9287.0), (100, 9304.0), (150, 9251.0), (240, 9251.0), (300, 9219.0), (350, 9240.0), (390, 9201.35)], 52, 0.0009, [(150, 240)])
# Thursday Nov 5 sessions (already closed when the PT day starts): for the daytime charts
n225_5 = bridge(6146.00, [(0, 5844.0), (30, 5790), (75, 5812), (120, 5761), (210, 5761), (250, 5724), (300, 5752), (330, 5739), (360, 5733.61)], 7, 0.0009, [(120, 210)])

# the other two US indexes move with the Wilshire, each with its own small wiggle
def follow(prev, close, seed, nov4_change):
    rnd = random.Random(seed); P = close / prev - 1; a, b = rnd.random() * 6.283, rnd.random() * 6.283
    day = []
    for m, u in enumerate(U):
        w = (0.06 * abs(P) + 0.004) * math.sin(math.pi * m / 390) * (0.6 * math.sin(m / 17 + a) + 0.4 * math.sin(m / 41 + b)) if not (HALT[0] <= m < HALT[1]) else None
        day.append(prev * (1 + P * u + (w if w is not None else 0)))
    for m in range(HALT[0], HALT[1]): day[m] = day[HALT[0] - 1]
    p3 = prev - nov4_change
    wed = [p3 + (v - 3406.18) / (3391.87 - 3406.18) * nov4_change for v in nov4]
    return day, wed
pse, pse4 = follow(461.45, 412.08, 61, -2.83)
r1000, r10004 = follow(181.40, 163.92, 62, -0.91)

LIVE = {
    'U': [r(u, 4) for u in U], 'W5000': [r(v) for v in w5000], 'NOV4': [r(v) for v in nov4], 'HALT': HALT,
    'G': [r(g, 4) for g in G], 'GOLD': [r(v, 1) for v in gold], 'OIL': [r(v) for v in oil], 'TNX': [r(v, 4) for v in tnx],
    'FTSE': [r(v) for v in ftse], 'DAX': [r(v) for v in dax], 'CAC': [r(v) for v in cac],
    'PSE': [r(v) for v in pse], 'R1000': [r(v) for v in r1000], 'PSE4': [r(v) for v in pse4], 'R10004': [r(v) for v in r10004],
    'N225': [r(v) for v in n225], 'HSI': [r(v) for v in hsi], 'N225_5': [r(v) for v in n225_5],
    'IDX': {  # prev close, Thursday close, Wednesday change (shown before the open)
        'W5000': [3391.87, 3057.04, -14.31], 'PSE': [461.45, 412.08, -2.83], 'R1000': [181.40, 163.92, -0.91]},
}

if __name__ == '__main__':
    json.dump(LIVE, open(os.path.join(HERE, 'live.json'), 'w'), separators=(',', ':'))
    print('live.json', os.path.getsize(os.path.join(HERE, 'live.json')), 'bytes; day low', min(w5000), 'at minute', w5000.index(min(w5000)))
