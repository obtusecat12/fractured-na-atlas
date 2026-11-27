#!/usr/bin/env python3
# mkfv.py - FINVIZ.com Thu Nov 5 2009 (evening): home, S&P 500 map, screener charts view.
# Markup + finviz.css + interface graphics are the archived originals (Wayback 2009-12-03/08); data, charts, map tiles and ads are in-world.
# Run mkfvimg.py first. Output: fv_home.html / fv_map.html / fv_screener.html (res/ links) and ../../fvpage.js (srcdoc, data: URIs).
import os, re, json, base64, sys, hashlib, html as H
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import fvdata as Dm
SRC, RES = os.path.join(HERE, 'src'), os.path.join(HERE, 'res')
def rd(p): return open(p, encoding='utf-8', errors='replace').read()
D = Dm.load(); EX = Dm.EXTRA
Q = {t: v for t, v in D.items() if v['trading']}; Q.update(EX)
area = rd(os.path.join(SRC, 'area.js'))
def arr(n):
    m = re.search(r'var ' + n + r'\s*=\s*new Array\((.*?)\);', area, re.S); return json.loads('[' + m.group(1) + ']')
NAMES = dict(zip(arr('areaTicker_t'), arr('areaTicker_c')))
STAMP = 'Thursday NOV 05 2009 8:12 PM PST'

def pc(v): return '<span style="color:#%s;">%.2f%%</span>' % ('008800' if v >= 0 else 'aa0000', v)
def money(v): return '{:,.0f}'.format(v)

# ---------------- shared cleanup ----------------
def clean(h, active):
    h = re.sub(r'(?is)<script\b.*?</script>', '', h)
    h = re.sub(r'(?is)<noscript>.*?</noscript>', '', h)
    h = re.sub(r'(?is)<div id="(banner|rectangle)" style="position:absolute;display:none">.*?</div>', '', h)
    h = re.sub(r'\s+title="cssbody=[^"]*"', '', h)
    h = re.sub(r'\s+on(?:mouseover|mouseout)="(?:lightup|turnoff|UpdateZoom|MapPanel)[^"]*"', '', h)
    h = re.sub(r'\s+onclick="[^"]*"', '', h); h = re.sub(r"\s+onclick='[^']*'", '', h)
    h = re.sub(r"\s+onchange='[^']*'", '', h); h = re.sub(r'\s+on(?:keyup|keypress|focus|blur|load|resize|mousedown)="[^"]*"', '', h)
    h = re.sub(r'<body[^>]*>', '<body style="margin:0" bgcolor="#ffffff">', h, 1)
    h = re.sub(r'href="javascript:[^"]*"', 'href="#"', h)
    h = re.sub(r'<link[^>]*finviz\.css[^>]*>', '<style type="text/css">\n' + css() + '\n</style>', h, 1)
    h = re.sub(r'<link[^>]*rel="?stylesheet[^>]*>', '', h)
    h = h.replace('<span class="time-text" id="time"></span>', '<span class="time-text" id="time">%s</span>' % STAMP)
    # 2009 page writes the outer table with document.write: fixed width as at a 1280px screen
    h = re.sub(r'(<body[^>]*>)\s*', r'\1\n<table align="center" width="95%" style="max-width:1425px;" cellpadding="0" cellspacing="0" border="0">\n', h, 1)
    # header nav: mark the three pages we have
    def nav(m):
        a = m.group(0); href = m.group(1)
        page = 'home' if href in ('/', 'index.ashx') else 'map' if href.startswith(('/map.ashx', 'map.ashx?t=sec')) and 'sec_all' not in href else 'screener' if href.startswith(('/screener.ashx', 'screener.ashx')) else None
        return a.replace('<a ', '<a data-nav="%s" ' % page, 1) if page else a
    h = re.sub(r'<a href="([^"]*)"[^>]*>', nav, h)
    h = h.replace('class="body-menu-top-a"', 'class="body-menu-top"')
    h = h.replace('<a data-nav="%s" href="%s" class="body-menu-top">' % (active, {'home': '/', 'map': '/map.ashx', 'screener': '/screener.ashx'}[active]),
                  '<a data-nav="%s" href="%s" class="body-menu-top-a">' % (active, {'home': '/', 'map': '/map.ashx', 'screener': '/screener.ashx'}[active]))
    h = re.sub(r'(src|background)="/?(gfx/[^"]+)"', lambda m: '%s="res/%s"' % (m.group(1), gfx(m.group(2))), h)
    h = re.sub(r"background-image:url\('gfx/([^']+)'\)", lambda m: "background-image:url('res/%s')" % gfx('gfx/' + m.group(1)), h)
    h = h.replace('<div id="banner_position"></div>', '<div id="banner_position"><a href="#"><img src="res/%s" width="728" height="90" border="0" alt=""></a></div>' % ('ad_monex_728x90.jpg' if active == 'home' else 'ad_zecco_728x90.jpg'))
    h = h.replace('</body>', NAVJS + '\n</body>', 1)
    return h

MISSING = set()
def gfx(path):
    name = path.split('?')[0].replace('/', '_')
    if not os.path.exists(os.path.join(RES, name)): MISSING.add(name); return 'gfx_nic2x2.gif'
    return name

_css = None
def css():
    global _css
    if _css is None:
        s = rd(os.path.join(SRC, 'finviz.css'))
        s = re.sub(r'https?://web\.archive\.org/web/\d+(?:im_|cs_)?/https?://(?:www\.)?finviz\.com/', '/', s)
        s = re.sub(r'url\(\s*["\']?/?(gfx/[^)"\']+)["\']?\s*\)', lambda m: 'url(res/%s)' % gfx(m.group(1)), s)
        _css = s
    return _css

NAVJS = '''<script>(function(){
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(!a)return;e.preventDefault();var n=a.getAttribute('data-nav');if(n)parent.postMessage({fv:n},'*');},true);
document.addEventListener('submit',function(e){e.preventDefault();},true);
})();</script>'''

def table_rows(h, header_re, rows_html, nth=0):
    """replace everything between the n-th header row matching header_re and its table's </table>"""
    ms = list(re.finditer(header_re, h, re.S))
    m = ms[nth]; e = h.index('</table>', m.end())
    return h[:m.end()] + rows_html + h[e:]

# ---------------- home ----------------
def sig_row(t, sig, s):
    q = Q[t]; vol = q.get('vol') or int(abs(hash(t)) % 9000000 + 120000)
    url = {'Top Gainers': 'v=340&s=ta_topgainers', 'New High': 'v=340&s=ta_newhigh', 'Overbought': 'v=210&s=ta_overbought', 'Unusual Volume': 'v=320&s=ta_unusualvolume',
           'Upgrades': 'v=340&s=n_upgrades', 'Earnings Before': 'v=340&s=n_earningsbefore', 'Insider Buying': 'v=340&s=it_latestbuys',
           'Top Losers': 'v=340&s=ta_toplosers', 'New Low': 'v=340&s=ta_newlow', 'Oversold': 'v=210&s=ta_oversold', 'Most Volatile': 'v=320&s=ta_mostvolatile',
           'Most Active': 'v=320&s=ta_mostactive', 'Downgrades': 'v=340&s=n_downgrades', 'Earnings After': 'v=340&s=n_earningsafter', 'Insider Selling': 'v=340&s=it_latestsales'}[sig]
    return ('<tr onmouseover="this.className=\'table-light-row-cp-h\';" onmouseout="this.className=\'table-light-cp-row\';">\n'
            '<td><a href="quote.ashx?t=%s" class="tab-link">%s</a></td><td align="right" data-l="%s">%.2f</td><td align="right" style="white-space:nowrap" data-c="%s">%s</td><td align="right" data-v="%s">%d</td><td></td>'
            '<td><a href="screener.ashx?%s" class="tab-link-nw">%s</a></td>\n</tr>\n') % (t, t, t, q['last'], t, pc(q['pct']), t, vol, url, sig)
VOLS = dict(UCBH=48211960, PCBC=9120334, HAFC=6730115, MCY=3302188, ZNT=1188420, CYN=4875012, EWBC=21066530, BAC=412887105, WFC=96210377, SCHW=31002118,
            CBG=18411098, KBH=9002461, MGM=38805144, CPST=27915302, OSIS=2201087, NG=14402996, PWER=19876551, FCX=44301928, SLW=22011390, ABX=31877015,
            GG=18120473, PCU=7002331, AVAV=1876430, TTEK=2410992, FLIR=6002176, URS=3110458, CUB=902334, MXWL=1980447, NOC=9112093, JEC=4320557,
            PCP=3011246, DIS=29870113, ATVI=26502119, ISRG=1611002, LVS=41022650)
for t, v in VOLS.items():
    if t in Q: Q[t]['vol'] = v
LEFT = [('CPST', 'Top Gainers'), ('OSIS', 'Top Gainers'), ('NG', 'Top Gainers'), ('PWER', 'Top Gainers'), ('FCX', 'Top Gainers'), ('SLW', 'Top Gainers'),
        ('FCX', 'New High'), ('GG', 'New High'), ('PCU', 'New High'), ('ABX', 'New High'), ('AVAV', 'Overbought'), ('TTEK', 'Overbought'),
        ('CPST', 'Unusual Volume'), ('FLIR', 'Unusual Volume'), ('URS', 'Unusual Volume'), ('CUB', 'Unusual Volume'), ('NOC', 'Upgrades'), ('JEC', 'Earnings Before'), ('PCP', 'Insider Buying')]
RIGHT = [('UCBH', 'Top Losers'), ('PCBC', 'Top Losers'), ('HAFC', 'Top Losers'), ('MCY', 'Top Losers'), ('ZNT', 'Top Losers'), ('CYN', 'Top Losers'),
         ('EWBC', 'New Low'), ('BAC', 'New Low'), ('KBH', 'New Low'), ('SCHW', 'Oversold'), ('CBG', 'Oversold'), ('UCBH', 'Most Volatile'), ('MGM', 'Most Volatile'),
         ('BAC', 'Most Active'), ('WFC', 'Most Active'), ('DIS', 'Downgrades'), ('ATVI', 'Earnings After'), ('ISRG', 'Insider Selling')]

PAT = [('LB', '3_tl_support', 'ta_p_tlsupport', 'Trendline Support', 'COST SWY PNW RSG'), ('', '2_tl_resist', 'ta_p_tlresistance', 'Trendline Resistance', 'AAPL GOOG QCOM ORCL'),
       ('', '1_horiz_sr', 'ta_p_horizontal', 'Horizontal S/R', 'EIX SRE PCG AMGN'), ('', '4_wedge_up', 'ta_p_wedgeup', 'Wedge Up', 'NOC JEC FLIR PCP'),
       ('', '8_wedge', 'ta_p_wedge', 'Wedge', 'MSFT INTC CSCO HPQ'), ('', '5_wedge_down', 'ta_p_wedgedown', 'Wedge Down', 'WFC SCHW BEN CBG'),
       ('', '6_triangle_ascen', 'ta_p_wedgeresistance', 'Triangle Ascending', 'GILD DVA LIFE MCK'), ('', '7_triangle_descen', 'ta_p_wedgesupport', 'Triangle Descending', 'AMZN EBAY YHOO EXPE')]
PAT2 = [('9_channel_up', 'ta_p_channelup', 'Channel Up', 'FCX PCU GG ABX'), ('11_channel', 'ta_p_channel', 'Channel', 'DIS DTV MAT GPS'), ('10_channel_down', 'ta_p_channeldown', 'Channel Down', 'HCP PSA KBH ESS'),
        ('12_dtop', 'ta_p_doubletop', 'Double Top', 'SLW NG KGC AVAV'), ('14_mtop', 'ta_p_multipletop', 'Multiple Top', 'OSIS TTEK URS CUB'), ('13_dbot', 'ta_p_doublebottom', 'Double Bottom', 'BA PCAR WY NKE'),
        ('15_mbot', 'ta_p_multiplebottom', 'Multiple Bottom', 'CVX OXY APOL MCHP'), ('16_hs', 'ta_p_headandshoulders', 'Head&Shoulders', 'NVDA AMAT KLAC BRCM')]
def pat_rows(rows):
    o = []
    for icon, s, name, ts in rows:
        o.append('<tr onmouseover="this.className=\'table-light-row-cp-h\';" onmouseout="this.className=\'table-light-cp-row\';">\n' +
                 ''.join('<td><a href="quote.ashx?t=%s" class="tab-link">%s</a></td>\n' % (t, t) for t in ts.split()) +
                 '<td><img src="res/gfx_home_pat_icons_%s.gif" width="14" height="12" alt="" border="0"></td>\n<td><a href="screener.ashx?v=210&s=%s" class="tab-link-nw">%s</a></td>\n</tr>\n' % (icon, s, name))
    return ''.join(o)

NEWS = [('3', '8:05PM', 'Gold tops $2,900 as investors shun the dollar'),
        ('3', '7:15PM', 'UCBH depositors line up outside branches in San Francisco Chinatown'),
        ('3', '5:40PM', 'Hong Kong shares open lower for a second day'),
        ('3', '4:15PM', 'Tokyo stocks extend slide at Friday open'),
        ('3', '12:20PM', 'Chevron to run Richmond refinery at half rate into 2010')]
def news_rows():
    o = []
    for k, (logo, tm, t) in enumerate(NEWS):
        c = 'nn-home-first' if k == 0 else 'nn-home'
        o.append('<tr class="%s" onmouseover="this.className=\'nn-h\';" onmouseout="this.className=\'%s\';"><td width="25"><img src="res/gfx_news_logo_%s.gif" width="16" height="16" alt="" border="0"></td>\n'
                 '<td width="55" class="nn-date" align="center">%s</td><td><a href="#" class="nn-tab-link">%s</a></td></tr>' % (c, c, logo, tm, H.escape(t)))
    return ''.join(o)

MAJOR = 'AAPL GOOG WFC BAC FCX CVX MSFT INTC DIS AMZN SCHW NOC CSCO QCOM EBAY'.split()
def major_rows():
    return ''.join('\n<tr onmouseover="this.className=\'table-light-row-cp-h\';" onmouseout="this.className=\'table-light-cp-row\';"><td><a href="quote.ashx?t=%s" class="tab-link-nw">%s</a></td>'
                   '<td align="right" style="white-space:nowrap;"> <small data-c="%s" data-sign="1"><span style="color:#%s;">%+.2f%%</span></small></td></tr>' % (t, t, t, '008800' if Q[t]['pct'] >= 0 else 'aa0000', Q[t]['pct']) for t in MAJOR) + '\n'

CAL = [('Nov 05', '5:30 AM', 'Initial Claims', 'High', 'Oct 31', '841K', '760K', '712K'),
       ('', '5:30 AM', 'Continuing Claims', 'Low', 'Oct 24', '7419K', '7100K', '7012K'),
       ('', '10:00 AM', '10-Yr Note Auction (SF Fed)', 'High', '', '11.62%', '11.10%', '11.21%')]
def cal_rows():
    o = []
    for d, tm, r, imp, f, a, e, pr in CAL:
        o.append('\n<tr onmouseover="this.className=\'table-light-row-cp-h\';" onmouseout="this.className=\'table-light-cp-row\';">\n<td align="right">%s</td>\n<td align="right">%s</td>\n<td></td>\n'
                 '<td align="left">%s</td>\n<td align="left">%s</td>\n<td align="left">%s</td>\n<td align="right"><span style="color:#aa0000;">%s</span></td>\n<td align="right">%s</td>\n<td align="right">%s</td>\n'
                 '<td><img src="res/gfx_nic2x2.gif" alt="" border="0" height="2" width="2"></td>\n</tr>' % (d, tm, r, imp, f, a, e, pr))
    return ''.join(o)

EARN = [('Nov 05/a', 'After Market Close', 'ATVI NVDA QCOM NTAP KBH'), ('Nov 06/b', 'Before Market Open', 'EIX PCG SRE TTEK'), ('Nov 09/a', 'After Market Close', 'DIS CSCO JDSU')]
def earn_rows():
    o = []
    for d, ttl, ts in EARN:
        ts = ts.split(); cells = ''.join('<td><a href="quote.ashx?t=%s" class="tab-link">%s</a></td>\n' % (t, t) for t in ts) + '<td>&nbsp;&nbsp;&nbsp;</td>' * (8 - len(ts))
        o.append('<tr onmouseover="this.className=\'table-light-row-cp-h\';" onmouseout="this.className=\'table-light-cp-row\';">\n<td valign="top" align="center">%s</td>\n<td></td>%s<td></td></tr>' % (d, cells))
    return '\n' + ''.join(o)

INS = [('ISRG', 'HALVERSON DALE R', 'Director', 'Nov 03', 'Sale', 98.20, 4000), ('WFC', 'KOSTER PAMELA J', 'Sr. EVP', 'Nov 02', 'Sale', 8.44, 60000),
       ('PCP', 'RANDALL TOMAS', 'Director', 'Nov 03', 'Buy', 55.10, 5000), ('SCHW', 'OKADA MARTIN', 'EVP, Operations', 'Nov 02', 'Sale', 5.80, 25000),
       ('FCX', 'WENDLAND SUSAN', 'VP, Controller', 'Nov 04', 'Option Exercise', 44.25, 12000), ('CBG', 'TRAN VIVIAN', 'Director', 'Nov 02', 'Sale', 2.95, 40000)]
TOPINS = [('NOC', 'ELLERY JAMES M', 'Nov 03', 'Buy', 1912500), ('FLIR', 'OSTRANDER PAUL', 'Nov 02', 'Buy', 1104000), ('PCU', 'GRUPO MEXICO SAB', 'Nov 02', 'Buy', 9870450),
          ('BAC', 'DOYLE GERALD T', 'Nov 04', 'Sale', 2214000), ('DIS', 'RAMIREZ CLAIRE', 'Nov 03', 'Sale', 1380112), ('AAPL', 'LINDQVIST ERIK', 'Nov 02', 'Sale', 3061200)]
def ins_rows():
    o = []
    for t, who, rel, d, tr, cost, n in INS:
        c = {'Sale': 'insider-sale-row-1', 'Buy': 'insider-buy-row-2', 'Option Exercise': 'insider-option-row'}[tr]
        o.append('<tr class="%s" onmouseover="this.className=\'insider-light-row-cp-h\'" onmouseout="this.className=\'%s\'" valign="top"><td><a href="quote.ashx?t=%s" class="tab-link">%s</a></td>'
                 '<td><a href="#" class="tab-link-nw">%s</td><td style="white-space:nowrap">%s</td><td style="white-space:nowrap">%s</td><td align="center">%s</td><td align="right">%.2f</td>'
                 '<td align="right">%s</td><td align="right">%s</td></tr>' % (c, c, t, t, who, rel, d, tr, cost, money(n), money(cost * n)))
    return '\n' + ''.join(o)
def topins_rows():
    o = []
    for t, who, d, tr, val in TOPINS:
        c = 'insider-buy-row-2' if tr == 'Buy' else 'insider-sale-row-2'
        o.append('<tr class="%s" onmouseover="this.className=\'insider-light-row-cp-h\'" onmouseout="this.className=\'%s\'" valign="top"><td><a href="quote.ashx?t=%s" class="tab-link">%s</a></td>'
                 '<td><a href="#" class="tab-link-nw">%s</td><td>%s</td><td align="center">%s</td><td align="right">%s</td></tr>' % (c, c, t, t, who, d, tr, money(val)))
    return '\n' + ''.join(o)

FUTID = {'Crude Oil (ANS)': 'crude', 'Brent (ICE)': 'brent', 'Gold': 'gold', 'Silver': 'silver', 'EUR/USD': 'eur', 'USD/JPY': 'jpy', 'GBP/USD': 'gbp',
         '5-Year Treasury': 't5', '10-Year Treasury': 't10', '30-Year Treasury': 't30'}
def quote_table(title, rows, links=False):
    o = ['<tr>\n<td><b>%s</b></td>\n<td width="90" align="right">Last</td>\n<td width="90" align="right">Change</td>\n<td width="90" align="right">Change %%</td>\n<td rowspan="10"><img src="res/gfx_nic2x2.gif" width="10" height="5" alt=""></td>\n</tr>\n' % title]
    for name, last, ch, pct in rows:
        if last is None:
            o.append('<tr>\n<td>%s</td>\n<td align="right"><span style="color:#999999;">-</span></td>\n<td align="right"><span style="color:#999999;">-</span></td>\n<td align="right"><span style="color:#999999;">-</span></td>\n</tr>\n' % name); continue
        col = '008800' if ch >= 0 else 'aa0000'
        nm = '<a href="#" class="tab-link">%s</a>' % name if links and '/' in name else name
        o.append('<tr id="fvf-%s">\n<td>%s</td>\n<td align="right"><span style="color:#%s;">%s</span></td>\n<td align="right"><span style="color:#%s;">%s</span></td>\n<td align="right"><span style="color:#%s;">%+.2f%%</span></td>\n</tr>\n'
                 % (FUTID.get(name, ''), nm, col, last, col, ('%+.4f' % ch) if abs(ch) < 0.1 and '.' in last and len(last.split('.')[1]) == 4 else ('%+g' % ch), col, pct))
    return ''.join(o)
FUT = [('Crude Oil (ANS)', '171.35', 12.80, 8.07), ('Brent (ICE)', '168.90', 11.95, 7.61), ('Gold', '2912.5', 187.3, 6.87), ('Silver', '41.82', 3.11, 8.03),
       ('Dow', None, 0, 0), ('S&P 500', None, 0, 0), ('Nasdaq 100', None, 0, 0)]
FX = [('EUR/USD', '2.3115', 0.0482, 2.13), ('USD/JPY', '51.20', -1.94, -3.65), ('GBP/USD', '2.5240', 0.0391, 1.57), ('5-Year Treasury', '10.124', 0.389, 3.99),
      ('10-Year Treasury', '11.625', 0.421, 3.76), ('30-Year Treasury', '12.040', 0.310, 2.64)]

def build_home():
    h = clean(rd(os.path.join(SRC, 'finviz.com_20091208052647.html')), 'home')
    for k, n, key in (('dow', 'idx_w5000', 'W5000'), ('nasdaq', 'idx_r1000', 'R1000'), ('sp500', 'idx_pse', 'PSE')):
        h = re.sub(r'src="image\.ashx\?%s[^"]*"' % k, 'id="fvidx-%s" src="res/%s_base.png"' % (key, n), h)
    h = re.sub(r'src="mktstats_image\.ashx\?(\d)[^"]*"', lambda m: 'id="fvst%s" src="res/mktstats_%s.png"' % (m.group(1), m.group(1)), h)
    h = re.sub(r'<a (?:data-nav="map" )?href="map\.ashx\?t=sec"><img src="maps/current/[^"]*"', '<a data-nav="map" href="map.ashx?t=sec"><img id="fvmapsm" src="res/gfx_nic2x2.gif"', h)
    top = r'<tr class="t-home-table-top">\s*<td>Ticker</td><td align="center">Last</td>.*?</tr>'
    h = table_rows(h, top, ''.join(sig_row(t, s, None) for t, s in LEFT), 0)
    h = table_rows(h, top, ''.join(sig_row(t, s, None) for t, s in RIGHT), 1)
    ptop = r'<tr class="t-home-table-top">\s*<td colspan="4">Tickers</td>.*?</tr>'
    h = table_rows(h, ptop, pat_rows([(i, s, n, ts) for _, i, s, n, ts in PAT]), 0)
    h = table_rows(h, ptop, pat_rows(PAT2), 1)
    h = table_rows(h, r'<tr class="t-home-table-top">\s*<td></td>\s*<td align="center">Time</td>\s*<td align="center">News</td>\s*</tr>\s*', news_rows())
    h = table_rows(h, r'<tr class="t-home-table-top"><td colspan="2">Major news</td></tr>', major_rows())
    h = h.replace('<div id="rectangle_position"></div>', '<div id="rectangle_position"><a href="#"><img src="res/ad_iosat_300x250.jpg" width="300" height="250" border="0" alt=""></a></div>')
    h = table_rows(h, r'<td width="8%" align="right">Prior</td>\s*<td width="2%"><img[^>]*></td>\s*</tr>', cal_rows())
    h = table_rows(h, r'<td colspan="8" width="78%">Earnings release</td>\s*<td width="2%"><img[^>]*></td>\s*</tr>', earn_rows())
    h = table_rows(h, r'<td align="left">Latest Insider Trading</td>.*?</tr>', ins_rows())
    h = table_rows(h, r'<td align="left">Top Insider Trading</td>.*?</tr>', topins_rows())
    h = re.sub(r'<tr>\s*<td><b>Futures</b></td>.*?</table>', lambda m: quote_table('Futures', FUT) + '</table>', h, 1, re.S)
    h = re.sub(r'<tr>\s*<td><b>Forex & Bonds</b></td>.*?</table>', lambda m: quote_table('Forex & Bonds', FX, True) + '</table>', h, 1, re.S)
    h = h.replace('Quotes delayed 15 minutes for NASDAQ, and 20 minutes for NYSE and AMEX.',
                  'Quotes delayed 20 minutes for the Pacific Exchange. NYSE, NASDAQ and AMEX quotes are last trades of May 28, 2009.')
    h = h.replace('<title>FINVIZ.com - Stock Screener</title>', '<title>FINVIZ.com - Stock Screener</title>')
    return h

# ---------------- map ----------------
FACT = {'gilead': 'Republic of Gilead', 'texas': 'Republic of Texas', 'dwg': "Calumet-Lakeshore Workers' Council", 'mcs': 'Mecklenburg Committee of Safety',
        'frc': 'Federal Remnants Command', 'fema': 'FEMA Northern Tier', 'elc': 'Elohim City', 'sequoyah': 'State of Sequoyah', 'lds': 'LDS Church',
        'frk': 'State of Franklin', 'agg': 'Appalachian Guerrilla Govt.', 'ttc': 'Twelve Tribes Communities', 'memphis': 'Millington strike zone', 'none': 'Radio Silence'}
def build_map():
    h = clean(rd(os.path.join(SRC, 'finviz.com_map_20091203072142.html')), 'map')
    h = h.replace('<div id="map-view"><div id="map-view-in"></div><div id="map-view-surface"></div></div>',
                  '<div id="map-view" style="position:relative;width:800px;height:600px;overflow:hidden;cursor:pointer"><img id="map-img" src="res/gfx_nic2x2.gif" width="800" height="600" alt="" border="0" style="display:block">'
                  '<div id="map-hl" style="position:absolute;display:none;border:2px solid #fff;outline:1px solid #000;pointer-events:none"></div></div>')
    info = {}
    for t, v in D.items():
        sec = ''
        if v['trading']: info[t] = [round(v['last'], 2), round(v['pct'], 2), v['note'] or '']
        else: info[t] = [None, None, 'Halted since May 28 \u00b7 HQ %s, %s \u00b7 %s' % (v['city'], v['st'], FACT.get(v['fac'], v['fac']))]
    ml = rd(os.path.join(SRC, 'map_list.js'))
    lst = json.loads('[' + re.search(r'var mapList=new Array\((.*?)\);', ml, re.S).group(1) + ']')[0]
    lst = re.sub(r'\s+on\w+="[^"]*"', '', lst)
    h = h.replace('<div id="map-panel-list-content" style="top:0px"></div>', '<div id="map-panel-list-content" style="top:0px">%s</div>' % lst)
    h = h.replace('<span id="map-status" class="map-status"></span>', '<span id="map-status" class="map-status">S&amp;P 500 as of 5/28/09</span>')
    js = '''<script>(function(){
var T=%s,X1=%s,Y1=%s,X2=%s,Y2=%s,C=%s,I=%s;
var v=document.getElementById('map-view'),hl=document.getElementById('map-hl'),pt=document.getElementById('map-panel-ticker');
function at(x,y){for(var i=0;i<T.length;i++)if(x>=X1[i]&&x<X2[i]&&y>=Y1[i]&&y<Y2[i])return i;return -1;}
function show(i){if(i<0){hl.style.display='none';pt.innerHTML='';return;}
 hl.style.display='block';hl.style.left=(X1[i]-1)+'px';hl.style.top=(Y1[i]-1)+'px';hl.style.width=(X2[i]-X1[i]-2)+'px';hl.style.height=(Y2[i]-Y1[i]-2)+'px';
 var q=I[T[i]],s='<b>'+T[i]+'</b> ',z=q[0]!==null&&window.FVQ?FVQ(T[i]):null;
 if(z){s+=z.last.toFixed(2)+' <span class="'+(z.pct>0?'map-disp-text-green':'map-disp-text-red')+'">'+(z.pct>0?'+':'')+z.pct.toFixed(2)+'%%</span>';}
 else s+='<span class="map-disp-text-black">n/a</span>';
 s+='<br>'+C[i]+(q[2]?'<br><small>'+q[2]+'</small>':'');pt.innerHTML=s;}
v.addEventListener('mousemove',function(e){var r=v.getBoundingClientRect();show(at(e.clientX-r.left,e.clientY-r.top));});
v.addEventListener('mouseleave',function(){show(-1);});
})();</script>''' % tuple(json.dumps(x) for x in (arr('areaTicker_t'), arr('areaTicker_x1'), arr('areaTicker_y1'), arr('areaTicker_x2'), arr('areaTicker_y2'), arr('areaTicker_c'), info))
    h = h.replace('</body>', js + '\n</body>', 1)
    return h

# ---------------- screener ----------------
def build_screener():
    h = clean(rd(os.path.join(SRC, 'finviz.com_screener211_20091208074711.html')), 'screener')
    los = json.load(open(os.path.join(HERE, 'losers.json')))
    cells = ''.join('<span><a href="quote.ashx?t=%s&ty=c&ta=1&p=d&b=1" class="border-text"> <img id="fvta-%s" src="res/c_%s_base.png" class="charts-gal" width="460" height="230" alt="" border="3"></a></span>\n' % (t, t, t) for t in los)
    h = re.sub(r'(<td width="100%" align="center" valign="top" bgcolor="#ffffff">\s*)(<span><a href="quote\.ashx\?t=.*?</span>\s*)+(</td>)', lambda m: m.group(1) + cells + m.group(3), h, 1, re.S)
    h = h.replace('<b>Total: </b>6605 #1', '<b>Total: </b>1912 #1')
    pages = 96
    h = re.sub(r'<select id="pageSelect"[^>]*>.*?</select>', '<select id="pageSelect" style="width:auto;" class="pages-combo">' + ''.join('<option%s value=%d>Page %d/%d</option>' % (' selected="selected"' if k == 1 else '', (k - 1) * 20 + 1, k, pages) for k in range(1, pages + 1)) + '</select>', h, 1, re.S)
    h = re.sub(r'<b>1</b> <a href="screener\.ashx\?v=211&r=21" class="screener-pages">2</a>.*?<b>next</b></a>',
               '<b>1</b> ' + ' '.join('<a href="#" class="screener-pages">%d</a>' % k for k in range(2, 7)) + ' ... <a href="#" class="screener-pages">50</a> ... <a href="#" class="screener-pages">96</a> <a href="#" class="tab-link"><b>next</b></a>', h, 1, re.S)
    h = re.sub(r'(<select id="signalSelect"[^>]*>)(.*?)(</select>)', lambda m: m.group(1) + m.group(2).replace(' selected="selected"', '').replace('>Top Losers<', ' selected="selected">Top Losers<') + m.group(3), h, 1, re.S)
    h = re.sub(r'(<select id="orderSelect"[^>]*>)(.*?)(</select>)', lambda m: m.group(1) + m.group(2).replace(' selected="selected"', '').replace('>Change<', ' selected="selected">Change<', 1) + m.group(3), h, 1, re.S)
    return h

# ---------------- output ----------------
MIME = {'.png': 'image/png', '.gif': 'image/gif', '.jpg': 'image/jpeg'}
def inline(h):
    used = sorted(set(re.findall(r'res/([A-Za-z0-9_.\-]+)', h)))
    def uri(n): return 'data:%s;base64,%s' % (MIME[os.path.splitext(n)[1]], base64.b64encode(open(os.path.join(RES, n), 'rb').read()).decode())
    css_imgs = sorted(set(re.findall(r'url\(res/([A-Za-z0-9_.\-]+)\)', h)))
    var = {n: '--fv%d' % i for i, n in enumerate(css_imgs)}
    h = re.sub(r'url\(res/([A-Za-z0-9_.\-]+)\)', lambda m: 'var(%s)' % var[m.group(1)], h)
    h = h.replace('<style type="text/css">\n', '<style type="text/css">\n:root{' + ''.join('%s:url(%s);' % (var[n], uri(n)) for n in css_imgs) + '}\n', 1)
    cache = {}
    return re.sub(r'res/([A-Za-z0-9_.\-]+)', lambda m: cache.setdefault(m.group(1), uri(m.group(1))), h)

def live_block():
    LIVEDIR = os.path.join(HERE, '..', 'live')
    ns = {}; exec(open(os.path.join(LIVEDIR, 'news.py'), encoding='utf-8').read(), ns)
    def p4(t): return round(-0.0042 + (int(hashlib.md5(t.encode()).hexdigest()[:8], 16) / 4294967296 - 0.5) * 0.022, 5)
    META = {'FCX', 'PCU', 'ABX', 'GG', 'KGC', 'NG', 'SLW'}
    TA = json.load(open(os.path.join(HERE, 'ta_specs.json')))
    q = {}
    for t, v in Q.items():
        P = v['last'] / v['prev'] - 1
        q[t] = [v['prev'], round(P, 5), TA[t]['p4'] if t in TA else p4(t), 'm' if t in META else '', v.get('vol') or int(abs(hash(t)) % 9000000 + 120000)]
    for t in TA: TA[t]['prev3'] = TA[t]['prev3']
    tiles = [[t, x1, y1, x2, y2] for t, x1, y1, x2, y2 in zip(arr('areaTicker_t'), arr('areaTicker_x1'), arr('areaTicker_y1'), arr('areaTicker_x2'), arr('areaTicker_y2'))]
    inds = [list(x) for x in zip(arr('areaIndustry_n'), arr('areaIndustry_x1'), arr('areaIndustry_y1'), arr('areaIndustry_x2'), arr('areaIndustry_y2'))]
    secs = [list(x) for x in zip(arr('areaSector_n'), arr('areaSector_x1'), arr('areaSector_y1'), arr('areaSector_x2'), arr('areaSector_y2'))]
    IDX = json.load(open(os.path.join(HERE, 'idx_specs.json')))
    idx = [dict(key=k, base='res/%s_base.png' % f, pre='res/%s_nov4.png' % f, spec=IDX[k], prev=IDX[k]['prev']) for k, f in (('W5000', 'idx_w5000'), ('R1000', 'idx_r1000'), ('PSE', 'idx_pse'))]
    # [left, right, final L, final R, Wednesday L, Wednesday R, first-minute L, first-minute R, constant]
    stats = [['Advancing', 'Declining', 214, 1661, 812, 1063, 402, 1473, 0], ['New High', 'New Low', 37, 1094, 64, 212, 41, 608, 0],
             ['Above SMA50', 'Below SMA50', 288, 1624, 702, 1210, 455, 1457, 0], ['Above SMA200', 'Below SMA200', 231, 1681, 640, 1272, 380, 1532, 0],
             ['Trading', 'Halted', 1912, 4693, 1912, 4693, 1912, 4693, 1]]
    # [id, path, mode, previous close, scale or change, value before the open, decimals, change decimals]
    fut = [['crude', 'OIL', 'day', 158.55, 1, None, 2, 2], ['brent', 'OIL', 'day', 156.95, 0.9857, None, 2, 2], ['gold', 'GOLD', 'day', 2725.2, 1, None, 1, 1],
           ['silver', 'G', 'g', 38.71, 0.0803, None, 2, 2], ['eur', 'G', 'g', 2.2633, 0.0213, None, 4, 4], ['jpy', 'G', 'g', 53.14, -0.0365, None, 2, 2],
           ['gbp', 'G', 'g', 2.4849, 0.0157, None, 4, 4], ['t5', 'TNX', 'sess', 9.735, 0.87088, 9.735, 3, 3], ['t10', 'TNX', 'sess', 11.204, 1, 11.204, 3, 3],
           ['t30', 'TNX', 'sess', 11.730, 1.03570, 11.730, 3, 3]]
    news = [n for n in ns['NEWS'] if n[1] == 'Reuters']
    FVD = dict(q=q, tiles=tiles, inds=inds, secs=secs, idx=idx, stats=stats, fut=fut, news=news, ta=TA, newsIcon='res/gfx_news_logo_3.gif')
    return ('<script>window.LIVE=' + open(os.path.join(LIVEDIR, 'live.json')).read() + ';window.FV=' + json.dumps(FVD) + ';</script>\n<script>' +
            open(os.path.join(LIVEDIR, 'live.js'), encoding='utf-8').read() + '\n' + open(os.path.join(LIVEDIR, 'fv_live.js'), encoding='utf-8').read() + '</script>\n')

if __name__ == '__main__':
    pages = {'home': build_home(), 'map': build_map(), 'screener': build_screener()}
    LB = live_block()
    for k in pages: pages[k] = pages[k].replace('</body>', LB + '</body>', 1)
    for k, v in pages.items(): open(os.path.join(HERE, 'fv_%s.html' % k), 'w', encoding='utf-8').write(v)
    inl = {k: inline(v) for k, v in pages.items()}
    for k, v in inl.items(): open(os.path.join(HERE, 'fv_%s_preview.html' % k), 'w', encoding='utf-8').write(v)
    fav = 'data:image/x-icon;base64,' + base64.b64encode(open(os.path.join(RES, 'favicon.ico'), 'rb').read()).decode() if os.path.exists(os.path.join(RES, 'favicon.ico')) else ''
    TITLES = {'home': 'FINVIZ.com - Stock Screener', 'map': 'FINVIZ.com - Stock Market Maps', 'screener': 'FINVIZ.com - Stock Screener'}
    PATHS = {'home': '/', 'map': '/map.ashx', 'screener': '/screener.ashx?v=211&s=ta_toplosers&o=change'}
    js = ('// fvpage.js - generated by sites/fv/mkfv.py: finviz.com Thu Nov 5 2009 (archived Dec 2009 markup + CSS; in-world data, charts, map and ads)\n(function () {\n'
          '  window.FV_FAV = %s;\n  var P = %s, T = %s, U = %s;\n'
          '  (window.CWSITES = window.CWSITES || {}).finviz = function (W) {\n'
          "    var ifr = document.createElement('iframe'); ifr.setAttribute('title', 'FINVIZ.com');\n"
          "    var t = W.open({ title: T.home, host: 'finviz.com', path: '/', fav: window.FV_FAV, node: ifr });\n"
          '    function go(p) { if (!P[p]) return; ifr.srcdoc = P[p]; t.title = T[p]; t.path = U[p]; W.select(t); }\n'
          "    window.addEventListener('message', function (e) { if (e.source === ifr.contentWindow && e.data && typeof e.data.fv === 'string') go(e.data.fv); });\n"
          "    t.go = function (p) { go(p === '/' ? 'home' : /map/.test(p) ? 'map' : /screener/.test(p) ? 'screener' : 'home'); }; go('home'); return t;\n  };\n})();\n"
          ) % (json.dumps(fav), json.dumps(inl).replace('</', '<\\/'), json.dumps(TITLES), json.dumps(PATHS))
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', '..', 'fvpage.js')
    open(out, 'w', encoding='utf-8').write(js)
    print('wrote', out, len(js), {k: len(v) for k, v in inl.items()}, 'missing gfx:', sorted(MISSING))
