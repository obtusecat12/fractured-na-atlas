# fvrender.py - FINVIZ 2009 image engine: daily TA charts (460x230), intraday index charts (330x160),
# market-stats bars (180x24) and the S&P 500 map (800x600 / 400x300).
# Colours and geometry measured from archived finviz.com chart.ashx / sec_z-1.png / scale_tab.gif images.
# Text is drawn with ClearType-style RGB subpixel coverage, as GDI rendered it on the 2009 servers.
import math, numpy as np
from PIL import Image, ImageDraw, ImageFont

FONT_R = FONT_B = None
def set_fonts(regular, bold):
    global FONT_R, FONT_B; FONT_R, FONT_B = regular, bold

_fc = {}
def font(bold, size):
    k = (bold, size)
    if k not in _fc: _fc[k] = ImageFont.truetype(FONT_B if bold else FONT_R, size)
    return _fc[k]

def text_mask(s, bold, size, sub=True):
    """coverage mask; with sub=True it is 3x wide (one column per subpixel)"""
    f = font(bold, size * 3) if sub else font(bold, size)
    l, t, r, b = f.getbbox(s)
    if sub:
        w, h = r + 6, (b + 6)
        m = Image.new('L', (w, h)); ImageDraw.Draw(m).text((0, 0), s, font=f, fill=255)
        a = np.asarray(m, dtype=np.float32) / 255.0
        hh = a.shape[0] // 3 * 3; a = a[:hh].reshape(hh // 3, 3, a.shape[1]).mean(1)          # vertical box-down to 1x
        k = np.array([1, 2, 3, 2, 1], np.float32) / 9.0                                          # ClearType FIR over subpixels
        a = np.apply_along_axis(lambda r: np.convolve(r, k, 'same'), 1, a)
        ww = a.shape[1] // 3 * 3; a = a[:, :ww].reshape(a.shape[0], ww // 3, 3)
        return np.clip(a * 1.15, 0, 1), (l // 3, t // 3)
    m = Image.new('L', (r + 2, b + 2)); ImageDraw.Draw(m).text((0, 0), s, font=f, fill=255)
    a = np.asarray(m, dtype=np.float32) / 255.0
    return np.repeat(a[:, :, None], 3, 2), (l, t)

def text_size(s, bold, size):
    m, (l, t) = text_mask(s, bold, size)
    ys, xs = np.nonzero(m.max(2) > 0.25)
    if not len(xs): return 0, 0, 0, 0
    return xs.min(), ys.min(), xs.max() - xs.min() + 1, ys.max() - ys.min() + 1

def draw_text(img, xy, s, color, bold=False, size=11, anchor='lt', sub=True, shadow=None):
    """anchor: l/c/r + t/m/b on the ink box"""
    m, _ = text_mask(s, bold, size, sub)
    ink = m.max(2) > 0.2
    ys, xs = np.nonzero(ink)
    if not len(xs): return
    x0i, y0i, wi, hi = xs.min(), ys.min(), xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
    x, y = xy
    x -= {'l': 0, 'c': wi / 2, 'r': wi}[anchor[0]]; y -= {'t': 0, 'm': hi / 2, 'b': hi}[anchor[1]]
    ox, oy = int(round(x)) - x0i, int(round(y)) - y0i
    if shadow:
        dx, dy, sc = shadow
        _blend(img, m, ox + dx, oy + dy, sc)
    _blend(img, m, ox, oy, color)
    return int(round(x)), int(round(y)), wi, hi

def _blend(img, m, ox, oy, color):
    a = np.asarray(img).astype(np.float32)
    H, W = a.shape[:2]; h, w = m.shape[:2]
    x0, y0, x1, y1 = max(0, ox), max(0, oy), min(W, ox + w), min(H, oy + h)
    if x0 >= x1 or y0 >= y1: return
    mm = m[y0 - oy:y1 - oy, x0 - ox:x1 - ox]
    reg = a[y0:y1, x0:x1, :3]
    c = np.array(color[:3], np.float32)
    a[y0:y1, x0:x1, :3] = reg * (1 - mm) + c * mm
    img.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), img.mode))

def dashed_h(d, y, x0, x1, c=(210, 210, 210), on=3, off=3, phase=0):
    x = x0
    while x <= x1:
        if (x - x0 + phase) % (on + off) < on: d.point((x, y), fill=c)
        x += 1
def dashed_v(d, x, y0, y1, c=(210, 210, 210), on=3, off=3):
    for y in range(y0, y1 + 1):
        if (y - y0) % (on + off) < on: d.point((x, y), fill=c)

GREEN, GREEN_D, RED, RED_D = (0, 180, 0), (0, 120, 0), (180, 0, 0), (120, 0, 0)
VOL_G, VOL_R = (168, 224, 168), (255, 192, 192)
GRAY = (130, 130, 130)
SMA50, SMA200 = (255, 166, 94), (236, 216, 152)
TL_RES, TL_SUP = (204, 102, 204), (90, 170, 230)
LOGO = (130, 175, 217)

def nice_step(lo, hi, n=8):
    span = (hi - lo) / n
    for s in (0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000):
        if s >= span: return s
    return 1000

def fmt_price(v, step):
    if v >= 100 and step >= 1: return '%.0f' % v
    return '%.2f' % v

def logo(img, x, y):
    """the (c)-style roundel + 'finviz.com' at top right"""
    d = ImageDraw.Draw(img)
    d.ellipse([x, y + 1, x + 7, y + 8], outline=LOGO)
    d.arc([x + 2, y + 3, x + 5, y + 6], 40, 320, fill=LOGO)
    draw_text(img, (x + 10, y + 1), 'finviz.com', LOGO, False, 11)

def vtext(img, cx, cy, s, color, size=11, bold=True):
    """vertical text reading bottom-to-top (the grey DAILY on the left)"""
    m, _ = text_mask(s, bold, size, sub=False)
    ink = m.max(2) > 0.05; ys, xs = np.nonzero(ink)
    m = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    m = np.rot90(m, 1)
    h, w = m.shape[:2]
    _blend(img, m, int(cx - w / 2), int(cy - h / 2), color)

def _vol_titles(img, d, bars, vmax, label_vol, ticker, title_date, sma):
    if label_vol:
        step = [1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6, 2e6, 5e6, 1e7, 2e7, 5e7, 1e8, 2e8, 5e8, 1e9, 2e9]
        vs = next((s for s in step if vmax / s <= 3.2), step[-1])
        k = 1
        while k * vs < vmax * 0.97:
            y = 215 - k * vs / vmax * 34
            lab = ('%gB' % (k * vs / 1e9)) if k * vs >= 1e9 else ('%dM' % (k * vs / 1e6)) if k * vs >= 1e6 else ('%dK' % (k * vs / 1e3))
            draw_text(img, (26, y), lab, GRAY, False, 10, 'rm'); k += 1
    draw_text(img, (5, 4), ticker, GRAY, True, 22, 'lt')
    draw_text(img, (80, 3), title_date, GRAY, True, 10, 'lt')
    logo(img, 380, 2)
    if sma:
        draw_text(img, (3, 26), 'SMA 50', SMA50, False, 11)
        draw_text(img, (3, 37), 'SMA 200', SMA200, False, 11)
    vtext(img, 14, 110, 'DAILY', (225, 225, 225), 11)

def ta_chart(path, ticker, bars, months, title_date, prev, sma=True, lines=(), W=460, H=230, label_vol=True, base=False):
    """bars: list of dict(o,h,l,c,v); months: [(bar_index, label)]; lines: [(i0,p0,i1,p1,color)]"""
    img = Image.new('RGB', (W, H), 'white'); d = ImageDraw.Draw(img)
    X0, X1, Y0, Y1 = 30, 430, 15, 215
    n = len(bars); pw = 2
    xs = [X1 - (n - i) * pw for i in range(n)]
    lo = min(b['l'] for b in bars); hi = max(b['h'] for b in bars)
    for st in (0.01, 0.02, 0.025, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000):
        top = math.ceil(hi / st - 1e-9) * st; bot = top - 8 * st
        if bot <= lo: break
    if bot < 0: bot, top = 0, 8 * st
    def Y(p): return Y0 + (top - p) / (top - bot) * (Y1 - Y0)
    # grid
    for k in range(8): dashed_h(d, Y0 + 25 * k, X0, X1)
    for i, lab in months: dashed_v(d, xs[i], Y0, Y1)
    dashed_v(d, X1, Y0, Y1)
    # volume
    vs_ = sorted(b['v'] for b in bars); vmax = vs_[int(len(vs_) * 0.985) - 1] or 1
    draw_n = n - 1 if base else n          # base: the last (live) bar is left to the browser
    for i, b in enumerate(bars[:draw_n]):
        hgt = min(34, int(round(b['v'] / vmax * 34))); col = VOL_G if b['c'] >= b['o'] else VOL_R
        if hgt: d.rectangle([xs[i], Y1 - hgt, xs[i] + pw - 1, Y1 - 1], fill=col)
    # SMAs
    if sma:
        cl = [b['c'] for b in bars]
        for N, col in ((200, SMA200), (50, SMA50)):
            pts = []
            for i in range(draw_n):
                w = cl[max(0, i - N + 1):i + 1]
                if i >= min(N, n) // 3: pts.append((xs[i] + 1, Y(sum(w) / len(w))))
            if len(pts) > 1: d.line(pts, fill=col, width=1)
    for (i0, p0, i1, p1, col) in lines:
        d.line([(xs[i0] + 1, Y(p0)), (xs[i1] + 1, Y(p1))], fill=col, width=1)
    # candles
    for i, b in enumerate(bars[:draw_n]):
        up = b['c'] >= b['o']; body, wick = (GREEN, GREEN_D) if up else (RED, RED_D)
        yo, yc, yh, yl = Y(b['o']), Y(b['c']), Y(b['h']), Y(b['l'])
        t, bt = int(round(min(yo, yc))), int(round(max(yo, yc)))
        d.line([(xs[i] + 1, int(round(yh))), (xs[i] + 1, int(round(yl)))], fill=wick)
        d.rectangle([xs[i], t, xs[i] + 1, max(t, bt)], fill=body)
    # previous close marker for the last bar
    # axis labels
    for k in range(9):
        v = top - k * st; y = Y0 + 25 * k
        if Y0 <= y <= Y1: draw_text(img, (434, y), fmt_price(v, st), GRAY, False, 11, 'lm')
    if base:
        lastx = 0
        for i, lab in months:
            if xs[i] - lastx < 26: continue
            draw_text(img, (xs[i], 222), lab, GRAY, False, 11, 'cm'); lastx = xs[i]
        _vol_titles(img, d, bars, vmax, label_vol, ticker, title_date, sma)
        img.save(path, optimize=True)
        return dict(top=top, bot=bot, step=st, vmax=vmax, x=xs[-1], Y0=Y0, Y1=Y1)
    last = bars[-1]['c']; yl = int(round(Y(last)))
    lt = fmt_price(last, st); tw = text_size(lt, False, 11)[2]
    d.rectangle([434, yl - 5, min(W - 1, max(457, 436 + tw)), yl + 4], fill=(255, 255, 0))
    draw_text(img, (435, yl), lt, (0, 0, 0), False, 11, 'lm')
    lastx = -99
    for i, lab in months:
        if xs[i] - lastx < 26: continue
        draw_text(img, (xs[i], 222), lab, GRAY, False, 11, 'cm'); lastx = xs[i]
    _vol_titles(img, d, bars, vmax, label_vol, ticker, title_date, sma)
    ch = last - prev; pc = ch / prev * 100
    s = ('%+.2f (%.2f%%)' % (ch, abs(pc))) if abs(ch) < 100 else ('%+.0f (%.2f%%)' % (ch, abs(pc)))
    draw_text(img, (370, 3), s, (220, 40, 40) if ch < 0 else (0, 150, 0), True, 11, 'rt')
    img.save(path, optimize=True)
    return img

def index_chart(path, name, pts, prev, times, stamp, W=330, H=160, halts=(), base=False):
    """intraday 5-minute candles; pts: list of (o,h,l,c) per 5 min; times: [(bar_index,label)]"""
    img = Image.new('RGB', (W, H), 'white'); d = ImageDraw.Draw(img)
    X0, X1, Y0, Y1 = 6, 292, 32, 142
    n = len(pts); pw = (X1 - X0) / n
    lo = min(min(p[2] for p in pts), prev); hi = max(max(p[1] for p in pts), prev)
    st = nice_step(lo, hi, 5.5); top = math.ceil(hi / st) * st
    rows = int(math.ceil((top - lo) / st)); bot = top - rows * st
    def Y(v): return Y0 + (top - v) / (top - bot) * (Y1 - Y0)
    for k in range(rows + 1):
        y = int(round(Y0 + k * (Y1 - Y0) / rows)); dashed_h(d, y, X0, X1)
        draw_text(img, (296, y), fmt_price(top - k * st, st), GRAY, False, 10, 'lm')
    for i, lab in times:
        x = int(round(X0 + i * pw)); dashed_v(d, x, Y0, Y1); draw_text(img, (x, 150), lab, GRAY, False, 10, 'cm')
    yp = int(round(Y(prev)))
    for x in range(X0, X1 + 1):
        if (x // 2) % 2 == 0: d.point((x, yp), fill=(100, 100, 220))
    if base:
        draw_text(img, (6, 4), name, GRAY, True, 15, 'lt'); img.save(path, optimize=True)
        return dict(X0=X0, X1=X1, Y0=Y0, Y1=Y1, top=top, bot=bot, n=n)
    for a, b in halts:
        d.rectangle([int(X0 + a * pw), Y0 + 1, int(X0 + b * pw), Y1 - 1], fill=(246, 246, 246))
        draw_text(img, ((X0 + (a + b) / 2 * pw), Y0 + 9), 'HALT', (190, 190, 190), True, 9, 'ct')
    for i, (o, h, l, c) in enumerate(pts):
        x = int(round(X0 + i * pw)); up = c >= o
        body, wick = (GREEN, GREEN_D) if up else (RED, RED_D)
        d.line([(x + 1, int(round(Y(h)))), (x + 1, int(round(Y(l))))], fill=wick)
        t, b = int(round(Y(max(o, c)))), int(round(Y(min(o, c))))
        d.rectangle([x, t, x + 2, max(t, b)], fill=body)
    last = pts[-1][3]; ch = last - prev; pc = ch / prev * 100
    draw_text(img, (6, 4), name, GRAY, True, 15, 'lt')
    draw_text(img, (325, 4), '%s  %+.2f (%+.2f%%)' % ('{:,.2f}'.format(last), ch, pc), (220, 40, 40) if ch < 0 else (0, 150, 0), True, 11, 'rt')
    draw_text(img, (6, 20) if False else (325, 17), stamp, GRAY, False, 9, 'rt')
    img.save(path, optimize=True)

def stats_bar(path, left, right, lv, rv, W=180, H=24):
    """two-tone bar, label row above: 'Advancing 31.2% (612)  (1300) 67.9% Declining'"""
    img = Image.new('RGB', (W, H), (255, 255, 255)); d = ImageDraw.Draw(img)
    tot = lv + rv or 1; fl = lv / tot
    draw_text(img, (1, 1), left, (0, 120, 0), True, 10, 'lt')
    draw_text(img, (W - 2, 1), right, (180, 0, 0), True, 10, 'rt')
    draw_text(img, (1, 12), '%.1f%% (%d)' % (fl * 100, lv), (90, 90, 90), False, 9, 'lt')
    draw_text(img, (W - 2, 12), '(%d) %.1f%%' % (rv, (1 - fl) * 100), (90, 90, 90), False, 9, 'rt')
    xm = int(round(1 + fl * (W - 3)))
    for y in range(20, 24):
        k = (y - 20) / 4
        g = tuple(int(c * (1 - .25 * k)) for c in (60, 190, 60)); r = tuple(int(c * (1 - .25 * k)) for c in (220, 50, 50))
        if xm > 1: d.line([(1, y), (xm, y)], fill=g)
        d.line([(xm + 1, y), (W - 2, y)], fill=r)
    img.save(path, optimize=True)

# ---------------- map ----------------
SCALE = [(-3.0, (206, 8, 24)), (-1.5, (98, 5, 15)), (0.0, (18, 20, 18)), (1.5, (6, 49, 16)), (3.0, (28, 172, 37))]
HALT = (58, 58, 62)
def perf_color(p):
    if p is None: return HALT
    if p <= SCALE[0][0]: return SCALE[0][1]
    if p >= SCALE[-1][0]: return SCALE[-1][1]
    for (a, ca), (b, cb) in zip(SCALE, SCALE[1:]):
        if a <= p <= b:
            t = (p - a) / (b - a); return tuple(int(round(ca[i] + (cb[i] - ca[i]) * t)) for i in range(3))

def pillow(arr, x1, y1, x2, y2, base, halted=False):
    """tile shading measured on sec_z-1.png: white 35% at the top edge, none at mid-height, grey(225) 27% at the bottom"""
    h = y2 - y1
    if h <= 0 or x2 <= x1: return
    t = (np.arange(h) + 0.5) / h
    top = np.clip(1 - t / 0.5, 0, 1) ** 1.6 * (0.22 if halted else 0.35)
    bot = np.clip((t - 0.5) / 0.5, 0, 1) ** 1.3 * (0.18 if halted else 0.27)
    b = np.array(base, np.float32)
    col = b[None, :] * (1 - top[:, None] - bot[:, None]) + 255 * top[:, None] + 225 * bot[:, None]
    arr[y1:y2, x1:x2, :] = col[:, None, :]

def map_image(path, tiles, inds, secs, Wd=800, Hd=600, k=1.0):
    """tiles: [(ticker, x1,y1,x2,y2, perf or None)] in 800x600 units; inds/secs: [(name,x1,y1,x2,y2)]"""
    arr = np.full((Hd, Wd, 3), 255, np.float32)
    S = lambda v: int(round(v * k))
    for (t, x1, y1, x2, y2, p) in tiles:
        a1, b1, a2, b2 = S(x1), S(y1), S(x2), S(y2)
        arr[b1:b2, a1:a2] = (40, 40, 40) if p is not None else (30, 30, 32)          # 1px seam between tiles
        pillow(arr, a1 + 1, b1 + 1, a2, b2, perf_color(p), p is None)
    for (n, x1, y1, x2, y2) in inds:
        a1, b1, a2, b2 = S(x1), S(y1), S(x2), S(y2)
        for yy in range(b1, b2):
            t = (yy - b1) / max(1, (b2 - b1 - 1))
            arr[yy, a1:a2] = (255, 246, 178) if yy == b1 else (np.array((255, 245, 55)) * (1 - t) + np.array((204, 201, 8)) * t)
    for (n, x1, y1, x2, y2) in secs:
        a1, b1, a2, b2 = S(x1), S(y1), S(x2), S(y2)
        for yy in range(b1, b2):
            t = (yy - b1) / max(1, (b2 - b1 - 1))
            arr[yy, a1:a2] = np.array((217, 241, 255)) * (1 - t) + np.array((139, 177, 220)) * t
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    # header labels
    for (n, x1, y1, x2, y2) in secs:
        _clip_text(img, n, S(x1) + 3, (S(y1) + S(y2)) / 2, S(x2) - S(x1) - 6, (20, 40, 80), True, max(8, S(11)))
    for (n, x1, y1, x2, y2) in inds:
        if S(x2) - S(x1) > 14: _clip_text(img, n, S(x1) + 2, (S(y1) + S(y2)) / 2, S(x2) - S(x1) - 4, (40, 40, 0), False, max(7, S(9)))
    # tile labels
    for (t, x1, y1, x2, y2, p) in tiles:
        w, h = S(x2) - S(x1), S(y2) - S(y1)
        if w < 12 or h < 9: continue
        size = _fit(t, w - 4, h - 2, p is not None and h > 22)
        if not size: continue
        cx, cy = (S(x1) + S(x2)) / 2, (S(y1) + S(y2)) / 2
        col = (255, 255, 255) if p is not None else (150, 150, 155)
        shadow = (1, 1, (0, 0, 0)) if p is not None else (1, 1, (20, 20, 20))
        if p is not None and h > size * 2.2 and size >= 9:
            ps = '%+.2f%%' % p if abs(p) < 100 else '%+.0f%%' % p
            draw_text(img, (cx, cy - 1), t, col, True, size, 'cb', shadow=shadow)
            draw_text(img, (cx, cy + 2), ps, col, True, max(8, int(size * 0.55)), 'ct', shadow=shadow)
        elif p is None and h > size * 2.2 and size >= 11:
            draw_text(img, (cx, cy - 1), t, col, True, size, 'cb', shadow=shadow)
            draw_text(img, (cx, cy + 2), 'n/a', (120, 120, 125), True, max(8, int(size * 0.5)), 'ct')
        else:
            draw_text(img, (cx, cy), t, col, True, size, 'cm', shadow=shadow)
    img.save(path, optimize=True)
    return img

_fitc = {}
def _fit(t, w, h, two):
    for s in (34, 30, 26, 22, 19, 17, 15, 13, 12, 11, 10, 9, 8):
        if (t, s) not in _fitc: _fitc[(t, s)] = text_size(t, True, s)
        _, _, tw, th = _fitc[(t, s)]
        if tw <= w and th * (2.4 if two else 1.1) <= h: return s
    return None

def _clip_text(img, s, x, cy, maxw, col, bold, size):
    while s and text_size(s, bold, size)[2] > maxw: s = s[:-1]
    if len(s) > 1: draw_text(img, (x, cy), s, col, bold, size, 'lm', sub=True)
