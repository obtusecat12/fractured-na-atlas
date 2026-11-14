# mkbp.py - builds /workspace/work/gm/bppage.js : boston.com The Big Picture, entry of Nov 30 2009 (in-universe)
import re, base64, io, os, json, html, sys
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
import bp_content as C
D = os.path.dirname(os.path.abspath(__file__)); R = D + '/ref/'
src = open(R + 'entry.html', encoding='latin-1').read()

def b64(path, mime):
    return 'data:%s;base64,%s' % (mime, base64.b64encode(open(path, 'rb').read()).decode())

ASSETS = {}
for f in os.listdir(R):
    if f.endswith('.gif'): ASSETS[f] = b64(R + f, 'image/gif')
ASSETS['glogo.jpg'] = b64(R + 'glogo.jpg', 'image/jpeg')
def asset_url(m):
    u = m.group(0); name = u.rstrip('"\')').split('/')[-1].strip('"\')')
    return ASSETS.get(name)

def fix_urls(s):
    # replace known asset urls; kill other external images in css
    def rep_attr(m):
        name = m.group(2).split('/')[-1]
        if name in ASSETS: return m.group(1) + ASSETS[name] + m.group(3)
        return m.group(1) + m.group(2) + m.group(3)
    s = re.sub(r'(src=")(http://[^"]+)(")', rep_attr, s)
    def rep_css(m):
        name = m.group(1).strip('"\'').split('/')[-1]
        return 'url(%s)' % ASSETS[name] if name in ASSETS else 'none'
    s = re.sub(r'(?<![A-Za-z])url\(([^)]*)\)', rep_css, s)
    return s

# ---- head ----
head = src[:src.find('<body')]
head = re.sub(r'<script.*?</script>', '', head, flags=re.S|re.I)
head = re.sub(r'<!--\[if IE\]>.*?<!\[endif\]-->', '', head, flags=re.S)
def inline_css(m):
    href = re.search(r'href="([^"]+)"', m.group(0)).group(1); name = href.split('/')[-1]
    p = R + name
    if os.path.exists(p): return '<style type="text/css">\n' + open(p, encoding='latin-1').read() + '\n</style>'
    return ''
head = re.sub(r'<link[^>]*stylesheet[^>]*>', inline_css, head)
head = re.sub(r'<link[^>]*>', '', head)
head = re.sub(r'<title>.*?</title>', '<title>%s - The Big Picture - Boston.com</title>' % html.escape(C.TITLE), head)
head = head.replace('<head>', '<head><base target="_self">', 1)

body = src[src.find('<body'):]
body = re.sub(r'<script.*?</script>', '', body, flags=re.S|re.I)
body = re.sub(r'<noscript>.*?</noscript>', '', body, flags=re.S|re.I)
body = body.replace('onload="bpload()"', '')

# ---- entry block ----
a = body.find('<table cellpadding="0" cellspacing="0" class="tableTop">')
b = body.find('<div class="hideMe"')
assert a > 0 and b > a
url = 'http://www.boston.com' + C.SLUG
def esc(t): return html.escape(t, quote=False)
imgs = []
for i, (stem, cap) in enumerate(C.PHOTOS):
    p = D + '/raw/%s.png' % stem
    if not os.path.exists(p):
        imgs.append((None, 660, cap)); continue
    im = Image.open(p).convert('RGB')
    h = round(990 * im.height / im.width)
    im = im.resize((990, h), Image.LANCZOS)
    bio = io.BytesIO(); im.save(bio, 'JPEG', quality=70, optimize=True, progressive=False)
    imgs.append(('data:image/jpeg;base64,' + base64.b64encode(bio.getvalue()).decode(), h, cap))

E = []
E.append('''<table cellpadding="0" cellspacing="0" class="tableTop">
	<tr valign="top">
	<td id="commentCountTd"><span class="blackNodot"><div class="commCtDiv"><a href="%s#comments"><span id="commentCount">%d</span> comments</a></div></span></td>
	<td class="beLeftCol"><span id="dateline">%s</span></td>
	<td class="beRightCol"><span class="noDot"><a href="#"><img style="vertical-align:middle" src="%s"> E-mail this</a> &nbsp; <a href="%s"><img style="vertical-align:middle" src="%s"> Link</a></span></td>
	</tr>
</table>
<div class="headDiv2">
<div id="shareBp"><a href="#">Share</a></div>
	<h2><a href="%s">%s</a></h2>
	<span class="blogText bigText"><div class="bpBody">%s</div>''' % (url, C.COMMENTS, C.DATE, ASSETS['icon_ma.gif'], url, ASSETS['icon_link.gif'], url, esc(C.TITLE), esc(C.INTRO)))
def imgtag(src, h):
    if src is None:
        return '<div class="bpImage" style="height:%dpx;width:990px;background:#222;color:#666;text-align:center;line-height:%dpx">image loading</div>' % (h, h)
    return '<img src="%s" class="bpImage" style="height:%dpx;width:990px" />' % (src, h)
s0, h0, c0 = imgs[0]
E.append('<div class="bpImageTop"><a name="photo1"></a><a href="%s">%s</a><br/><div class="bpCaption">%s <div class="cf"></div></div></div></span>' % (url, imgtag(s0, h0), esc(c0)))
E.append('<span class="bpMore">')
for i, (s1, h1, c1) in enumerate(imgs[1:], start=2):
    E.append('<div class="bpBoth"><a name="photo%d"></a>%s<br/><div class="bpCaption"><div class="photoNum"><a href="#photo%d">%d</a></div>%s <a href="#photo%d">#</a><div class="cf"></div></div></div>' % (i, imgtag(s1, h1), i, i, esc(c1), i))
E.append('<br/><div id="moreLinks">\n<div id="moreHeader">More links and information</div>')
for t, srcn in C.MORE_LINKS:
    E.append('<div class="moreLink"><a href="#">%s</a> - %s</div>' % (esc(t), esc(srcn)))
E.append('</div>\n\t</span>\n</div>\n<div class="bottomFrontPage"><a href="#">&lt; Back to front page</a></div>\n<div><ul id="blogentryPrevNext">\n<li class="prevNext"><span class="arrowLeft">&nbsp;</span><a href="#">Previous entry</a></li>\n</ul></div>\n')
body = body[:a] + '\n'.join(E) + body[b:]
body = re.sub(r'<div class="hideMe".*?</div>', '', body, count=1, flags=re.S)
body = re.sub(r'<div id="bkAd">.*?</div>', '', body, flags=re.S)

# recent entries (header + right nav)
def lis(items): return '\n'.join('<li>&bull; <a href="#">%s</a> - %s</li>' % (esc(t), d) for t, d in items)
body = re.sub(r'(<ul id="moreList">).*?(</ul>)', lambda m: m.group(1) + '\n' + lis(C.RECENT[1:4]) + '\n' + m.group(2), body, count=1, flags=re.S)
body = re.sub(r'(<ul id="rnavMoreList">).*?(</ul>)', lambda m: m.group(1) + '\n' + lis(C.RECENT) + '\n' + m.group(2), body, count=1, flags=re.S)
# archive / category dropdowns
months = ['November 2009','October 2009','September 2009','August 2009','July 2009','June 2009','May 2009','April 2009','March 2009','February 2009','January 2009','December 2008']
cats = 'afghanistan africa americas art asia astronomy ceremony dailylife disaster earth environment europe health history holiday middleeast photographer politics protest religion science sports technology usa war'.split()
sel_arc = '<option>Select a month</option>' + ''.join('<option>%s</option>' % m for m in months)
sel_cat = '<option>Select a category</option>' + ''.join('<option>%s</option>' % c for c in cats)
n = [0]
def fill_sel(m):
    n[0] += 1
    return m.group(1) + (sel_arc if n[0] % 2 == 1 else sel_cat) + m.group(2)
body = re.sub(r'(<select id="arcDrop"[^>]*>).*?(</select>)', fill_sel, body, flags=re.S)
# comments
com = ['<div id="title" style="font-size:18px;font-weight:bold;padding:0 0 10px 0">%d comments so far...</div><ol style="margin:0;padding-left:30px">' % C.COMMENTS]
for who, when, txt in C.COMMENT_LIST:
    com.append('<li><div class="comment-content" style="font-size:13px;line-height:19px">%s</div><div style="color:#888;font-size:11px;padding-top:6px">Posted by %s %s</div></li>' % (esc(txt), esc(who), when))
com.append('</ol><div style="padding:14px 0;font-size:13px"><a href="#">&lt; Previous comments</a> &nbsp;|&nbsp; Page 1 of 25</div>')
body = body.replace('<div class="comments-content">', '<div class="comments-content">' + '\n'.join(com), 1)
# strip MT leftovers and commented-out form
body = re.sub(r'</?MTBlogIfArchives>', '', body)
body = re.sub(r'<!--\s*\n.*?-->', '', body, flags=re.S)
# footer copyright: in-universe the site is produced outside Boston
body = body.replace('&copy;  NY Times Co.', '&copy; 2009 Globe Newspaper Company')
# translate gadget: static select
body = body.replace('<div id="google_translate_element"></div>', '<div id="google_translate_element"><select class="goog-te-combo"><option>Select Language</option><option>Español</option><option>Français</option><option>中文(简体)</option></select></div>')

script = '''<script>
(function(){
document.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;var h=a.getAttribute('href')||'';if(h.charAt(0)==='#'&&h.length>1){e.preventDefault();var n=document.getElementsByName(h.slice(1))[0];if(n)n.scrollIntoView();return;}e.preventDefault();},true);
document.addEventListener('submit',function(e){e.preventDefault();},true);
var cur=0;document.addEventListener('keydown',function(e){if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return;var k=e.key;if(k!=='j'&&k!=='k')return;
var ps=[].slice.call(document.querySelectorAll('a[name^=photo]'));var y=window.scrollY+2;cur=0;for(var i=0;i<ps.length;i++){if(ps[i].getBoundingClientRect().top+window.scrollY<=y)cur=i;}
var nx=k==='j'?Math.min(cur+1,ps.length-1):Math.max(cur-1,0);if(k==='j'&&ps[cur].getBoundingClientRect().top>2)nx=cur;ps[nx].scrollIntoView();});
})();
</script>'''
body = body.replace('</body>', script + '\n</body>')
page = fix_urls(head) + fix_urls(body)
page = page.replace('\x85', '...')
open(D + '/bp_preview.html', 'w', encoding='utf-8').write(page)

fav = b64(R + 'favicon.ico', 'image/x-icon')
tpl = r'''/* bppage.js - generated by sites/bp/mkbp.py: boston.com The Big Picture, Nov 30 2009 entry (in-universe) */
(function () {
  window.CWSITES = window.CWSITES || {}; window.BP_FAV = __FAV__;
  var SRC = __SRC__, TITLE = __TITLE__;
  CWSITES.bigpicture = function (W) {
    var ifr = document.createElement('iframe'); ifr.setAttribute('title', 'The Big Picture');
    var t = W.open({ title: TITLE, host: 'www.boston.com', path: __PATH__, fav: window.BP_FAV, node: ifr });
    ifr.srcdoc = SRC; return t;
  };
})();
'''
js = tpl.replace('__FAV__', json.dumps(fav)).replace('__SRC__', json.dumps(page).replace('</script', '<\\/script')).replace('__TITLE__', json.dumps('%s - The Big Picture - Boston.com' % C.TITLE)).replace('__PATH__', json.dumps(C.SLUG))
open('/workspace/work/gm/bppage.js', 'w').write(js)
print('bppage.js', len(js), 'photos', sum(1 for x in imgs if x[0]))
