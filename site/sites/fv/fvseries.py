# fvseries.py - daily bars Nov 10 2008 - Nov 5 2009 on the in-world calendar, and the Nov 5 intraday session.
# Calendar: NYSE until Fri Feb 13 2009 (Feb 16 Presidents' Day Massacre), closed Feb 17-27, NYSE Mar 2 - Thu May 28,
# closed during the battle for New York, Pacific Exchange (San Francisco) from Mon Aug 3, closed Aug 17-21 after the
# Concord / Mare Island / Kingman / El Toro detonations of Sun Aug 16, open Aug 24 onward; Nov 5 = day after Millington.
import datetime as dt, math, random

HOL = {dt.date(2008, 11, 27), dt.date(2008, 12, 25), dt.date(2009, 1, 1), dt.date(2009, 1, 19), dt.date(2009, 4, 10), dt.date(2009, 5, 25), dt.date(2009, 9, 7)}
OPEN = [(dt.date(2008, 11, 10), dt.date(2009, 2, 13)), (dt.date(2009, 3, 2), dt.date(2009, 5, 28)), (dt.date(2009, 8, 3), dt.date(2009, 8, 14)), (dt.date(2009, 8, 24), dt.date(2009, 11, 5))]
def calendar():
    out = []
    for a, b in OPEN:
        d = a
        while d <= b:
            if d.weekday() < 5 and d not in HOL: out.append(d)
            d += dt.timedelta(1)
    return out
DAYS = calendar()

def month_labels(days):
    out, last = [], None
    for i, d in enumerate(days):
        if i == 0: last = (d.year, d.month); continue
        if (d.year, d.month) != last:
            out.append((i, str(d.year) if d.month == 1 else d.strftime('%b'))); last = (d.year, d.month)
    return out

# log-space dips relative to the straight line from the Feb 13 close to the Nov 4 close
ANCH = [(dt.date(2008, 11, 10), -.02, 0.10), (dt.date(2008, 11, 20), 0, -0.14), (dt.date(2009, 1, 6), 0, 0.12), (dt.date(2009, 2, 13), 0, 0.0),
        (dt.date(2009, 3, 2), .06, -0.20), (dt.date(2009, 3, 10), .12, -0.34), (dt.date(2009, 4, 17), .24, -0.17), (dt.date(2009, 5, 28), .36, -0.42),
        (dt.date(2009, 8, 3), .50, -0.50), (dt.date(2009, 8, 14), .55, -0.40), (dt.date(2009, 8, 24), .60, -0.70),
        (dt.date(2009, 9, 18), .75, -0.30), (dt.date(2009, 10, 15), .88, -0.10), (dt.date(2009, 11, 4), 1.0, 0.0)]

def daily(ticker, base, prev, last, east=0.3, blast=0.0, vol=0.022, vshares=5e6, seed=None, gold=False):
    """base = real Feb 13 2009 close; prev/last = in-world Nov 4 / Nov 5 closes"""
    rnd = random.Random(seed if seed is not None else hash(ticker) & 0xffffffff)
    L0, L1 = math.log(base), math.log(prev)
    def level(fr, dip, d):
        extra = 0
        if d >= dt.date(2009, 5, 28): extra -= 0.12 * east
        if d >= dt.date(2009, 8, 24) and d < dt.date(2009, 10, 15): extra -= 0.35 * blast * (1 if d < dt.date(2009, 9, 18) else .5)
        if gold: dip = -dip * 0.6 if d > dt.date(2009, 2, 13) else dip
        return L0 + fr * (L1 - L0) + dip + extra if d > dt.date(2009, 2, 13) else L0 + dip * 0.8
    anchors = [(d, level(fr, dip, d)) for d, fr, dip in ANCH]
    # Brownian bridge between anchors on the trading calendar
    idx = {d: i for i, d in enumerate(DAYS)}
    logs = [None] * len(DAYS)
    for (da, la), (db, lb) in zip(anchors, anchors[1:]):
        ia, ib = idx[da], idx[db]; n = ib - ia
        w = [0.0]
        for _ in range(n): w.append(w[-1] + rnd.gauss(0, 1))
        for j in range(n + 1):
            t = j / n if n else 0
            logs[ia + j] = la + (lb - la) * t + (w[j] - t * w[n]) * vol * 0.9
    logs[-1] = math.log(last)
    closes = [math.exp(v) for v in logs]
    bars = []
    for i, d in enumerate(DAYS):
        c = closes[i]; p = closes[i - 1] if i else c * (1 + rnd.gauss(0, vol))
        gap = DAYS[i - 1] if i else d
        reopen = i and (d - gap).days > 4
        if d == dt.date(2009, 11, 5): o = p * (1 - 0.045 * (1 if c < p else -1))
        elif reopen: o = p + (c - p) * rnd.uniform(0.6, 0.95)
        else: o = p * (1 + rnd.gauss(0, vol * 0.45))
        rng = abs(rnd.gauss(0, vol * (2.2 if reopen or d == dt.date(2009, 11, 5) else 1.0))) * c + abs(c - o) * 0.25
        h = max(o, c) + rng * rnd.uniform(0.2, 0.7); l = min(o, c) - rng * rnd.uniform(0.2, 0.7)
        mult = 1.0
        if reopen or d in (dt.date(2009, 3, 10), dt.date(2009, 5, 28), dt.date(2009, 11, 5)): mult = rnd.uniform(2.6, 3.8)
        elif d >= dt.date(2009, 8, 3): mult = 0.55
        v = vshares * mult * math.exp(rnd.gauss(0, 0.32)) * (1 + 3 * abs(c / p - 1))
        bars.append(dict(d=d, o=o, h=h, l=max(l, 0.01), c=c, v=v))
    return bars

def intraday(prev, keys, minutes=390, seed=1, vol=0.0011, halts=(), step=5):
    """5-minute OHLC from anchor points [(minute, value)], flat during halts"""
    rnd = random.Random(seed); path = []
    for (m0, v0), (m1, v1) in zip(keys, keys[1:]):
        flat = any(a <= m0 and m1 <= b for a, b in halts)
        n = m1 - m0; w = [0.0]
        for _ in range(n): w.append(w[-1] + rnd.gauss(0, 1))
        for i in range(n):
            t = i / n
            path.append(v0 if flat else v0 + (v1 - v0) * t + (w[i] - t * w[n]) * vol * prev)
    path.append(keys[-1][1])
    out = []
    for m in range(0, minutes, step):
        seg = path[m:m + step + 1]
        out.append((seg[0], max(seg), min(seg), seg[-1]))
    return out


def trendlines(bars, start):
    """FINVIZ-style auto lines over bars[start:]: resistance through the two highest swing highs, support through the two lowest swing lows"""
    seg = range(start, len(bars) - 1)
    hi = sorted(seg, key=lambda i: -bars[i]['h'])
    lo = sorted(seg, key=lambda i: bars[i]['l'])
    def pick(order, gap=12):
        a = order[0]
        for b in order[1:]:
            if abs(b - a) >= gap: return tuple(sorted((a, b)))
        return None
    out = []
    r = pick(hi); s = pick(lo)
    n = len(bars) - 1
    if r:
        a, b = r; slope = (bars[b]['h'] - bars[a]['h']) / (b - a)
        out.append((a, bars[a]['h'], n, bars[a]['h'] + slope * (n - a), (204, 102, 204)))
    if s:
        a, b = s; slope = (bars[b]['l'] - bars[a]['l']) / (b - a); end = bars[a]['l'] + slope * (n - a)
        if end <= max(bars[-1]['c'], bars[-2]['c']) * 1.03: out.append((a, bars[a]['l'], n, end, (90, 170, 230)))
    return out
