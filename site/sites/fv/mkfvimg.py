#!/usr/bin/env python3
# mkfvimg.py - renders every FINVIZ image into res/: index charts, stats bars, maps, screener charts
import os, sys, json, re, math
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import fvrender as R, fvseries as S, fvdata as Dm
RES = os.path.join(HERE, 'res'); SRC = os.path.join(HERE, 'src')
def _font(name):
    for root, _, fs in os.walk('/usr/share/fonts'):
        if name in fs: return os.path.join(root, name)
    return name
R.set_fonts(_font('LiberationSans-Regular.ttf'), _font('LiberationSans-Bold.ttf'))   # metric-compatible with Arial

def arr(src, n):
    m = re.search(r'var ' + n + r'\s*=\s*new Array\((.*?)\);', src, re.S); return json.loads('[' + m.group(1) + ']')
area = open(os.path.join(SRC, 'area.js'), encoding='utf-8').read()
T = arr(area, 'areaTicker_t')
D = Dm.load()

# --- intraday index charts: base layers for Thursday (candles drawn live), complete images for Wednesday (shown before the open) ---
LIVE = json.load(open(os.path.join(HERE, '..', 'live', 'live.json')))
TIMES = [(6, '7AM'), (30, '9AM'), (54, '11AM'), (77, '1PM')]
def ohlc5(vals):
    out = []
    for m in range(0, 390, 5):
        seg = vals[m:m + 6]; out.append((seg[0], max(seg), min(seg), seg[-1]))
    return out
IDX_SPEC = {}
for key, name, fn, akey, wed, prev, prev3 in (('W5000', 'WILSHIRE 5000', 'idx_w5000', 'W5000', 'NOV4', 3391.87, 3406.18), ('R1000', 'RUSSELL 1000', 'idx_r1000', 'R1000', 'R10004', 181.40, 182.31),
                                             ('PSE', 'PSE TECH 100', 'idx_pse', 'PSE', 'PSE4', 461.45, 464.28)):
    IDX_SPEC[key] = R.index_chart(os.path.join(RES, fn + '_base.png'), name, ohlc5(LIVE[akey]), prev, TIMES, '', base=True)
    IDX_SPEC[key].update(prev=prev, name=name)
    R.index_chart(os.path.join(RES, fn + '_nov4.png'), name, ohlc5(LIVE[wed]), prev3, TIMES, 'Nov 04  1:00PM PT')
json.dump(IDX_SPEC, open(os.path.join(HERE, 'idx_specs.json'), 'w'))

# --- market stats bars are drawn live (fv_live.js); these PNGs are only the no-script fallback ---
for i, (l, r, lv, rv) in enumerate((('Advancing', 'Declining', 214, 1661), ('New High', 'New Low', 37, 1094), ('Above SMA50', 'Below SMA50', 288, 1624),
                                     ('Above SMA200', 'Below SMA200', 231, 1681), ('Trading', 'Halted', 1912, 4693))):
    R.stats_bar(os.path.join(RES, 'mktstats_%d.png' % i), l, r, lv, rv)

# --- maps ---
X1, Y1, X2, Y2 = (arr(area, 'areaTicker_' + k) for k in ('x1', 'y1', 'x2', 'y2'))
tiles = [(t, X1[i], Y1[i], X2[i], Y2[i], D[t]['pct'] if D[t]['trading'] else None) for i, t in enumerate(T)]
inds = list(zip(*(arr(area, 'areaIndustry_' + k) for k in ('n', 'x1', 'y1', 'x2', 'y2'))))
secs = list(zip(*(arr(area, 'areaSector_' + k) for k in ('n', 'x1', 'y1', 'x2', 'y2'))))

# --- screener: Signal = Top Losers, charts view ---
allq = {t: dict(D[t]) for t in D if D[t]['trading']}
for t, v in Dm.EXTRA.items(): allq[t] = v
losers = sorted(allq, key=lambda t: allq[t]['pct'])[:20]
ML = S.month_labels(S.DAYS)
VOL = dict(BAC=180e6, WFC=60e6, SCHW=14e6, UCBH=30e6, MGM=22e6, LVS=25e6, XL=8e6)
EAST = dict(BAC=.9, WFC=.35, SCHW=.4, BEN=.5, XL=.6, UCBH=.2)
BLAST = dict(SPF=1, RYL=.4, HCP=.6, PSA=.5, ESS=.7, MAC=.6, KBH=.5, WABC=.9)
U = LIVE['U']
TA_SPEC = {}
for t in losers:
    q = allq[t]; base = Dm.FEB13.get(t) or q.get('feb') or q.get('real', q['prev']) / 1.5
    bars = S.daily(t, base, q['prev'], q['last'], east=EAST.get(t, .25), blast=BLAST.get(t, .2), vshares=VOL.get(t, 3e6), vol=0.03 if q['prev'] < 5 else 0.024)
    P = q['last'] / q['prev'] - 1; amp = 0.06 * abs(P) + 0.004
    day = [q['prev'] * (1 + P * u) for u in U]
    b = bars[-1]; b['o'] = day[0]; b['c'] = q['last']; b['h'] = max(day) * (1 + amp); b['l'] = min(day) * (1 - amp)
    spec = R.ta_chart(os.path.join(RES, 'c_%s_base.png' % t), t, bars, ML, '', q['prev'], lines=S.trendlines(bars, 128), base=True)
    p4 = bars[-2]['c'] / bars[-3]['c'] - 1
    spec.update(prev=q['prev'], P=round(P, 5), p4=round(p4, 5), last4=round(q['prev'], 4), prev3=round(bars[-3]['c'], 4), vday=round(b['v']))
    TA_SPEC[t] = spec
json.dump(TA_SPEC, open(os.path.join(HERE, 'ta_specs.json'), 'w'))
json.dump(losers, open(os.path.join(HERE, 'losers.json'), 'w'))
print('rendered', len(losers), 'screener charts:', ' '.join(losers))
