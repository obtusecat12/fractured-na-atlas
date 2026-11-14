# mkcl.py - builds clpage.js: 2009 spokane.craigslist.org replica (home page stage)
import json,re,base64,calendar
R='/workspace/work/gm/sites/cl_ref/'
css=open(R+'craigslist.css',encoding='latin-1').read()
h=open(R+'home.html',encoding='latin-1').read()
fac=json.load(open('/workspace/work/gm/sites/cl_cityfac.json'))
# --- inline css, strip external refs
h=re.sub(r'<link rel="stylesheet"[^>]*>\s*<!--\[if lt IE 6\]>.*?<!\[endif\]-->','<style>'+css+'</style>',h,flags=re.S)
h=re.sub(r'<link rel="shortcut icon"[^>]*>','',h)
# --- calendar: November 2009, today = Sat 7
rows=[]
d=1;start=1 # Nov 1 2009 is a Sunday
days=list(range(1,29))
for w in range(4):
  cells=''.join('<td%s><a href="cal/index200911%02d.html">%d</a></td>'%(' class="tdy"' if x==7 else '',x,x) for x in days[w*7:w*7+7])
  rows.append('<tr>\n'+cells+'\n</tr>')
h=re.sub(r'(<tr class="dys">.*?</tr>).*?(</table>)',lambda m:m.group(1)+'\n'+'\n'.join(rows)+'\n'+m.group(2),h,count=1,flags=re.S)
# --- left links: in-universe alert first
h=h.replace('<li><a href="http://www.craigslist.org/about/scams">avoid scams &amp; fraud</a>',
 '<li><a href="http://www.craigslist.org/about/scams#permits"><font color="red"><b>ALERT</b></font> - travel permits &amp; border passes sold online are fraudulent</a>\n\t\t\t\t\t<li><a href="http://www.craigslist.org/about/scams">avoid scams &amp; fraud</a>')
h=h.replace('<a href="http://www.craigslist.org/about/help/system-status.html">system status</a>',
 '<a href="http://www.craigslist.org/about/help/system-status.html">system status</a> <font color="red" size="1">(some sites paused)</font>')
# --- city lists: silence (no new posts since 2/16) and gilead (unavailable)
def mark(m):
  url,name=m.group(1),m.group(2); k=re.match(r'http://([a-z]+)\.',url).group(1)
  f=fac.get(k)
  if not f: return m.group(0)
  if f[0].startswith('~') and k!='atlanta': return '<li><span class="cpz" title="no new postings since 16 feb 2009">%s*</span>'%name
  if f[0]=='gilead': return '<li><span class="cpz" title="not available in your area">%s&dagger;</span>'%name
  return m.group(0)
h=re.sub(r'<li><a href="(http://[a-z]+\.craigslist\.org/?)">([^<]+)</a>',mark,h)
h=h.replace('<li><a href="http://washingtondc.craigslist.org/">wash dc</a>\n</ul>',
 '<li><a href="http://washingtondc.craigslist.org/">wash dc</a>\n</ul><div class="cpzn">* no new postings since 2/16<br>&dagger; not available in your area</div>')
h=h.replace('</ul>\n<br><h5 >canada</h5>','</ul><div class="cpzn">* no new postings since 2/16<br>&dagger; not available in your area</div>\n<br><h5 >canada</h5>',1)
h=h.replace('</head>','<style>.cpz{color:#999}.cpzn{color:#777;font-size:x-small;margin:2px 0 0 0}</style>\n<script>document.addEventListener("click",function(e){var a=e.target.closest("a");if(a){e.preventDefault();}},true);</script>\n</head>')
assert 'cpzn' in h
exec(open('/workspace/work/gm/sites/mkcl_stage2.py').read())
fav='data:image/x-icon;base64,'+base64.b64encode(open(R+'favicon.ico','rb').read()).decode()
JS_T=open('/workspace/work/gm/sites/clpage_tpl.js').read()
js=JS_T.replace('__FAV__',json.dumps(fav)).replace('__PAGES__',json.dumps(PAGES).replace('</','<\\/')).replace('__TITLES__',json.dumps(TITLES))
open('/workspace/work/gm/clpage.js','w').write(js)
os.makedirs('/workspace/work/gm/sites/cl_prev',exist_ok=True)
for k2,v2 in PAGES.items(): open('/workspace/work/gm/sites/cl_prev/'+(k2.strip('/').replace('/','_') or 'home')+'.html','w',encoding='utf-8').write(v2)
print('ok',len(js),len(PAGES))
