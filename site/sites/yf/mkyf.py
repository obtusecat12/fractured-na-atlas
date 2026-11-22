#!/usr/bin/env python3
# mkyf.py - Yahoo! Finance (finance.yahoo.com, Wayback 2009-11-06 04:13 UTC = Thu Nov 5 2009 8:13pm PST)
# rebuilt as the in-world front page for Thursday, November 5, 2009, the day after the Millington blast.
# Input: src/finance.yahoo.com_20091106041355.html + the three archived stylesheets; images in res/.
# Output: yf_home.html (relative res/ links, for screenshots) and ../../yfpage.js (self-contained srcdoc).
import re, os, json, base64, sys
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src'); RES = os.path.join(HERE, 'res')
def rd(p): return open(p, encoding='utf-8', errors='replace').read()

h = rd(os.path.join(SRC, 'finance.yahoo.com_20091106041355.html'))
# ---- strip scripts, beacons, ads, IE-only css ----
h = re.sub(r'(?is)<script\b.*?</script>', '', h)
h = re.sub(r'(?is)<noscript>.*?</noscript>', '', h)
h = re.sub(r'(?is)<!--\[if[^\]]*\]>.*?<!\[endif\]-->', '', h)
h = re.sub(r'(?is)<iframe\b.*?</iframe>', '', h)
h = re.sub(r'<img width=1 height=1[^>]*>', '', h)
h = re.sub(r'(?i)<img src="http://(ad\.doubleclick\.net|ads\.bluelithium\.com)[^>]*>', '', h)
h = re.sub(r'<link [^>]*stylesheet[^>]*>', '', h)
h = re.sub(r'<link [^>]*href="http://us\.js2[^>]*>', '', h)
h = re.sub(r'<span id="yfs_(common|module)_params[^>]*>.*?</span>', '', h)
h = re.sub(r'<meta name="(verify-v1|y_key)"[^>]*>[^\n]*', '', h)
# tracking redirects -> plain targets (all clicks are blocked in-page anyway)
h = re.sub(r'href=(["\']?)http://us\.(?:lrd|ard)\.yahoo\.com/[^"\' >]*?\*(http[^"\' >]*)\1', r'href="\2"', h)
h = re.sub(r'href=(["\']?)http://us\.(?:lrd|ard)\.yahoo\.com/[^"\' >]*\1', r'href="#"', h)
h = re.sub(r'href=(http[^"\' >]+) ', r'href="\1" ', h)
h = re.sub(r';_ylt=[^"?]*', '', h)

REP = []
def r(old, new, n=1): REP.append((old, new, n))

# ======================= in-world content, Thu Nov 5 2009 (PT) =======================
def sub1(pat, new, flags=re.S):
    global h
    h2, n = re.subn(pat, lambda m: new, h, count=1, flags=flags)
    if n != 1: sys.exit('pattern not found: ' + pat[:80])
    h = h2
def rep(old, new):
    global h
    if h.count(old) != 1: sys.exit('expected once: ' + old[:80])
    h = h.replace(old, new)
def cls(v): return 'ticker_up' if v.startswith('+') else ('ticker_down' if v.startswith('-') else '')

sub1(r'<span id="yfs_market_time">.*?</span>', '<span id="yfs_market_time">Thursday, November 5, 2009, 8:12PM PT - U.S. Markets Closed.</span>')
sub1(r'<div id="yfi_fp_ad_nns">.*?</div>', '''<div id="yfi_fp_ad_nns">

                        <font face=arial size=-1><a href="http://www.schwab.com/"><b>Charles Schwab:</b> $8.95 Online Stock Trades, Accounts Held in San Francisco </a></font>

                    </div>''')

# ---- Market Summary: trading in San Francisco since Aug 3; NYSE/Nasdaq indexes not calculated since May 28 ----
def ms_table(tid, rows, chart):
    o = ['<table id="%s" title="mktsummary" class="accordion_view">' % tid]
    for i, (name, sym, last, chg, pct) in enumerate(rows):
        sel = ' selected' if i == 0 else ''
        nm = name.replace('&', '&amp;')
        o.append('<tr title="%s" class="tab%s" tabindex="%d"><td class="ticker_name"><a href="/q?s=%s" >%s</a></td>' % (nm, sel, i, sym, nm))
        if pct is None:      # bond row: change spans two cells
            o.append('<td><span class="streaming-datum">%s</span>%%</td><td colspan="2" class="right_cell %s"><span class="streaming-datum">%s</span></td></tr>' % (last, cls(chg), chg))
        elif chg is None:    # index no longer calculated
            o.append('<td><span class="streaming-datum">%s</span></td><td colspan="2" class="right_cell"><span class="streaming-datum" style="color:#999">%s</span></td></tr>' % (last, pct))
        else:
            o.append('<td><span class="streaming-datum">%s</span></td><td class="%s"><span class="streaming-datum">%s</span></td><td class="right_cell %s"><span class="streaming-datum">%s</span></td></tr>' % (last, cls(chg), chg, cls(pct), pct))
        img = chart if i == 0 else 'res/transparent.gif'
        o.append('<tr><td colspan="4"><div style="height: %s;"%s><a href="/q/bc?s=%s" ><img src="%s" alt="Chart for %s"></a></div></td></tr>' % ('auto' if i == 0 else '0px', ' class="selected"' if i == 0 else '', sym, img, nm))
    o.append('</table>'); return ''.join(o)
US = [('Wilshire 5000', '%5EW5000', '3,057.04', '-334.83', '-9.87%'),
      ('PSE Tech 100', '%5EPSE', '412.08', '-49.37', '-10.70%'),
      ('Dow', '%5EDJI', '4,214.36', None, 'Last calc. 5/28'),
      ('10 Yr Bond(%)', '%5ETNX', '11.6250', '+0.4210', None),
      ('Oil', 'ANS.X', '171.35', '+12.80', '+8.07%'),
      ('Gold', 'XAUUSD%3DX', '2,912.50', '+187.30', '+6.87%')]
EU = [('FTSE 100', '%5EFTSE', '2,964.18', '-121.33', '-3.93%'),
      ('DAX', '%5EGDAXI', '3,071.25', '-148.60', '-4.62%'),
      ('CAC 40', '%5EFCHI', '2,048.92', '-92.07', '-4.30%')]
AS = [('Nikkei 225', '%5EN225', '5,733.61', '-412.39', '-6.71%'),
      ('Hang Seng', '%5EHSI', '9,512.06', '-588.27', '-5.82%'),
      ('Straits Times', '%5ESTI', '1,388.40', '-71.25', '-4.88%')]
ms = ('<div id="market_summary_tabs" class="yui-navset yui-navset-top"><ul class="yui-nav"><li class="selected" title="active"><a href="#market_summary_us"><em>US</em></a></li><li><a href="#market_summary_europe"><em>Europe</em></a></li><li><a href="#market_summary_asia"><em>Asia</em></a></li></ul><div class="yui-content">'
      '<div id="market_summary_us" style="display: block;"><div class="accordion_container">' + ms_table('market_summary_us_accordion', US, 'res/chart_w5000.png') +
      '</div><div><a href="/indices?e=dow_jones" class="customize_summary">Customize summary</a><ul><li><a href="/indices" class="view_more">&raquo; View more indices</a></li><li><a href="/bonds" class="view_more">&raquo; View more bonds</a></li></ul></div></div>'
      '<div id="market_summary_europe" style="display: none;"><div class="accordion_container">' + ms_table('market_summary_europe_accordion', EU, 'res/chart_ftse.png') +
      '</div><div><a href="/intlindices?e=europe" class="view_more">&raquo; View more indices</a></div></div>'
      '<div id="market_summary_asia" style="display: none;"><div class="accordion_container">' + ms_table('market_summary_asia_accordion', AS, 'res/chart_n225.png') +
      '</div><div><a href="/intlindices?e=asia" class="view_more">&raquo; View more indices</a></div></div></div></div>')
sub1(r'<div id="market_summary_tabs".*?</table></div><div><a href="[^"]*" class="view_more">\S+ View more indices</a></div></div></div></div>', ms)

sub1(r'<div id="update">.*?</div>', '''<div id="update">
<p><b>Thu 1:25pm PT</b><cite>- MarketWatch</cite><br /> Stocks fell in every sector in the first session since Wednesday's blast north of Memphis, and a 10% drop in the Wilshire 5000 forced a one-hour halt at...</p>
<a href="http://www.marketwatch.com/" class="view_more">&raquo; Read more</a>
</div>''')
sub1(r'<div id="yfi_fp_ad_nwp" class="ft sponsored_by">.*?</div>', '<div id="yfi_fp_ad_nwp" class="ft sponsored_by">Brokers: <a href="http://www.schwab.com/">SCHWAB</a>\n<a href="http://www.zecco.com/">ZECCO</a><a href="http://www.wellsfargo.com/investing/">WELLS FARGO</a>\n</div>')

# ---- currencies ----
rep('<td>1.4876</td>\n<td class="ticker_up">+ 0.0002</td>', '<td>2.3115</td>\n<td class="ticker_up">+ 0.0482</td>')
rep('<td>90.6750</td>\n<td class="ticker_down">-0.0700</td>', '<td>51.2000</td>\n<td class="ticker_down">-1.9400</td>')
rep('<td>1.6609</td>\n<td class="ticker_up">+ 0.0029</td>', '<td>2.5240</td>\n<td class="ticker_up">+ 0.0391</td>')
rep('<td class="value">90.6750 ¥</td>', '<td class="value">51.2000 ¥</td>')
rep('<td class="value">0.6722 €</td>', '<td class="value">0.4326 €</td>')
sub1(r'<div id="yfi_fp_ad_fx">.*?Free \$50,000 Practice Account\s*</a>\s*</div>', '''<div id="yfi_fp_ad_fx">
                                <div>Sponsored by:</div>
                                <a href="http://www.travelex.com/" ><b>Travelex</b> - Foreign Currency Delivered
</a><br><a href="http://www.travelex.com/" >Canadian Dollars to CA and AZ Homes
</a>
                            </div>''')

# ---- investing ideas + market movers ----
sub1(r'<ul class="news_list">\s*<li>\s*<a href="[^"]*" >TradingMarkets 7 Stocks.*?</ul>', '''<ul class="news_list">
<li>
<a href="#" >Gold Miners Near Highs as the Dollar Slides Again</a><cite>- Investor's Business Daily</cite>
</li>
<li>
<a href="#" >Five Western Utilities That Still Pay a Dividend</a><cite>- MarketWatch</cite>
</li>
<li>
<a href="#" >Canadian Stocks Draw Money From Across the Border</a><cite>- MarketWatch</cite>
</li>
<li>
<a href="#" >What Thursday's Halt Means for Your Stop Orders</a><cite>- Investor's Business Daily</cite>
</li>
</ul>''')
MOV = [('FCX', '141.62', '+21.66', '+18.06%', 'FREEPORT-MCMORAN COPPER &amp; GOLD'),
       ('WFC', '6.84', '-1.37', '-16.69%', 'WELLS FARGO &amp; CO'),
       ('MCY', '9.15', '-2.61', '-22.19%', 'MERCURY GENERAL CORP'),
       ('DIS', '11.07', '-1.04', '-8.59%', 'WALT DISNEY CO'),
       ('CVX', '38.20', '-2.95', '-7.17%', 'CHEVRON CORP')]
m = re.search(r'<table id="yfi_fp_newsworthy".*?</table>', h, re.S); tbl = m.group(0)
rows = re.findall(r'<tr[^>]*>.*?</tr>', tbl, re.S)
new_rows = []
for row, (t, last, chg, pct, nm) in zip(rows, MOV):
    old_t = re.search(r'<td class="ticker_name"><a [^>]*>([^<]+)</a>', row).group(1)
    row = re.sub(r'<td><span class="streaming-datum" id="yfs_l10_[^"]*">[^<]*</span></td>', '<td><span class="streaming-datum">%s</span></td>' % last, row)
    row = re.sub(r'<td class="ticker_(?:up|down)"><span class="streaming-datum" id="yfs_c10_[^"]*">[^<]*</span></td>', '<td class="%s"><span class="streaming-datum">%s</span></td>' % (cls(chg), chg), row)
    row = re.sub(r'<td class="ticker_change_percent ticker_(?:up|down)"><span class="streaming-datum" id="yfs_pp0_[^"]*">[^<]*</span></td>', '<td class="ticker_change_percent %s"><span class="streaming-datum">%s</span></td>' % (cls(pct), pct), row)
    row = re.sub(r'<em>[^<]*</em>', '<em>%s</em>' % nm, row, count=1)
    row = row.replace('s=' + old_t, 's=' + t).replace('>' + old_t + '<', '>' + t + '<').replace('Chart for ' + old_t, 'Chart for ' + t).replace('/' + old_t + '/', '/' + t + '/')
    new_rows.append(row)
h = h.replace(tbl, '<table id="yfi_fp_newsworthy" title="investideas" class="detailtip_table" cellspacing="0">\n' + '\n'.join(new_rows) + '\n</table>')

sub1(r'<div class="bullish">.*?<div class="ft"><p>[^<]*</p></div>', '''<div class="bullish">
<em>Bullish</em><ul>
<li><a href="/mb/ABX/" >Barrick Gold Corporation (ABX)</a></li>
<li><a href="/mb/PCU/" >Southern Copper Corporation (PCU)</a></li>
<li><a href="/mb/OXY/" >Occidental Petroleum Corporation (OXY)</a></li>
</ul>
</div>
<div class="bearish">
<em>Bearish</em><ul>
<li><a href="/mb/MCY/" >Mercury General Corporation (MCY)</a></li>
<li><a href="/mb/WFC/" >Wells Fargo &amp; Company (WFC)</a></li>
<li><a href="/mb/AAPL/" >Apple Inc. (AAPL)</a></li>
</ul>
</div>
</div>
<div class="ft"><p>Based on message board activity, past 24 hours</p></div>''')

# ---- top stories (AP) ----
sub1(r'<div class="hd"><h3><a href="[^"]*" >Top Stories</a></h3></div><div class="bd">.*?</ul>\s*</div>', '''<div class="hd"><h3><a href="http://biz.yahoo.com/topstories/" >Top Stories</a></h3></div><div class="bd">
<a href="#" ><strong>Stocks plunge after Memphis blast, trigger halt</strong></a><cite>- AP</cite><p>Stocks on the Pacific Exchange fell more than 10 percent in the first hour of trading Thursday, setting off the first market-wide halt since trading resumed in San Francisco in August.</p>
<ul class="news_list">
<li>
<a href="#" >Gold tops $2,900 as investors pull back from dollar</a><cite>- AP</cite>
</li>
<li>
<a href="#" >Treasury yields jump after weak San Francisco auction</a><cite>- AP</cite>
</li>
<li>
<a href="#" >Insurers fall on fears over nuclear exclusion clauses</a><cite>- AP</cite>
</li>
<li>
<a href="#" >Wells Fargo caps Arizona ATM withdrawals at $300</a><cite>- AP</cite>
</li>
<li>
<a href="#" >Disney says Disneyland will stay closed until spring</a><cite>- AP</cite>
</li>
<li>
<a href="#" >Chevron to run Richmond refinery at half rate into 2010</a><cite>- AP</cite>
</li>
<li>
<a href="#" >Jobless claims climb to 841,000, Labor Dept. says</a><cite>- AP</cite>
</li>
<li>
<a href="#" >Costco limits rice, fuel purchases at California stores</a><cite>- AP</cite>
</li>
<li>
<a href="#" >Bank of America completes move to San Francisco</a><cite>- AP</cite>
</li>
</ul>
</div>''')

# ---- retirement module (Fidelity, Boston, is in Gilead; Schwab sponsors) ----
sub1(r'<h3><a href="[^"]*" >Focus on Lifelong Investing</a></h3>\s*<cite>brought to you by Fidelity</cite>', '<h3><a href="/focus-retirement" >Focus on Retirement</a></h3>\n<cite>brought to you by Charles Schwab</cite>')
sub1(r'<img src="http://l.yimg.com/us.yimg.com/p/fi/10/21/52.jpg" alt="[^"]*"><a href="[^"]*" >What to Expect as 401\(k\) Matches Return</a><p>.*?</p>',
     '<img src="res/fi_10_21_52.jpg" alt="Where Is My 401(k)?"><a href="#" >Where Is My 401(k)? What Workers Can Do Now</a><p>Many Western retirement plans were run from Boston, New York or Valley Forge. An emergency SEC order lets account holders move to West Coast custodians.</p>')
sub1(r'<img src="http://ads.yimg.com/a/a/fi/fidelity09/brand_button_120x30_2.gif" alt="" width="120" height="30" border="0">',
     '<img src="res/schwab_150x30.gif" alt="" width="150" height="30" border="0">')

# ---- tech ticker (produced in Sunnyvale since the New York studio closed) ----
sub1(r'<div class="bd clearfix"><ul class="clearfix">.*?</ul></div>', '''<div class="bd clearfix"><ul class="clearfix"><li><div class="video_image"><a href="#" ><img src="res/tt_gold.jpg" alt="Play Video" title="Play Gold at $2,900: Is the Dollar Done as a Reserve Currency?"><div></div><em>Play Video</em></a></div><div class="article_info"><h5><a href="#" >Gold at $2,900: Is the Dollar Done as ...</a></h5><cite>- Dan Mendez</cite></div></li><li><div class="video_image"><a href="#" ><img src="res/tt_memphis.jpg" alt="Play Video" title="Play After Memphis: What a Market-Wide Halt Does to Your Orders"><div></div><em>Play Video</em></a></div><div class="article_info"><h5><a href="#" >After Memphis: What a Halt Does to You...</a></h5><cite>- Ken Ishida</cite></div></li><li class="last"><div class="video_image"><a href="#" ><img src="res/tt_flag.jpg" alt="Play Video" title='Play "Buy Western": Can California Make What It Used to Buy From Ohio?'><div></div><em>Play Video</em></a></div><div class="article_info"><h5><a href="#" >"Buy Western": Can California Make Wh...</a></h5><cite>- Rachel Stein</cite></div></li></ul></div>''')
sub1(r'<img src="http://ads.yimg.com/a/a/sc/scottrades/120x30animated.gif"[^>]*>', '<img src="res/schwab_150x30.gif" height="30" width="150" border="0"  style="margin-right: 10px;" />')

# ---- personal finance / commentary / special features ----
sub1(r'<div class="yfi_fp_featured_article">\s*<a href="[^"]*" ><img src="http://l.yimg.com/us.yimg.com/p/fi/25/62/24.jpg".*?</div>\s*</div>', '''<div class="yfi_fp_featured_article">
<a href="#" ><img src="res/pf_camp.jpg" alt="Tents at the Cal Expo camp in Sacramento"></a><div>
<a href="#" ><strong>What to Do With Your Money If You Have to Leave Home</strong></a><p>From papers to cash to accounts at banks run from the East, here are the steps families at Cal Expo and other camps say they wish they had taken before they left...</p>
</div>
</div>''')
sub1(r'<ul id="yfi_fp_pf_extra">.*?</ul>', '''<ul id="yfi_fp_pf_extra">
<li>
<em>How-to Guide:</em><a href="#" >Claiming Accounts Frozen in the East</a>
</li>
<li>
<em>Calculator:</em><a href="#" >How long will my emergency fund last?</a>
</li>
</ul>''')
sub1(r'<div class="yfi_fp_featured_article">\s*<a href="[^"]*" ><img src="http://l.yimg.com/cz/lib/fi/us/p/d/static/images/3.0.6/2.0.0/people/fp_moneyhappy.png".*?</ul>', '''<div class="yfi_fp_featured_article">
<a href="#" ><img src="res/ca_congress.jpg" alt="The Interim Congress at Sacramento Memorial Auditorium"></a><div>
<a href="#" ><strong>Sacramento Still Has No Budget. That Costs You.</strong></a><cite>- Ellen Marsh</cite><p>Without a federal budget, Treasury buyers want 11% to lend. Every household with a mortgage pays for that.</p>
</div>
</div>
<ul>
<li>
<a href="#" >What the San Francisco Fed Can Do</a><cite>- Paul Kessler</cite>
</li>
<li>
<a href="#" >The Case for Reopening the Port of Oakland</a><cite>- Ana Rivera</cite>
</li>
<li>
<a href="#" >Counting Jobs When Half the Data Is Gone</a><cite>- Greg Halloran</cite>
</li>
</ul>''')
sub1(r'<h3>Special Features</h3>.*?</ul>', '''<h3>Special Features</h3>
<div class="yfi_fp_featured_article"><div>
<a href="#" ><strong>Who Pays When a Bank Goes Dark?</strong></a><cite>- LA Times</cite><p>Depositors at banks run from New York and Charlotte are still waiting for the FDIC's San Francisco office to say how much of their money it will cover.</p>
</div></div>
<em>More Features</em><ul>
<li><a href="#" >Does Gold Have Further to Run?</a></li>
<li><a href="#" >How to Get Paid When Your Employer Is in the East</a></li>
<li><a href="#" >Potassium Iodide: Who Needs It and Where to Buy</a></li>
<li><a href="#" >Renting in Phoenix: What Landlords Are Asking</a></li>
<li><a href="#" >How to Land a Holiday Job</a></li>
<li><a href="#" >Can You Still Buy Canadian Dollars?</a></li>
<li><a href="#" >Trade Smarter Around the New Halt Rules</a></li>
<li><a href="#" >Is Your Policy Void After a Nuclear Blast?</a></li>
<li><a href="#" >Five Funds Still Open to New Money</a></li>
</ul>''')

# ---- sponsored links ----
def dl(first, t, d, u): return '<dl class="yui-u%s">\n<dt><a href="#" class="yltasis">%s</a></dt>\n<dd>%s</dd>\n<dd><a href="#" class="yltasis">%s</a></dd>\n</dl>' % (' first' if first else '', t, d, u)
ads = [('Honda Generators In Stock', 'EU2000i and EU3000is. Pickup in Sacramento or delivery in the Valley.', 'www.capitolpowerequip.com'),
       ('Buy Gold &amp; Silver at Spot + 3%', 'Coins and bars. Insured shipping to CA, AZ and NV. Showroom on J Street.', 'www.westcoastbullion.com'),
       ('Earn From 6.50% to 7.10%', 'FDIC-insured CDs from California banks. Not An Offer Of Securities For Sale.', 'www.goldenstatecd.com'),
       ('Potassium Iodide - 14 Day Supply', 'FDA-approved KI tablets for adults and children. Ships from Fresno in 2 days.', 'www.kiprotect.com'),
       ('Refinance Now at 11.25% Fixed', 'No hidden fees-11.6% APR! Get 4 free quotes. California &amp; Arizona only.', 'www.refiwest.com'),
       ('Send Money to Canada', 'Wire dollars to Canadian bank accounts. Rates updated every hour.', 'www.pacificremit.com')]
ysm = ''.join('<div class="yui-g">' + dl(True, *ads[i]) + '\n' + dl(False, *ads[i + 1]) + '</div>' for i in (0, 2, 4))
m = re.search(r'(<div id="yfi_ysm">\s*<div class="hd"><h3>Sponsored Links</h3></div>\s*<div class="bd">)<div class="yui-g">.*?</dl></div>(</div>)', h, re.S)
if not m: sys.exit('ysm not found')
h = h[:m.end(1)] + ysm + h[m.start(2):]

# ---- videos (Reuters, KCRA 3 Sacramento) ----
sub1(r'<li class="premier">.*?</ul></div>', '''<li class="premier">
<div class="video_image"><a href="#"><img src="res/vid_calloway.jpg" alt="Play Video"><div></div>
<em>Play Video</em></a></div>
<a href="#">Calloway: Exchange Will Open Friday</a><div class="premier_provider">Provided by: <a href="#" ><img src="res/prov_reuters.gif" alt="Reuters"></a>
</div>
</li>
<li>
<a href="#">Gas Lines Return to Phoenix</a><cite>- Reuters</cite>
</li>
<li>
<a href="#">Ration Cards: What to Bring</a><cite>- KCRA</cite>
</li>
<li>
<a href="#">Moving Money to Canada</a><cite>- Reuters</cite>
</li>
</ul></div>''')

# ---- rates (Bankrate is in North Palm Beach, inside Radio Silence) ----
RATES = {
 'rates_mortgages': ('mortgage rates', [('30 Year Fixed', '12.84%', '12.31%'), ('15 Year Fixed', '12.10%', '11.62%'), ('1 Year ARM', '10.95%', '10.60%'), ('30 Year Fixed Jumbo', '14.20%', '13.75%'), ('5/1 ARM', '11.48%', '11.02%'), ('3/1 ARM', '11.21%', '10.88%')]),
 'rates_home_equity': ('home equity rates', [('$30K Home Equity Loan', '15.40%', '15.05%'), ('$50K Home Equity Loan', '15.45%', '15.10%'), ('$75K Home Equity Loan', '15.52%', '15.18%'), ('$30K HELOC', '13.90%', '13.65%'), ('$50K HELOC', '13.75%', '13.50%'), ('$75K HELOC', '13.75%', '13.50%')]),
 'rates_cds': ('savings rates', [('6 month CD', '5.85%', '5.70%'), ('1 year CD', '6.50%', '6.35%'), ('3 year CD', '7.10%', '6.95%'), ('MMA', '4.90%', '4.80%'), ('$10K MMA ', '5.05%', '4.95%'), ('$25K MMA', '5.25%', '5.15%')]),
 'rates_autos': ('auto rates', [('36 Month New Car Loan', '14.25%', '13.90%'), ('48 Month New Car Loan', '14.60%', '14.25%'), ('60 Month New Car Loan', '14.95%', '14.60%'), ('36 Month Used Car Loan', '16.40%', '16.10%'), ('48 Month Used Car Loan', '16.75%', '16.40%')]),
 'rates_credit_cards': ('credit card rates', [('Business Credit Cards', '21.99%', '21.99%'), ('Low Interest Credit Cards', '23.49%', '22.99%'), ('Cash Back Credit Cards', '25.24%', '24.99%'), ('Reward Credit Cards', '25.99%', '25.49%'), ('Instant Approval Credit Cards', '28.99%', '28.99%'), ('Balance Transfer Credit Cards', '26.49%', '25.99%')]),
}
for pid, (kind, vals) in RATES.items():
    m = re.search(r'<div id="%s"[^>]*>.*?</tbody></table>' % pid, h, re.S); blk = m.group(0)
    blk2 = re.sub(r"See today's average [^.]*\. Source: <a [^>]*>[^<]*</a>", "See today's average %s in California and Arizona. Source: <a href=\"http://www.wellsfargo.com/\" >Wells Fargo</a>" % kind, blk)
    trs = re.findall(r'<tr(?: class="ticker_colored_row")?><td class="ticker_name">.*?</tr>', blk2, re.S)
    for tr, (name, today, last) in zip(trs, vals):
        tds = re.findall(r'<td[^>]*>.*?</td>', tr, re.S)
        tr2 = tr.replace(tds[1], re.sub(r'>[^<]*<', '>%s<' % today, tds[1], count=1)).replace(tds[2], re.sub(r'>[^<]*<', '>%s<' % last, tds[2], count=1))
        blk2 = blk2.replace(tr, tr2, 1)
    h = h.replace(blk, blk2)
sub1(r'<span><a href="[^"]*">T-Mobile Official Site</a> - Free phones, great plans</span>', '<span><a href="http://www.mycricket.com/">Cricket Wireless</a> - Unlimited talk, no contract</span>')

# ---- popular searches ----
POP = ['Gold Prices', 'Wells Fargo', 'Berkshire Hathaway', 'Potassium Iodide', 'Pacific Exchange', 'FDIC', 'Raymond Calloway', 'Canadian Dollar', 'FedEx', 'Treasury Auction']
def short(s): return s if len(s) <= 14 else s[:13] + '...'
for i, q in enumerate(POP, 1):
    sub1(r'<li class="item-%d"><a href="[^"]*"><em>%d\.</em><strong>[^<]*</strong></a></li>' % (i, i),
         '<li class="item-%d"><a href="http://search.yahoo.com/search?p=%s&cs=bz"><em>%d.</em><strong>%s</strong></a></li>' % (i, q.replace(' ', '+'), i, short(q)))

# ---- footer data credits ----
sub1(r'<p>Historical chart data and daily updates provided by .*?Fundamental company data provided by <a [^>]*>Capital IQ</a>\.',
     '<p>Historical chart data and daily updates provided by <a href="http://www.wilshire.com/">Wilshire Associates</a>. International historical chart data and daily updates provided by <a href="http://www.thomsonreuters.com/">Thomson Reuters</a>. Quotes for securities listed on the New York Stock Exchange, NYSE Amex and The NASDAQ Stock Market show the last trade on May 28, 2009.')

# ---- remaining original images -> local files ----
IMG = {'http://l.yimg.com/a/i/brand/purplelogo/uh/us/fin.gif': 'res/fin.gif',
       'http://l.yimg.com/cz/lib/fi/us/p/d/static/images/3.0.87/2.0.0/backgrounds/transparent.gif': 'res/transparent.gif'}
for k, v in IMG.items(): h = h.replace(k, v)
h = re.sub(r' name="http://ichart[^"]*"', '', h)
left = re.findall(r'<img[^>]+src="http[^"]*"', h)
if left: sys.exit('remote images left: %r' % left[:5])
sub1(r'(<font face="Arial" size="-2" class="ad_slug_font">ADVERTISEMENT</font><br /></span>)', '<font face="Arial" size="-2" class="ad_slug_font">ADVERTISEMENT</font><br /></span>\n<div style="width:300px;height:263px;margin:0 auto"></div>')

# ======================= stylesheets, behaviour, output =======================
CSSMAP = {'http://l.yimg.com/a/i/us/uh/bt2/myyhp_sprite_v1.gif': 'res/myyhp_sprite.gif',
          'http://l.yimg.com/a/lib/uh/15/uh_sprites_1.5-1.0.3.png': 'res/uh_sprites.png',
          'http://l.yimg.com/cz/lib/fi/us/p/d/static/images/3.0.87/2.0.0/fp_backgrounds.png': 'res/fp_backgrounds.png',
          'http://l.yimg.com/cz/lib/fi/us/p/d/static/images/3.0.87/2.0.0/fp_tabs_icons.png': 'res/fp_tabs_icons.png',
          'http://l.yimg.com/cz/lib/fi/us/p/d/static/images/3.0.87/2.0.0/icons/loader.gif': 'res/loader.gif'}
css = ''
for f in ('yui_2-2-0.css', 'fp.css', 'uh-1.0.28.css'):   # same order as the page: yui + fp in <head>, uh in the header block
    s = rd(os.path.join(SRC, f))
    for k, v in CSSMAP.items(): s = s.replace(k, v)
    if re.search(r'url\(\s*["\']?http', s): sys.exit('remote url in ' + f)
    css += '/* %s */\n%s\n' % (f, s)
h = h.replace('</head>', '<style type="text/css">\n' + css + '</style>\n</head>', 1)

JS = r'''<script>(function(){
function tabs(id){var n=document.getElementById(id);if(!n)return;var lis=n.querySelectorAll('ul.yui-nav > li'),panes=[];for(var c=n.querySelector('.yui-content').firstChild;c;c=c.nextSibling)if(c.nodeType===1)panes.push(c);
[].forEach.call(lis,function(li,i){li.querySelector('a').addEventListener('click',function(e){e.preventDefault();[].forEach.call(lis,function(l,j){if(j===i){l.className='selected';l.setAttribute('title','active');}else{l.className='';l.removeAttribute('title');}});panes.forEach(function(p,j){p.style.display=j===i?'block':'none';});});});}
['market_summary_tabs','quotes_tabs','rates_tabs'].forEach(tabs);
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(a)e.preventDefault();});
document.addEventListener('submit',function(e){e.preventDefault();},true);
})();</script>'''
h = h.replace('</body>', JS + '\n</body>', 1)
h = re.sub(r'\n{3,}', '\n\n', h)

out_html = os.path.join(HERE, 'yf_home.html')
open(out_html, 'w', encoding='utf-8').write(h)

# self-contained copy for the Chrome window: every res/ file becomes a data: URI
MIME = {'.png': 'image/png', '.gif': 'image/gif', '.jpg': 'image/jpeg', '.ico': 'image/x-icon'}
RESJSON = os.path.join(HERE, 'res.json')   # the repo keeps res/ as base64 text (the GitHub tools here only push text)
def resbytes(name):
    p = os.path.join(RES, name)
    if os.path.exists(p): return open(p, 'rb').read()
    return base64.b64decode(json.load(open(RESJSON))[name])
def datauri(name):
    return 'data:%s;base64,%s' % (MIME[os.path.splitext(name)[1]], base64.b64encode(resbytes(name)).decode())
used = sorted(set(re.findall(r'res/([A-Za-z0-9_.-]+)', h)))
cache = {n: datauri(n) for n in used}
# stylesheet images are referenced many times: define each once as a custom property
cssimgs = sorted(set(re.findall(r'url\(\s*res/([A-Za-z0-9_.-]+)\s*\)', h)))
var = {n: '--yf%d' % i for i, n in enumerate(cssimgs)}
inl = re.sub(r'url\(\s*res/([A-Za-z0-9_.-]+)\s*\)', lambda m: 'var(%s)' % var[m.group(1)], h)
inl = inl.replace('<style type="text/css">\n', '<style type="text/css">\n:root{' + ''.join('%s:url(%s);' % (var[n], cache[n]) for n in cssimgs) + '}\n', 1)
inl = re.sub(r'res/([A-Za-z0-9_.-]+)', lambda m: cache[m.group(1)], inl)
open(os.path.join(HERE, 'yf_preview.html'), 'w', encoding='utf-8').write(inl)   # self-contained, for screenshots
FAV = datauri('favicon.ico')
TITLE = 'Yahoo! Finance - Business Finance, Stock Market, Quotes, News'
js = ('// yfpage.js - generated by sites/yf/mkyf.py: finance.yahoo.com front page, Thu Nov 5 2009 (archived 2009-11-06 04:13 UTC markup + CSS, in-world content)\n'
      '(function () {\n  window.YF_FAV = %s;\n  var SRC = %s;\n'
      '  (window.CWSITES = window.CWSITES || {}).yahoofinance = function (W) {\n'
      '    var ifr = document.createElement(\'iframe\'); ifr.setAttribute(\'title\', \'Yahoo! Finance\'); ifr.srcdoc = SRC;\n'
      '    return W.open({ title: %s, fav: window.YF_FAV, host: \'finance.yahoo.com\', path: \'/\', node: ifr });\n  };\n})();\n'
      ) % (json.dumps(FAV), json.dumps(inl).replace('</', '<\\/'), json.dumps(TITLE))
out_js = os.path.join(HERE, '..', '..', 'yfpage.js') if len(sys.argv) < 2 else sys.argv[1]
open(out_js, 'w', encoding='utf-8').write(js)
print('wrote', out_html, len(h), 'and', out_js, len(js), 'images:', len(used))
