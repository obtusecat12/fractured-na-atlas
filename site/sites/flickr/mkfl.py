import json, base64, io, html, os
from PIL import Image
from fl_content import USERS, PHOTOS, GROUP, SETS
try:
    from fl_content import GROUPS
except ImportError:
    GROUPS = []
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
try:
    from fl_content import AVATARS
except ImportError:
    AVATARS = {}
for _u, _n in AVATARS.items(): BUD[_u] = b64(raw(_n).resize((48, 48), Image.LANCZOS), 75)
im=raw('kc_dark_street'); GBUD=b64(im.crop((1150,560,1450,860)).resize((48,48),Image.LANCZOS),75)
LOGO = 'data:image/gif;base64,' + base64.b64encode(open(f'{D}/ref/logo.gif','rb').read()).decode()
FAV = 'data:image/x-icon;base64,' + base64.b64encode(open(f'{D}/ref/fav.ico','rb').read()).decode()
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
.sets{overflow:hidden}.set{float:left;width:300px;height:120px;margin:0 20px 14px 0}.set img{float:left;border:0;margin-right:10px}.set .t{font-weight:bold;font-size:13px}.set .m{color:#999;font-size:11px;margin-top:2px}
.crumb{font-size:12px;margin:0 0 6px}.sq img{border:0;margin:0 4px 4px 0}
'''
def page(title, body):
    head = f'''<div id="head"><a href="#" data-p="/" id="logo" class="ni"><img src="{LOGO}" width="98" height="26" alt="Flickr from Yahoo!" border="0"></a>
<div id="tr">You aren't signed in &nbsp;<a href="#">Sign In</a> &nbsp; <a href="#">Help</a></div>
<div id="nav"><a href="#" data-p="/">Home</a> <a href="#">The Tour</a> <a href="#">Sign Up</a> <a href="#">Explore</a></div>
<form id="srch" onsubmit="return false"><input type="text"><input type="submit" class="btn" value="SEARCH"></form></div>'''
    foot = f'''<div id="foot"><div class="fl"><a href="#" data-p="/">Home</a> | <a href="#">The Tour</a> | <a href="#">Sign Up</a> | <a href="#">Explore</a> | <a href="#">Upload</a> &nbsp;&nbsp; <a href="#">Help</a> | <a href="#">Community Guidelines</a> | <a href="#">The Help Forum</a> | <a href="#">FAQ</a> | <a href="#">Sitemap</a> | <a href="#">Get Help</a></div>
<div class="fl"><a href="#">Flickr Blog</a> | <a href="#">About Flickr</a> | <a href="#">Terms of Use</a> | <a href="#">Your Privacy</a> | <a href="#">Copyright/IP Policy</a> | <a href="#">Report Abuse</a></div>
<div>Copyright &copy; 2009 Yahoo! Inc. All rights reserved.</div></div>'''
    js = '''<script>document.addEventListener('click',function(ev){var a=ev.target.closest('a');if(!a)return;ev.preventDefault();var p=a.getAttribute('data-p');if(p)parent.postMessage({fl:p},'*');});</script>'''
    return f'<!DOCTYPE html><html><head><meta charset="utf-8"><title>{e(title)}</title><style>{CSS}</style></head><body>{head}<div id="main">{body}</div>{foot}{js}</body></html>'
def gl(t):
    t = t.replace('[[group]]', L('/groups/lastuploads/','Last Uploads'))
    return re.sub(r'\[\[g:(\w+)\]\]', lambda m: L(f'/groups/{m.group(1)}/', e(next(g['name'] for g in GROUPS if g['id'] == m.group(1)))), t)
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
    cells = ''.join(f'<div class="cell">{L(pp(p), "<img src=%s alt=\"\">" % sized(p[1],240), "ni")}<div class="t">{L(pp(p), e(p[3]))}</div><div class="m">Uploaded on {e(p[6])} | {len(p[12])} comment{"s" if len(p[12])!=1 else ""}</div></div>' for p in ps)
    body = f'''<div class="who">{bud(u)}<div class="ttl">{e(u)}'s photostream</div><div class="sub">{len(ps)} items</div></div>
<div class="tabs"><b>Photostream</b> | {L(f"/photos/{u}/sets/", "Sets") if u == "kmendoza916" and SETS else '<a href="#">Sets</a>'} | <a href="#">Favorites</a> | <a href="#">Profile</a> | <a href="#">Archives</a> | <a href="#">Tags</a> | <a href="#">Map</a></div>
{'<div class="note">This member has not uploaded any photos since %s.</div>' % ps[0][6] if u!='kmendoza916' else ''}
<div class="grid">{cells}</div>'''
    if u == 'kmendoza916' and SETS:
        tabs = lambda here: '<div class="tabs">' + ' | '.join('<b>%s</b>' % n if n == here else (L(q, n) if q else '<a href="#">%s</a>' % n) for n, q in [('Photostream', f'/photos/{u}/'), ('Sets', f'/photos/{u}/sets/'), ('Favorites', None), ('Profile', None), ('Archives', None), ('Tags', None), ('Map', None)]) + '</div>'
        who = lambda t, sub: f'<div class="who">{bud(u)}<div class="ttl">{t}</div><div class="sub">{sub}</div></div>'
        sl = ''.join(f'<div class="set">{L(f"/photos/{u}/sets/{st[0]}/", "<img src=%s width=75 height=75 alt=\"\">" % square(st[3][0][1]), "ni")}<div class="t">{L(f"/photos/{u}/sets/{st[0]}/", e(st[1]))}</div><div class="m">{len(st[3])} photo{"s" if len(st[3]) != 1 else ""}</div></div>' for st in SETS)
        sp_ = f'/photos/{u}/sets/'; P[sp_] = page(f"Flickr: {u}'s Sets", who(f"{e(u)}'s sets", f"{len(SETS)} sets") + tabs('Sets') + f'<div class="sets">{sl}</div>'); T[sp_] = f"Flickr: {u}'s Sets"
        for st in SETS:
            sp = st[3]; cov = sp[0]
            d0 = min(sp, key=lambda q: int(q[0]))[5].split(' at ')[0]; d1 = max(sp, key=lambda q: int(q[0]))[5].split(' at ')[0]
            sq = ''.join(L(pp(q), f'<img src="{square(q[1])}" width="75" height="75" alt="">', 'ni') for q in sp)
            b = f'''<div class="crumb">{L(f"/photos/{u}/", e(u))} &gt; {L(f"/photos/{u}/sets/", "Sets")}</div><h1>{e(st[1])}</h1>
<div class="lc"><div class="sq">{sq}</div></div><div class="sb">{L(pp(cov), '<img class="photo" src="%s" width="240" alt="">' % sized(cov[1], 240), "ni")}<div class="desc">{e(st[2])}</div><div class="meta g" style="color:#999;font-size:11px">{len(sp)} photos | {sum(q[10] for q in sp)//9:,} views<br>Items are from between {e(d0)} &amp; {e(d1)}.</div></div>'''
            q_ = f'/photos/{u}/sets/{st[0]}/'; P[q_] = page(f'{st[1]} - a set on Flickr', b); T[q_] = f'{st[1]} - a set on Flickr'
    path = f'/photos/{u}/'; P[path] = page(f"Flickr: {u}'s Photostream", body); T[path] = f"Flickr: {u}'s Photostream"
    for i, p in enumerate(ps):
        prv = ps[i-1] if i > 0 else None; nxt = ps[i+1] if i+1 < len(ps) else None
        ctx = ''.join(L(pp(q), f'<img src="{square(q[1])}" width="75" height="75" alt="">', 'ni') for q in (prv, nxt) if q)
        cms = ''.join(f'<div class="cm">{bud(c[0])}<div class="tx"><a href="#">{e(c[0])}</a> says:<br>{gl(e(c[2]))}<br><small>{e(c[1])} ( <a href="#">permalink</a> )</small></div></div>' for c in p[12])
        ingrp = u != 'kmendoza916'
        side = f'''<div class="box">{bud(u)} <span style="display:inline-block;vertical-align:top;margin-left:6px">Uploaded on {e(p[6])}<br>by <a href="#" data-p="/photos/{u}/">{e(u)}</a></span></div>
<div class="box"><h3>This photo belongs to</h3><div>{L(f"/photos/{u}/", e(u)+"'s photostream")} ({len(ps)})</div><div class="ctx" style="margin-top:6px">{ctx}</div>{''.join('<div style="margin-top:6px">%s (set, %d)</div>' % (L(f"/photos/{u}/sets/{st[0]}/", e(st[1])), len(st[3])) for st in SETS if p in st[3] and u == 'kmendoza916')}</div>
{'<div class="box"><h3>This photo also belongs to:</h3>'+'<br>'.join(([L('/groups/lastuploads/','Last Uploads')+' (group)'] if ingrp else [])+[L(f"/groups/{g['id']}/", e(g['name']))+' (group)' for g in GROUPS if p[1] in g['pool']])+'</div>' if ingrp or any(p[1] in g['pool'] for g in GROUPS) else ''}
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
for G in GROUPS:
    gid = G['id']; gp = [BYIMG[x] for x in G['pool'] if x in BYIMG]
    n_, (x, y) = G['icon']; im = raw(n_); gico = b64(im.crop((x-150, y-150, x+150, y+150)).resize((48, 48), Image.LANCZOS), 75)
    pool = ''.join(L(pp(p), f'<img src="{square(p[1])}" width="75" height="75" alt="">', 'ni') for p in gp)
    rows = []
    for k, (t, a, posts) in enumerate(G['threads']):
        tl = L(f'/groups/{gid}/discuss/{k}/', e(t)) if posts else f'<a href="#">{e(t)}</a>'
        rows.append(f'<tr><td>{tl}</td><td><a href="#">{e(a)}</a></td><td>{G["counts"][k]}</td><td>{e(G["latest"][k])}</td></tr>')
        if posts:
            ps_ = ''.join(f'<div class="cm">{bud(c[0])}<div class="tx"><a href="#">{e(c[0])}</a> says:<br>{gl(e(c[2]))}<br><small>{e(c[1])} ( <a href="#">permalink</a> )</small></div></div>' for c in posts)
            tb = f'''<div class="crumb">{L(f"/groups/{gid}/", e(G['name']))} &gt; <a href="#">Discuss</a></div><h1>{e(t)}</h1>
<div class="lc">{ps_}<div class="add">Would you like to reply? <a href="#">Sign up</a> for a free account, or <a href="#">sign in</a> (if you're already a member).</div></div>
<div class="sb"><div class="box"><h3>{e(G['name'])}</h3><img class="bi" width="48" height="48" src="{gico}" alt=""><div style="margin-top:6px">{L(f"/groups/{gid}/", "Group home")}<br><a href="#">Group pool</a> ({len(gp)})<br><a href="#">Discuss</a> ({len(G['threads'])} topics)</div></div>
<div class="box"><h3>Administrators</h3>{', '.join('<a href="#">%s</a>' % x_ for x_ in G['admins'])}</div></div>'''
            tp = f'/groups/{gid}/discuss/{k}/'; P[tp] = page(f"Flickr: Discussing {t} in {G['name']}", tb); T[tp] = f"Flickr: Discussing {t} in {G['name']}"
    body = f'''<div class="who"><img class="bi" style="float:left" width="48" height="48" src="{gico}" alt=""><div class="ttl" style="margin-left:56px">{e(G['name'])}</div><div class="sub" style="margin-left:56px">{G['members']} members | Created {G['created']}</div></div>
<div class="lc"><div class="desc">{e(G['desc'])}</div><div class="box"><h3>Group Pool</h3><div class="pool">{pool}</div><div><a href="#">{len(gp)} items</a> &raquo;</div></div>
<div class="box"><h3>Discuss</h3><table class="thr"><tr><th>Topic</th><th>Author</th><th>Replies</th><th>Latest Post</th></tr>{''.join(rows)}</table></div></div>
<div class="sb"><div class="box"><h3>Administrators</h3>{', '.join('<a href="#">%s</a>' % a for a in G['admins'])}</div><div class="box"><h3>Group Info</h3>This group is public. Anyone can join.<br>Pool is moderated.</div></div>'''
    P[f'/groups/{gid}/'] = page(f"Flickr: {G['name']}", body); T[f'/groups/{gid}/'] = f"Flickr: {G['name']}"
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
