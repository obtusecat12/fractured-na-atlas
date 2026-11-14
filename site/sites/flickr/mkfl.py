import json, base64, io, html, os
from PIL import Image
from fl_content import USERS, PHOTOS, GROUP, SETS
import re
D = os.path.dirname(os.path.abspath(__file__))
def b64(im, q=72):
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q, optimize=True); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
SRC = {}
def raw(n):
    if n not in SRC: SRC[n] = Image.open(f'{D}/raw/{n}.png').convert('RGB')
    return SRC[n]
def sized(n, w):
    im = raw(n).copy(); im.thumbnail((w, w)); return b64(im, 74 if w >= 500 else 70)
def square(n, s=75):
    im = raw(n); m = min(im.size); l = (im.size[0]-m)//2; t = (im.size[1]-m)//2
    return b64(im.crop((l, t, l+m, t+m)).resize((s, s), Image.LANCZOS), 72)
def buddy(u):
    n, (x, y) = USERS[u]['buddy']; im = raw(n); r = 110
    return b64(im.crop((x-r, y-r, x+r, y+r)).resize((48, 48), Image.LANCZOS), 75)
DEFBUD = 'data:image/gif;base64,' + base64.b64encode(open(f'{D}/ref/buddyicon.gif','rb').read()).decode() if os.path.exists(f'{D}/ref/buddyicon.gif') else ''
BUD = {u: buddy(u) for u in USERS}
im=raw('kc_dark_street'); GBUD=b64(im.crop((1150,560,1450,860)).resize((48,48),Image.LANCZOS),75)
LOGO = 'data:image/gif;base64,' + base64.b64encode(open(f'{D}/ref/logo.gif','rb').read()).decode()
FAV = 'data:image/x-icon;base64,' + base64.b64encode(open(f'{D}/ref/fav.ico','rb').read()).decode()

def _uri(fn, mt):
    return 'data:%s;base64,%s' % (mt, base64.b64encode(open(f'{D}/ref/{fn}','rb').read()).decode())
IMG = {'photo-gne-sprite-2.png': _uri('img_photo-gne-sprite-2.png','image/png'), 'candy_button_bar_bg.gif': _uri('img_candy_button_bar_bg.gif','image/gif'),
       'set_case.gif': _uri('img_set_case.gif','image/gif'), 'dotted.gif': _uri('img_dotted.gif','image/gif')}
def _css(fn):
    c = open(f'{D}/ref/{fn}', encoding='utf-8', errors='ignore').read()
    c = re.sub(r'_background-image:[^;}]*;?', '', c)
    return re.sub(r'url\((?:http://l\.yimg\.com/g/images/)?([^)]+)\)', lambda m: 'url(%s)' % IMG[m.group(1).split('/')[-1]] if m.group(1).split('/')[-1] in IMG else 'none', c)
REALCSS = _css('main.css') + _css('sets.css')   # Flickr's own c_fold_main / c_sets stylesheets, June 2009 (Wayback)
LOGO09 = _uri('logo_gamma.gif', 'image/gif'); SBTN = _uri('search_btn.png', 'image/png'); CARET = _uri('caret.png', 'image/png'); SPACE = _uri('spaceout.gif', 'image/gif')
e = lambda s: html.escape(s, quote=True)
def bud(u, s=48):
    src = BUD.get(u)
    if src: return f'<img src="{src}" width="{s}" height="{s}" class="bi" alt="">'
    return f'<img src="{DEFBUD}" width="{s}" height="{s}" class="bi" alt="">'
def L(path, text, cls=''):
    return f'<a href="#" data-p="{path}"{" class=%s" % cls if cls else ""}>{text}</a>'
CSS = '''
body{margin:0;background:#fff;font:12px Arial,Helvetica,sans-serif;color:#000}
a{color:#0063DC;text-decoration:none}a:hover{color:#fff;background:#0063DC}a.ni:hover{background:none}
a.pk{color:#FF0084}a.pk:hover{background:#FF0084;color:#fff}
#head{width:980px;margin:0 auto;padding:14px 0 0;position:relative;height:62px}
#logo{position:absolute;left:10px;top:14px}
#tr{position:absolute;right:10px;top:10px;color:#666;font-size:11px}#tr b{color:#000}
#nav{position:absolute;left:10px;top:48px;font-size:13px;font-weight:bold}
#nav a{margin-right:14px}#nav span.sep{color:#ccc}
#srch{position:absolute;right:10px;top:42px}#srch input[type=text]{font:12px Arial;width:150px;border:1px solid #b5b5b5;padding:2px}
.btn{background:#0063DC;border:1px solid #0052b9;color:#fff;font:bold 11px Arial;padding:2px 6px;margin-left:3px}
#main{overflow:hidden;width:960px;margin:0 auto;padding:10px 10px 30px;border-top:1px solid #ddd}
h1{font:normal 24px Arial;margin:6px 0 4px;color:#000}
.who{overflow:hidden;margin:6px 0 12px}.who .bi{float:left;margin-right:8px}
.bi{border:0;vertical-align:top;display:inline-block}
.ttl{font-size:24px}.sub{color:#999;font-size:11px}
.tabs{margin:2px 0 14px;font-size:12px;color:#999}.tabs a{margin:0 3px}.tabs b{color:#000}
.grid{overflow:hidden}.cell{float:left;width:300px;height:262px;margin:0 20px 14px 0}
.cell img{border:0;display:block}.cell .t{margin-top:4px;font-weight:bold}.cell .m{color:#999;font-size:11px;margin-top:2px}
.sb{float:right;width:300px}.lc{float:left;width:620px}
.box{margin-bottom:18px}.box h3{font:bold 12px Arial;color:#ff0084;margin:0 0 6px;padding-bottom:3px;border-bottom:1px solid #eee}
.photo{border:0;display:block;margin:0 0 10px}
.desc{font-size:13px;line-height:1.45;margin:8px 0 18px}
.cm{overflow:hidden;padding:9px 0;border-top:1px solid #eee}.cm .bi{float:left;margin-right:10px}.cm .tx{overflow:hidden;font-size:12px;line-height:1.45}
.cm .tx small{color:#999;font-size:11px}
.add{color:#999;margin-top:14px;padding-top:10px;border-top:1px solid #eee}
.meta{color:#333;line-height:1.6}.meta .g{color:#999}
.tags a{display:block;line-height:1.7}
.ctx img{border:0;margin-right:4px}
.pool img{margin:0 4px 4px 0;border:0}
.thr{width:100%;border-collapse:collapse}.thr td{padding:5px 4px;border-bottom:1px solid #eee}.thr th{text-align:left;color:#999;font-weight:normal;padding:4px;border-bottom:1px solid #ddd}
#foot{width:960px;margin:0 auto;padding:10px;border-top:1px solid #ddd;color:#999;font-size:11px;line-height:1.7}
#foot a{color:#999}#foot .fl{margin-bottom:6px}
.note{background:#ffffd3;border:1px solid #e6db55;padding:6px 8px;margin:0 0 12px;font-size:12px}
.gen{display:inline-block}
'''
def page(title, body, who='kmendoza916'):
    head = f'''<div class="TopBar" id="TopBar"><table cellspacing="0" class="Header" border="0"><tr><td class="FlickrLogo"><a href="#" data-p="/"><img src="{LOGO09}" id="FlickrLogo" width="98" height="26" alt="Flickr logo. If you click it, you'll go home"></a></td>
<td class="Status">You aren't signed in &nbsp;&nbsp;&nbsp; <a href="#">Sign In</a> &nbsp;&nbsp; <a href="#">Help</a></td></tr></table>
<table cellspacing="0" class="NavBar" border="0"><tr><td class="Primary"><div id="candy_nav_button_bar" class="candy_button_bar"><ul class="site_nav_menu_buttons">
<li class="no_menu_li"><span><a href="#" data-p="/">Home</a></span></li><li class="no_menu_li"><span><a href="#">The Tour</a></span></li><li class="no_menu_li"><span><a href="#">Sign Up</a></span></li>
<li class="menu_li"><span><a href="#">Explore</a> <img src="{CARET}" class="nav_button_caret" width="18" height="15" alt="More options"></span></li></ul></div></td>
<td id="search_header_form_td"><form onsubmit="return false" id="headersearchform"><input type="text" class="Box" value="Search {e(who)}'s photostream" style="color:#999"> <input value="Search" type="image" src="{SBTN}" style="vertical-align:top"></form></td></tr></table></div>'''
    foot = '''<br id="MainFooterClear" clear="all"><div id="FooterWrapper"><div class="Footer"><table class="Jump" cellspacing="0">
<tr><th class="To">You</th><td><a href="#">Sign in</a> | <a href="#">Create Your Free Account</a></td></tr>
<tr><th class="To"><a href="#" class="Plain">Explore</a></th><td><a href="#">Places</a> | <a href="#">Last 7 Days</a> | <a href="#">This Month</a> | <a href="#">Popular Tags</a> | <a href="#">The Commons</a> | <a href="#">Creative Commons</a> | <a href="#">Search</a></td></tr>
<tr><th class="To"><a href="#" class="Plain">Help</a></th><td><a href="#">Community Guidelines</a> | <a href="#">The Help Forum</a> | <a href="#">FAQ</a> | <a href="#">Sitemap</a> | <a href="#">Help by Email</a></td></tr></table>
<p class="About"><span class="yahoo_logo"><a href="#"><img src="SPACE" width="99" height="11" alt="Flickr, a Yahoo! Company" class="f-sprite fs-logo_yahoo_company"></a></span>
<a href="#">Flickr Blog</a> | <a href="#">About Flickr</a> | <a href="#">Terms of Use</a> | <a href="#">Your Privacy</a> | <a href="#">Copyright/IP Policy</a> | <a href="#">Report Abuse</a></p>
<p class="LanguageSelector"><span><a href="#">&#32321;&#39636;&#20013;&#25991;</a> <b>|</b> <a href="#">Deutsch</a> <b>|</b> <a href="#" class="selected">English</a> <b>|</b> <a href="#">Espa&#241;ol</a> <b>|</b> <a href="#">Fran&#231;ais</a> <b>|</b> <a href="#">&#54620;&#44544;</a> <b>|</b> <a href="#">Italiano</a> <b>|</b> <a href="#">Portugu&#234;s</a></span></p>
<p class="Copyright">Copyright &copy; 2009 Yahoo! Inc. All rights reserved.</p></div></div>'''.replace('SPACE', SPACE)
    js = '''<script>document.addEventListener('click',function(ev){var a=ev.target.closest('a');if(!a)return;ev.preventDefault();var p=a.getAttribute('data-p');if(p)parent.postMessage({fl:p},'*');});</script>'''
    return f'<!DOCTYPE html><html><head><meta charset="utf-8"><title>{e(title)}</title><style>{REALCSS}</style><style>{CSS}</style></head><body>{head}<div id="Main">{body}</div>{foot}{js}</body></html>'
def pp(p): return f'/photos/{p[2]}/{p[0]}/'
def mon(d): return d.split(' at ')[0]
PHOTOS = [p for p in PHOTOS if os.path.exists(f'{D}/raw/{p[1]}.png')]
BYIMG = {p[1]: p for p in PHOTOS}
SETS = [(i, n, d, [BYIMG[x] for x in xs if x in BYIMG]) for i, n, d, xs in SETS]
SETS = [x for x in SETS if x[3]]
P, T = {}, {}
byu = {}
for p in PHOTOS: byu.setdefault(p[2], []).append(p)
for u, ps in byu.items():
    ps.sort(key=lambda p: int(p[0]), reverse=True)
    U = USERS[u]
    def subnav(here, title=None, pro=False):
        links = [('Sets', f'/photos/{u}/sets/' if u == 'kmendoza916' else None), ('Galleries', None), ('Tags', None), ('Map', None), ('Archives', None), ('Favorites', None)]
        ln = ''.join('<span>%s</span>' % ('<span class="Here">%s</span>' % n if n == here else (L(pth, n) if pth else '<a href="#">%s</a>' % n)) for n, pth in links) + '<a href="#" rel="me">Profile</a>'
        h1 = title or f"{e(u)}'s photostream"
        return f'''<table width="800" cellspacing="0" id="SubNav"><tr><td class="Buddy">{L(f"/photos/{u}/", bud(u), "ni")}</td><td class="Section"><h1>{h1}</h1>
<p class="LinksNewP"><span class="LinksNew">{ln}</span></p></td><td class="Extras"></td></tr></table>'''
    def setcase(st):
        cov = st[3][0]
        return f'''<div class="Sets"><div class="SetCase"><div class="setLinkDiv">{L(f"/photos/{u}/sets/{st[0]}/", '<img class="setThumb" src="%s" width="75" height="75" alt="%s">' % (square(cov[1]), e(st[1])), "setLink")}</div></div>
<h4>{L(f"/photos/{u}/sets/{st[0]}/", e(st[1]), "Seta")}</h4><p><b>{len(st[3])}</b> photo{"s" if len(st[3]) != 1 else ""}</p></div>'''
    def big5(q, last):
        w = 500
        return f'''<div class="StreamView Big5Photo{' LastPhoto' if last else ''}"><p class="Photo" style="position:relative"><span class="photo_container pc_l">{L(pp(q), '<img src="%s" width="%d" alt="%s" class="pc_img">' % (sized(q[1], 500), w, e(q[3])), "ni")}</span></p>
<h4>{e(q[3])}</h4><p class="Privacy"><img src="{SPACE}" width="15" height="15" class="f-sprite fs-icon_public" alt=""> <img src="{SPACE}" width="15" height="15" class="f-sprite fs-icon_all_rights" alt=""> All rights reserved</p>
<p class="Do">Uploaded on <a href="#" class="Plain">{e(q[6])}</a></p><p class="Activity">{L(pp(q), "%d comment%s" % (len(q[12]), "" if len(q[12]) == 1 else "s"), "Plain")}</p></div>'''
    mine = [x for x in SETS] if u == 'kmendoza916' else []
    col = ''.join(setcase(st) + '<br clear="all">' for st in mine)
    stream = ''.join(big5(q, i == len(ps) - 1) for i, q in enumerate(ps))
    note = '' if u == 'kmendoza916' else '<div class="note">This member has not uploaded any photos since %s.</div>' % ps[0][6]
    body = f'''{subnav(None)}{note}<table width="100%" cellspacing="0" cellpadding="0" class="PhotoStream"><tr valign="top"><td width="100%" valign="top" class="PhotosColumn Big5Column">{stream}<br clear="all"></td>
<td class="CollectionsColumn"><div class="CollSpace">{col}{'<h3><font color="#FF0084">&raquo;</font> ' + L(f"/photos/{u}/sets/", "More Sets") + '</h3>' if mine else ''}</div></td></tr></table>
<div class="Pages"><div class="Paginator"><span class="AtStart">&lt; Prev</span> <span class="this-page">1</span> <span class="AtEnd">Next &gt;</span></div><div class="Results">({len(ps)} items)</div></div>'''
    if mine:
        sl = ''.join(setcase(st) for st in mine)
        P[f'/photos/{u}/sets/'] = page(f"Flickr: {u}'s Sets", f'{subnav("Sets")}<br clear="all">{sl}<br clear="all">', u); T[f'/photos/{u}/sets/'] = f"Flickr: {u}'s Sets"
        for st in mine:
            sp = st[3]; cov = sp[0]
            thumbs = ''.join('<div class="setThumbs-indv"><span class="photo_container pc_s">%s</span></div>' % L(pp(q), '<img src="%s" width="75" height="75" alt="%s" class="pc_img">' % (square(q[1]), e(q[3])), 'image_link') for q in sp)
            d0 = min(sp, key=lambda q: int(q[0]))[5].split(' at ')[0]; d1 = max(sp, key=lambda q: int(q[0]))[5].split(' at ')[0]
            views = sum(q[10] for q in sp) // 9
            sb = f'''<div id="setCrumbs"><table width="100%" cellpadding="0" cellspacing="0"><tr><td class="scTopCrumb">{L(f"/photos/{u}/", e(u))} &gt; {L(f"/photos/{u}/sets/", "Sets")}</td>
<td align="right" class="scTopCrumbShareSlideshow"><div class="SlideShowShareButtons"><span class="slideshow-box"><a href="#" id="SlideShowButton"><span class="slideshow-link-wrapper">Slideshow</span></a></span></div></td></tr></table></div>
<table width="800" cellspacing="0" id="SubNav"><tr><td class="Buddy">{L(f"/photos/{u}/", bud(u), "ni")}</td><td class="Section"><h1>{e(st[1])}</h1>
<p class="LinksNewP"><span class="LinksNew"><nobr><span class="Here">Thumbnails</span> <span><a href="#">Detail</a></span> <span><a href="#">Map</a></span> <a href="#">Comments</a></nobr></span></p></td></tr></table>
<div id="ViewSet"><div class="vsDetails"><p class="vsThumbnail"><span class="photo_container pc_m">{L(pp(cov), '<img id="primary_photo_img" src="%s" width="240" alt="%s" class="pc_img">' % (sized(cov[1], 240), e(cov[3])), "image_link")}</span></p>
<p class="vsDescription">{e(st[2])}</p><p class="vsNumbers">{len(sp)} photos | {views:,} views</p><p class="vsNumbers">items are from between {e(d0)} &amp; {e(d1)}.</p></div>
<div class="vsThumbs"><div id="setThumbs" class="clearfix">{thumbs}</div></div></div><br clear="all">'''
            P[f'/photos/{u}/sets/{st[0]}/'] = page(f'{st[1]} - a set on Flickr', sb, u); T[f'/photos/{u}/sets/{st[0]}/'] = f'{st[1]} - a set on Flickr'
    path = f'/photos/{u}/'; P[path] = page(f"Flickr: {u}'s Photostream", body); T[path] = f"Flickr: {u}'s Photostream"
    for i, p in enumerate(ps):
        prv = ps[i-1] if i > 0 else None; nxt = ps[i+1] if i+1 < len(ps) else None
        ctx = ''.join(L(pp(q), f'<img src="{square(q[1])}" width="75" height="75" alt="">', 'ni') for q in (prv, nxt) if q)
        cms = ''.join(f'<div class="cm">{bud(c[0])}<div class="tx"><a href="#">{e(c[0])}</a> says:<br>{e(c[2]).replace('[[group]]', L('/groups/lastuploads/','Last Uploads'))}<br><small>{e(c[1])} ( <a href="#">permalink</a> )</small></div></div>' for c in p[12])
        ingrp = u != 'kmendoza916'
        side = f'''<div class="box">{bud(u)} <span style="display:inline-block;vertical-align:top;margin-left:6px">Uploaded on {e(p[6])}<br>by <a href="#" data-p="/photos/{u}/">{e(u)}</a></span></div>
<div class="box"><h3>This photo belongs to</h3><div>{L(f"/photos/{u}/", e(u)+"'s photostream")} ({len(ps)})</div><div class="ctx" style="margin-top:6px">{ctx}</div>{''.join('<div style="margin-top:6px">%s (set, %d)</div>' % (L(f"/photos/{u}/sets/{st[0]}/", e(st[1])), len(st[3])) for st in SETS if p in st[3] and u == 'kmendoza916')}</div>
{'<div class="box"><h3>This photo also belongs to:</h3>'+L('/groups/lastuploads/','Last Uploads')+' (group)</div>' if ingrp else ''}
<div class="box"><h3>Tags</h3><div class="tags">{''.join('<a href="#">%s</a>' % e(t) for t in p[9])}</div></div>
<div class="box"><h3>Additional Information</h3><div class="meta">&copy; All Rights Reserved<br>Taken with an {e(p[7])}.<br><span class="g">See <a href="#">more photos</a> or <a href="#">video</a> from this camera.</span><br>Taken on <a href="#">{e(mon(p[5]))}</a><br>in <a href="#">{e(p[8])}</a> (<a href="#">map</a>)<br>Viewed <b>{p[10]:,}</b> times<br><a href="#">{p[11]} people</a> call this photo a favorite</div></div>'''
        body = f'''<h1>{e(p[3])}</h1><div class="lc"><img class="photo" src="{sized(p[1],500)}" width="500" alt="{e(p[3])}">
<div class="desc">{e(p[4])}</div>{cms}<div class="add">Would you like to comment? <a href="#">Sign up</a> for a free account, or <a href="#">sign in</a> (if you're already a member).</div></div><div class="sb">{side}</div>'''
        P[pp(p)] = page(f'{p[3]} on Flickr - Photo Sharing!', body); T[pp(p)] = f'{p[3]} on Flickr - Photo Sharing!'
G = GROUP; gp = [p for p in PHOTOS if p[2] != 'kmendoza916']
pool = ''.join(L(pp(p), f'<img src="{square(p[1])}" width="75" height="75" alt="">', 'ni') for p in gp)
thr = ''.join(f'<tr><td><a href="#">{e(t)}</a></td><td><a href="#">{e(a)}</a></td><td>{n}</td><td>{e(w)}</td></tr>' for t, a, n, w in G['threads'])
body = f'''<div class="who"><img class="bi" style="float:left" width="48" height="48" src="{GBUD}" alt=""><div class="ttl" style="margin-left:56px">{G['name']}</div><div class="sub" style="margin-left:56px">{G['members']} members | Created {G['created']}</div></div>
<div class="lc"><div class="desc">{e(G['desc'])}</div><div class="box"><h3>Group Pool</h3><div class="pool">{pool}</div><div><a href="#">{len(gp)} items</a> &raquo;</div></div>
<div class="box"><h3>Discuss</h3><table class="thr"><tr><th>Topic</th><th>Author</th><th>Replies</th><th>Latest Post</th></tr>{thr}</table></div></div>
<div class="sb"><div class="box"><h3>Administrators</h3>{', '.join('<a href="#">%s</a>' % a for a in G['admins'])}</div><div class="box"><h3>Group Info</h3>This group is public. Anyone can join.<br>Pool is moderated.</div></div>'''
P['/groups/lastuploads/'] = page('Flickr: Last Uploads', body); T['/groups/lastuploads/'] = 'Flickr: Last Uploads'
P['/'] = P['/photos/kmendoza916/']; T['/'] = T['/photos/kmendoza916/']
tpl = '''/* flpage.js - generated by sites/flickr/mkfl.py: www.flickr.com late 2009 */
(function () {
  window.CWSITES = window.CWSITES || {}; window.FL_FAV = __FAV__;
  var P = __PAGES__, T = __TITLES__;
  CWSITES.flickr = function (W) {
    var ifr = document.createElement('iframe'); ifr.setAttribute('title', 'flickr');
    var t = W.open({ title: T['/'], host: 'www.flickr.com', path: '/photos/kmendoza916/', fav: window.FL_FAV, node: ifr });
    function go(p) { p = p.split('#')[0]; if (!P[p]) return; ifr.srcdoc = P[p]; t.title = T[p]; t.path = p === '/' ? '/photos/kmendoza916/' : p; W.select(t); }
    window.addEventListener('message', function (e) { if (e.source === ifr.contentWindow && e.data && typeof e.data.fl === 'string') go(e.data.fl); });
    t.go = go; go('/'); return t;
  };
})();
'''
out = tpl.replace('__FAV__', json.dumps(FAV)).replace('__PAGES__', json.dumps(P)).replace('__TITLES__', json.dumps(T))
open(f'{D}/../../flpage.js', 'w').write(out)
open(f'{D}/preview.html', 'w').write(P['/']); open(f'{D}/preview_photo.html','w').write(P[pp(PHOTOS[3])]); open(f'{D}/preview_group.html','w').write(P['/groups/lastuploads/'])
print('ok', len(out), len(P))
