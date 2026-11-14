# stage 2 of mkcl.py: listing + posting pages (exec'd inside mkcl.py; uses R, css, h, re, json, base64)
import sys, os, html as H_
sys.path.insert(0, '/workspace/work/gm/sites')
from cl_posts import *

z = open(R + 'zip.html', encoding='latin-1').read()
z = re.sub(r'<link rel="stylesheet"[^>]*>', lambda m: '<style>' + css + '</style>', z)
z = re.sub(r'<link rel=alternate[^>]*>', '', z)
zhead = z[:z.index('<h4>')]
zfoot = z[z.index('<p align="center">'):]
zfoot = re.sub(r'<script type="text/javascript" src="http://www.craigslist.org/js/tocs.js"></script>.*?</script>', '', zfoot, flags=re.S)
DAYS = {7: 'Sat Nov 7', 6: 'Fri Nov 6', 5: 'Thu Nov 5'}
SAFE = '<span class="hl"> [ <b><a href="/about/safety">PERSONAL SAFETY TIPS</a></b> ] </span> '
SCAM = '<span class="hl"> [ <b><a href="/about/scams">AVOIDING SCAMS &amp; FRAUD</a></b> ] </span> '
MSG_SSS = ('<span class="hl"> [ <a href="/about/prohibited.items">partial list of prohibited items</a> ] </span> '
  '<span class="hl"> [ <b><font color="red">ALERT</font> - <a href="/about/scams#permits">offers to sell travel permits or border passes are fraudulent</a></b> ] </span> '
  '<span class="hl"> [ please flag fuel price gouging ] </span> <span class="hl"> [ <a href="http://www.recalls.gov/">avoid recalled items</a> ] </span> '
  + SAFE + SCAM + '<span class="hl"> [<a href="/cgi-bin/success.stories.cgi">success story?</a>]</span>')
MSG_APA = ('<span class="hl"> [ <a href="/about/FHA">fair housing</a> ] </span> <span class="hl"> [ <b><font color="red">ALERT</font> - <a href="/about/scams">never wire money to a landlord you have not met - rental scams targeting relocating families are up sharply</a></b> ] </span> ' + SAFE + SCAM)
MSG_LAF = ('<span class="hl"> [ please do not post SSN or ID numbers in lost &amp; found ] </span> <span class="hl"> [ missing persons: also contact your county sheriff ] </span> ' + SAFE)

def esc(t): return H_.escape(t, quote=False)

def listing(code, name, rows, msgs, mixed):
  hd = zhead.replace('free stuff', name).replace('/zip/', '/%s/' % code).replace('search/zip', 'search/' + code).replace('"zip"', '"%s"' % code)
  hd = hd.replace(' selected>', '>')
  hd = hd.replace('<option value="%s">' % code, '<option value="%s" selected>' % code, 1)
  hd = re.sub(r'\[ [A-Z][a-z]{2}, \d\d [A-Z][a-z]{2} [\d:]+ \]', '[ Sat, 07 Nov 23:58:14 ]', hd)
  hd = re.sub(r'(<td valign="top" id="messages">).*?(</td>)', lambda m: m.group(1) + msgs + ' ' + m.group(2), hd, flags=re.S)
  out = []; last = None
  for r in rows:
    pid, cat, day, tm, title, price, loc, img, kind, body, _ = r
    if day != last: out.append('<h4>%s</h4>' % DAYS[day]); last = day
    t = esc(title) + (' - ' + price if price and code != 'apa' else '') + ' -'
    p = '<p><a href="/%s/%d.html">%s</a>' % (cat, pid, t)
    if loc: p += '<font size="-1"> (%s)</font>' % esc(loc)
    if img: p += ' <span class="p"> pic</span>'
    if mixed: p += ' &lt;&lt;<i><a href="/%s/">%s</a></i>' % (cat, SHORT[cat].replace(' ', '&nbsp;'))
    out.append(p + '</p>')
  return hd + '\n'.join(out) + '\n<br>\n' + zfoot

IMG = {}
for r in SSS + APA + CCC:
  if r[7]: IMG[r[7]] = 'data:image/jpeg;base64,' + base64.b64encode(open('/workspace/work/gm/sites/cl_img/%s.jpg' % r[7], 'rb').read()).decode()

pt = open(R + 'post_laf.html', encoding='latin-1').read()
pt = re.sub(r'<link rel="stylesheet"[^>]*>', lambda m: '<style>' + css + '</style>', pt)
pt = re.sub(r'<link rel="shortcut icon"[^>]*>', '', pt)
pt = pt[:pt.index('<script type="text/javascript" src="http://www.craigslist.org/js/jquery.js">')] + '</body>\n</html>\n'
GROUP = {'apa': ('hhh', 'housing')}
for _c in ('laf','com','eve','vol','act','rid','cls','pet','grp'): GROUP[_c] = ('ccc', 'community')
MAILTAIL = {'sale': 'sale', 'zip': 'zip', 'bar': 'bart', 'gms': 'sale', 'wan': 'wntd', 'apa': 'hous', 'laf': 'comm', 'flagged': 'sale', 'com': 'comm', 'eve': 'evnt', 'vol': 'volt', 'act': 'comm', 'rid': 'ride', 'cls': 'clas', 'pet': 'pets'}
IMGTAB = '''
		<table summary="craigslist hosted images">
			<tr>
				<td align="center"><img src="%s" alt="image %d-0"></td>
				<td align="center"></td>
			</tr>
			<tr>
				<td align="center"></td>
				<td align="center"></td>
			</tr>
		</table>
'''

def post(r):
  pid, cat, day, tm, title, price, loc, img, kind, body, _ = r
  g = GROUP.get(cat, ('sss', 'for sale / wanted'))
  ttl = title + (' - ' + price if price and cat != 'apa' else '')
  h2 = esc(ttl) + (' (%s)' % esc(loc) if loc else '')
  p = re.sub(r'<title>.*?</title>', lambda m: '<title>%s</title>' % esc(ttl), pt)
  p = p.replace('1384562229', str(pid))
  p = p.replace('<a href="http://spokane.craigslist.org/ccc/">community</a>', '<a href="http://spokane.craigslist.org/%s/">%s</a>' % g)
  p = p.replace('<a href="http://spokane.craigslist.org/laf/">lost &amp; found</a>', '<a href="http://spokane.craigslist.org/%s/">%s</a>' % (cat, esc(CATN[cat])))
  a = p.index('<h2>'); b = p.index('PostingID:')
  if kind == 'flagged':
    mid = '<h2>%s</h2>\n<hr>\n<br>\n<div id="userbody">%s</div>\n<br>\n' % (h2, FLAGGED)
  else:
    tag = ''.join('abcdefghjkmnpqrstuvwxyz23456789'[(pid >> (i * 5)) % 31] for i in range(5))
    mail = '%s-%s-%d@craigslist.org' % (MAILTAIL[kind], tag, pid)
    bd = '<br>\n'.join(esc(x) for x in body.split('\n'))
    imgs = IMGTAB % (IMG[img], pid) if img else ''
    locli = ('<li> <!-- CLTAG GeographicArea=%s -->Location: %s\n' % (esc(loc), esc(loc))) if loc else ''
    mid = ('<h2>%s</h2>\n<hr>\nDate: 2009-11-%02d, %s PST<br>\nReply to: <a href="#">%s</a> <sup>[<a href="http://www.craigslist.org/about/help/replying_to_posts" target="_blank">Errors when replying to ads?</a>]</sup><br>\n<hr>\n<br>\n'
           '<div id="userbody">\n%s <!-- START CLTAGS -->\n\n\n<br><br><ul class="blurbs">\n%s<li>it\'s NOT ok to contact this poster with services or other commercial interests</ul>\n<!-- END CLTAGS -->%s\n</div>\n') % (h2, day, tm.rjust(7), mail, bd, locli, imgs)
  return p[:a] + mid + p[b:]

PAGES = {'/': h}
PAGES['/sss/'] = listing('sss', 'for sale / wanted', SSS, MSG_SSS, True)
PAGES['/apa/'] = listing('apa', 'apts/housing for rent', APA, MSG_APA, False)
PAGES['/laf/'] = listing('laf', 'lost & found', LAF, MSG_LAF, False)
PAGES['/ccc/'] = listing('ccc', 'community', CCC, MSG_LAF, True)
for r in SSS + APA + CCC: PAGES['/%s/%d.html' % (r[1], r[0])] = post(r)
# ---- discussion forums: /forums/, /forums/?forumID=<fid>, /forums/?ID=<threadID> ----
FCSS = ('<style>.ftab{border-collapse:collapse;width:95%;margin:6px 0 10px 0;font-size:small}.ftab th{background:#ddd;border:1px solid #999;text-align:left;padding:3px 6px;font-weight:bold}'
  '.ftab td{border:1px solid #ccc;padding:3px 6px;vertical-align:top}.ftab tr.alt td{background:#f3f3f3}.ftab td.n{text-align:right;width:4em}.ftab td.h{width:12em}.ftab td.d{width:7em;white-space:nowrap}'
  '.ftab tr.pin td{background:#ffc}.fdesc{font-size:small;color:#555;margin:4px 0 8px 0}.fpost{border-top:1px solid #aaa;margin:0 0 14px 0;padding:4px 0 0 0;width:90%}'
  '.fph{background:#eee;padding:2px 5px;font-size:small}.fph b{color:#000}.fpb{padding:8px 5px 2px 5px;font-family:monospace;font-size:13px;white-space:normal}.fbar{font-size:small;margin:4px 0 8px 0}</style>')
def fhead(title, crumbs):
  return ('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">\n<html><head>\n<title>%s</title>\n<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">\n<style>%s</style>%s\n</head>\n<body class="toc">\n'
    '<div class="bchead"><span id="ef">[ <a href="http://www.craigslist.org/about/help/">help</a> ] [ <a href="#">post</a> ]</span>\n<a href="/"> spokane craigslist</a> &gt; %s</div>\n<blockquote>\n') % (esc(title), css, FCSS, crumbs)
FFOOT = ('</blockquote>\n<br><p align="center"><font size="2">'
  '<a href="http://www.craigslist.org/about/help/forums">forum help</a> - <a href="http://www.craigslist.org/about/terms.of.use">terms of use</a> - '
  '<a href="http://www.craigslist.org/about/privacy_policy">privacy</a><br><br>Copyright &copy; 2009 craigslist, inc.</font></p>\n</body>\n</html>\n')
FTL = '<a href="/forums/">discussion forums</a>'
def fdate(d): return '%s/%s/09 %s' % (d[:2], d[3:5], d[6:])
def forum_list(fid):
  lab, name, blurb, ths = FORUMS[fid]
  rows = ['<tr><th>subject</th><th>handle</th><th>replies</th><th>last post</th></tr>']
  for i, (tid, subj, hnd, n, dt, posts, pin) in enumerate(sorted(ths, key=lambda t: (not t[6], -int(t[4][:2]+t[4][3:5]+t[4][6:8]+t[4][9:]))) ):
    lnk = '/forums/?ID=%d' % tid if posts else '#'
    s = '<a href="%s">%s</a>' % (lnk, esc(subj))
    if pin: s = '<b>[note]</b> ' + s
    rows.append('<tr class="%s"><td>%s</td><td class="h">%s</td><td class="n">%s</td><td class="d">%s</td></tr>' % ('pin' if pin else ('alt' if i % 2 else ''), s, esc(hnd), n if not pin else '-', fdate(dt)))
  others = ' | '.join('<a href="/forums/?forumID=%s">%s</a>' % (k, v[1]) if k != fid else '<b>%s</b>' % v[1] for k, v in FORUMS.items())
  return (fhead('spokane craigslist %s forum' % name, FTL + ' &gt; <a href="/forums/?forumID=%s">%s</a>' % (fid, name))
    + '<h3 style="margin:6px 0 2px 0">%s forum</h3>\n<div class="fdesc">%s</div>\n' % (name, blurb)
    + '<div class="fbar">[ <a href="#">post new thread</a> ] [ <a href="#">search this forum</a> ] &nbsp; forums: %s</div>\n' % others
    + '<table class="ftab" summary="threads">\n' + '\n'.join(rows) + '\n</table>\n'
    + '<div class="fdesc">showing threads from the last 48 hours &middot; <a href="#">older threads</a></div>\n' + FFOOT)
def forum_thread(fid, th):
  tid, subj, hnd, n, dt, posts, pin = th
  out = []
  for j, (who, when, body) in enumerate(posts):
    bd = '<br>\n'.join(esc(x) for x in body.split('\n'))
    lbl = 'original post' if j == 0 else 'reply %d' % j
    out.append('<div class="fpost"><div class="fph"><b>%s</b> &nbsp;-&nbsp; %s PST &nbsp;<span class="greytext">[ %s ]</span> &nbsp; <a href="#">reply</a></div>\n<div class="fpb">%s</div></div>' % (esc(who), when, lbl, bd))
  name = FORUMS[fid][1]
  return (fhead(subj, FTL + ' &gt; <a href="/forums/?forumID=%s">%s</a> &gt; thread' % (fid, name))
    + '<h2 style="margin:8px 0 2px 0">%s</h2>\n<div class="fdesc">%d replies &middot; thread ID %d</div>\n' % (esc(subj), n, tid)
    + '\n'.join(out)
    + '\n<div class="fbar">[ <a href="#">reply to this thread</a> ] &nbsp; [ <a href="/forums/?forumID=%s">back to %s forum</a> ]</div>\n' % (fid, name) + FFOOT)
def forum_index():
  rows = ['<tr><th>forum</th><th>threads (48 hrs)</th><th>last post</th></tr>']
  for i, (k, (lab, name, blurb, ths)) in enumerate(FORUMS.items()):
    rows.append('<tr class="%s"><td><a href="/forums/?forumID=%s">%s</a></td><td class="n">%d</td><td class="d">%s</td></tr>' % ('alt' if i % 2 else '', k, name, len(ths), fdate(max(t[4] for t in ths))))
  return (fhead('spokane craigslist discussion forums', FTL)
    + '<h3 style="margin:6px 0 2px 0">discussion forums</h3>\n<div class="fdesc">most spokane forums are read-only while we work on the site. thanks for your patience.</div>\n'
    + '<table class="ftab" style="width:60%" summary="forums">\n' + '\n'.join(rows) + '\n</table>\n' + FFOOT)
PAGES['/forums/'] = forum_index()
for _fid, (_lab, _nm, _bl, _ths) in FORUMS.items():
  PAGES['/forums/?forumID=%s' % _fid] = forum_list(_fid)
  PAGES['/'] = re.sub(r'<a href="/forums/\?forumID=\d+">%s</a>' % re.escape(_lab), '<a href="/forums/?forumID=%s">%s</a>' % (_fid, _lab), PAGES['/'])
  for _t in _ths:
    if _t[5]: PAGES['/forums/?ID=%d' % _t[0]] = forum_thread(_fid, _t)
assert PAGES['/'].count('/forums/?forumID=garden"') == 1 and PAGES['/'].count('/forums/?forumID=pets"') == 1 and PAGES['/'].count('/forums/?forumID=politics"') == 1
TITLES = {'/': "craigslist: spokane / coeur d'alene classifieds for jobs, apartments, personals, for sale, services, community, and events"}
for k, v in PAGES.items():
  m = re.search(r'<title>(.*?)</title>', v, re.S)
  TITLES.setdefault(k, H_.unescape(m.group(1).strip()) if m else 'craigslist')

ROUTER = ('<script>(function(){document.addEventListener("click",function(e){var a=e.target.closest("a");if(!a)return;e.preventDefault();'
  'var h=a.getAttribute("href")||"";h=h.replace(/^http:\\/\\/spokane\\.craigslist\\.org/,"");'
  'if(!h||h.charAt(0)==="#"||/^[a-z]+:/.test(h))return;if(h.charAt(0)!=="/")h="/"+h;parent.postMessage({cl:h},"*");},true);})();</script>')
OLD = '<script>document.addEventListener("click",function(e){var a=e.target.closest("a");if(a){e.preventDefault();}},true);</script>'
for k in PAGES:
  PAGES[k] = PAGES[k].replace(OLD, '').replace('</head>', ROUTER + '\n</head>', 1)
