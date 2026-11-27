# fvdata.py - who still trades on Thursday Nov 5 2009, at what price, and why the rest don't.
# Faction of each headquarters follows site/county_factions_final.json, with the later polygon factions
# (mcs, elc, dwg lakeshore, frk) and the wiki's I-15 corridor to Las Vegas applied by hand.
import os, re, random
HERE = os.path.dirname(os.path.abspath(__file__))

GILEAD_NY = {'New York', 'Armonk', 'Purchase', 'Somers', 'White Plains', 'Islandia', 'New Hyde Park', 'East Hills'}
TEXAS = {'Dallas', 'Houston', 'Irving', 'Fort Worth', 'San Antonio', 'Austin', 'Plano', 'Round Rock', 'The Woodlands', 'Grapevine', 'McKinney', 'Richardson'}
DWG = {'Chicago', 'Northbrook', 'Glenview', 'Schaumburg', 'Hoffman Estates', 'Northfield', 'Deerfield', 'Lake Forest', 'Abbott Park', 'Riverwoods', 'Milwaukee', 'Menomonee Falls', 'Kenosha', 'Peoria'}
MCS = {'Charlotte', 'Matthews', 'Mooresville', 'Winston-Salem', 'Greensboro', 'Burlington'}
FRC = {'Miami', 'Fort Lauderdale', 'Jacksonville', 'Tampa', 'St. Petersburg', 'Juno Beach', 'Boca Raton', 'New Orleans'}
FEMA = {'Minneapolis', 'St. Paul', 'Eden Prairie', 'Minnetonka', 'Richfield'}
CASC = {'Seattle', 'Redmond', 'Issaquah', 'Bellevue', 'Federal Way', 'Beaverton', 'Portland', 'Wilsonville'}

def faction(city, st):
    s = st.split('-')[0]
    if s in ('CA', 'AZ') or (s == 'NV' and city == 'Las Vegas'): return 'usg'
    if city in CASC: return 'cascadia'
    if s in ('NJ', 'CT', 'DE', 'DC', 'MD', 'RI', 'MA') or st in ('PA-PHL', 'VA-N') or (s == 'NY' and city in GILEAD_NY): return 'gilead'
    if city in TEXAS: return 'texas'
    if city in DWG: return 'dwg'
    if city in MCS: return 'mcs'
    if city in FRC: return 'frc'
    if city in FEMA: return 'fema'
    if city in ('Springdale', 'Bentonville'): return 'elc'
    if city == 'Tulsa': return 'sequoyah'
    if city == 'Salt Lake City': return 'lds'
    if city in ('Kingsport', 'Bristol'): return 'frk'
    if city == 'Knoxville': return 'agg'
    if city == 'Chattanooga': return 'ttc'
    if city == 'Memphis': return 'memphis'
    if s == 'BM': return 'foreign'
    return 'none'

NAME = {'gilead': 'Republic of Gilead', 'texas': 'Republic of Texas', 'dwg': "Calumet-Lakeshore Workers' Council", 'mcs': 'Mecklenburg Committee of Safety',
        'frc': 'Federal Remnants Command', 'fema': 'FEMA Northern Tier', 'elc': 'Elohim City', 'sequoyah': 'State of Sequoyah', 'lds': 'LDS Church',
        'frk': 'State of Franklin', 'agg': 'Appalachian Guerrilla Govt.', 'ttc': 'Twelve Tribes Communities', 'memphis': 'Millington strike zone', 'none': 'Radio Silence zone'}
MOVED = {'BAC': ('San Francisco', 'CA', 'HQ moved from Charlotte, Nov 2009'), 'BA': ('Seattle', 'WA', 'HQ moved from Chicago, Mar 2009'), 'XL': ('Hamilton', 'BM', 'listed in San Francisco since Aug 2009')}

# trading names: real close Wed Nov 4 2009 (approx.), in-world factor vs. real, Thursday change %
TR = '''
A 25.0 .38 -10.9|AAPL 188.7 .45 -9.8|ADBE 33.5 .39 -11.6|ADSK 24.5 .33 -12.4|AGN 57.2 .22 -7.9|ALTR 19.9 .40 -12.1|AMAT 12.4 .35 -13.2|AMD 4.4 .38 -14.6
AMGN 54.2 .55 -5.8|AVY 35.0 .30 -9.4|BEN 105 .30 -13.9|BRCM 28.8 .24 -12.8|CBG 11.2 .22 -15.8|CLX 60.1 .30 -5.0|CRM 57.4 .35 -12.2|CSCO 23.4 .38 -10.4
CVX 77.6 .5303 -7.17|DIS 28.6 .4235 -8.59|DTV 32.0 .40 -9.1|DVA 54.5 .50 -6.3|EBAY 23.1 .36 -11.8|EIX 32.0 .45 -5.9|ERTS 18.4 .30 -12.9|GILD 43.8 .55 -5.4
GOOG 540 .42 -10.2|GPS 21.6 .35 -10.6|HCP 29.0 .25 -16.3|HPQ 47.5 .36 -10.9|INTC 19.3 .40 -11.3|INTU 29.0 .43 -9.7|ISRG 262 .35 -11.4|JAVA 8.3 .35 -13.8
JDSU 6.6 .33 -13.5|JEC 39.2 .62 1.35|JNPR 25.0 .36 -12.6|KBH 15.0 .26 -16.0|KLAC 32.5 .36 -13.1|LIFE 47.0 .45 -7.2|LLTC 26.6 .40 -11.5|LSI 5.2 .35 -13.9
MAT 19.2 .30 -10.1|MCK 59.5 .40 -7.7|MFE 41.2 .42 -10.8|NOC 51.0 .75 4.12|NSM 13.2 .36 -12.7|NTAP 26.8 .38 -12.3|NVDA 12.9 .43 -12.4|NVLS 21.4 .33 -13.4
ORCL 21.0 .40 -9.9|OXY 76.4 .55 -2.85|PCG 41.5 .38 -6.8|PSA 72.0 .30 -15.5|QCOM 41.5 .44 -10.1|QLGC 17.2 .20 -12.0|RHI 24.5 .25 -11.7|SCHW 17.6 .31 -14.1
SNDK 19.3 .42 -12.9|SRE 50.5 .48 -5.5|SWY 22.4 .33 -3.1|SYMC 17.4 .45 -9.2|VAR 42.5 .40 -8.8|VRSN 23.2 .40 -10.3|WDC 34.9 .21 -12.5|WFC 28.2 .2911 -16.69
WPI 34.5 .42 -6.6|XLNX 22.4 .40 -11.8|YHOO 16.0 .38 -11.1|APOL 56.0 .30 -9.0|FCX 75.0 1.5995 18.06|MCHP 25.3 .40 -11.0|PNW 31.5 .50 -5.2|RSG 26.4 .45 -4.5
WYNN 56.5 .25 -14.5|AMZN 119.5 .33 -12.8|BA 47.5 .38 -6.4|COST 57.5 .52 -4.2|EXPD 33.5 .30 -10.5|EXPE 22.8 .22 -13.6|FLIR 28.5 .80 6.8|JWN 33.0 .30 -11.4
MSFT 28.0 .47 -9.3|NKE 63.0 .35 -10.2|PCAR 37.5 .40 -9.6|PCL 31.0 .45 -8.1|PCP 103 .55 1.9|SBUX 19.6 .28 -11.9|WY 37.0 .42 -8.4|BAC 15.3 .121 -17.4
XL 17.5 .30 -19.2'''
QUOTE = {}
for part in re.split(r'[|\n]', TR.strip()):
    if not part.strip(): continue
    t, real, f, ch = part.split(); real, f, ch = float(real), float(f), float(ch)
    prev = round(real * f, 2); last = round(prev * (1 + ch / 100), 2)
    QUOTE[t] = dict(prev=prev, last=last, chg=round(last - prev, 2), pct=round((last / prev - 1) * 100, 2), real=real)

def load():
    hq = {}
    for line in open(os.path.join(HERE, 'hq2009.txt'), encoding='utf-8'):
        if line.startswith('#') or not line.strip(): continue
        t, c, s = line.strip().split('|'); hq[t] = (c, s)
    out = {}
    for t, (c, s) in hq.items():
        note = ''
        if t in MOVED: c, s, note = MOVED[t]
        fac = faction(c, s)
        trading = t in QUOTE
        if trading and fac not in ('usg', 'cascadia', 'foreign'): raise SystemExit('trading outside federal/Cascadia: ' + t)
        if not trading and fac in ('usg', 'cascadia'): raise SystemExit('missing quote for ' + t)
        out[t] = dict(city=c, st=s.split('-')[0], fac=fac, note=note, trading=trading, **(QUOTE.get(t) or {}))
    return out

if __name__ == '__main__':
    d = load(); tr = [t for t in d if d[t]['trading']]
    print(len(d), 'companies,', len(tr), 'trading')
    from collections import Counter
    print(Counter(v['fac'] for v in d.values()).most_common())


# non-S&P names used in signal tables and the screener: ticker|company|city|industry|real Nov 4 2009 close|factor|change %|real Feb 13 close
EXTRA_SRC = """UCBH|UCBH Holdings Inc.|San Francisco|Regional - Pacific Banks|0.85|.40|-38.2|1.45
PCBC|Pacific Capital Bancorp|Santa Barbara|Regional - Pacific Banks|1.62|.35|-27.3|7.10
HAFC|Hanmi Financial Corp.|Los Angeles|Regional - Pacific Banks|1.25|.30|-24.6|1.20
MCY|Mercury General Corp.|Los Angeles|Property & Casualty Insurance|36.90|.3187|-22.19|33.0
ZNT|Zenith National Insurance Corp.|Woodland Hills|Property & Casualty Insurance|28.50|.30|-21.4|23.5
CYN|City National Corp.|Los Angeles|Regional - Pacific Banks|37.80|.31|-19.8|31.0
EWBC|East West Bancorp Inc.|Pasadena|Regional - Pacific Banks|8.90|.27|-19.5|7.60
CATY|Cathay General Bancorp|Los Angeles|Regional - Pacific Banks|8.00|.26|-18.9|10.20
SIVB|SVB Financial Group|Santa Clara|Regional - Pacific Banks|41.00|.30|-17.9|20.5
MGM|MGM Mirage|Las Vegas|Resorts & Casinos|9.00|.20|-18.4|5.90
LVS|Las Vegas Sands Corp.|Las Vegas|Resorts & Casinos|15.80|.22|-16.8|4.20
SPF|Standard Pacific Corp.|Irvine|Residential Construction|3.30|.18|-17.1|1.50
RYL|Ryland Group Inc.|Calabasas|Residential Construction|18.50|.25|-15.9|17.3
ALK|Alaska Air Group Inc.|Seattle|Regional Airlines|26.00|.38|-15.2|26.5
HA|Hawaiian Holdings Inc.|Honolulu|Regional Airlines|6.90|.33|-14.9|4.50
ESS|Essex Property Trust Inc.|Palo Alto|REIT - Residential|74.00|.27|-14.6|64.0
MAC|Macerich Co.|Santa Monica|REIT - Retail|30.00|.22|-15.3|13.4
WABC|Westamerica Bancorp.|San Rafael|Regional - Pacific Banks|48.50|.36|-13.2|43.0
ATVI|Activision Blizzard Inc.|Santa Monica|Multimedia & Graphics Software|11.10|.40|-11.2|9.60
CPST|Capstone Turbine Corp.|Chatsworth|Industrial Electrical Equipment|1.20|1.90|38.5|0.72
OSIS|OSI Systems Inc.|Hawthorne|Scientific & Technical Instruments|25.60|1.20|24.1|14.0
NG|NovaGold Resources Inc.|Vancouver|Gold|5.00|2.00|21.3|2.60
PWER|Power-One Inc.|Camarillo|Industrial Electrical Equipment|2.50|1.60|19.8|0.40
SLW|Silver Wheaton Corp.|Vancouver|Silver|13.00|2.10|17.7|6.90
AVAV|AeroVironment Inc.|Monrovia|Aerospace/Defense Products & Services|27.50|1.30|16.4|31.0
PCU|Southern Copper Corp.|Phoenix|Copper|32.00|1.50|15.2|15.0
TTEK|Tetra Tech Inc.|Pasadena|Technical Services|25.00|1.15|14.9|22.0
GG|Goldcorp Inc.|Vancouver|Gold|38.50|1.90|13.9|33.0
ABX|Barrick Gold Corp.|Toronto|Gold|37.00|1.85|12.6|36.0
MXWL|Maxwell Technologies Inc.|San Diego|Industrial Electrical Equipment|17.00|1.20|12.7|6.50
KGC|Kinross Gold Corp.|Toronto|Gold|19.50|1.80|11.4|18.6
URS|URS Corp.|San Francisco|Technical Services|40.00|.95|11.2|36.0
CUB|Cubic Corp.|San Diego|Aerospace/Defense Products & Services|36.00|1.10|9.8|27.0"""
EXTRA = {}
for line in EXTRA_SRC.splitlines():
    t, n, city, ind, real, f, ch, feb = line.split('|')
    real, f, ch, feb = float(real), float(f), float(ch), float(feb)
    prev = round(real * f, 2); last = round(prev * (1 + ch / 100), 2)
    EXTRA[t] = dict(name=n, city=city, industry=ind, prev=prev, last=last, chg=round(last - prev, 2), pct=round((last / prev - 1) * 100, 2), feb=feb, trading=True)

# approximate real closes on Fri Feb 13 2009 (last normal session) for the S&P names that get a chart
FEB13 = dict(AAPL=99.27, GOOG=357.68, MSFT=19.09, INTC=13.40, CSCO=15.96, ORCL=16.40, WFC=16.50, BAC=5.65, CVX=70.92, DIS=19.60, AMZN=64.50,
             FCX=29.80, QCOM=34.30, HPQ=34.18, SCHW=14.10, BEN=50.50, CBG=4.10, HCP=21.40, PSA=55.20, KBH=11.20, XL=4.90, WYNN=26.50, EXPE=8.90,
             AMD=2.30, JAVA=4.40, NVLS=13.30, AMAT=9.60, KLAC=19.40, LSI=3.30, JDSU=3.10, SNDK=10.50, ADSK=14.90, ERTS=17.60, NOC=42.30, FLIR=24.0)
