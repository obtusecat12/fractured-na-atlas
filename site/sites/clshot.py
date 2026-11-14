from playwright.sync_api import sync_playwright
import glob
D='/workspace/work/gm/sites/'
with sync_playwright() as p:
  b=p.chromium.launch(executable_path=glob.glob('/home/sandbox/.cache/ms-playwright/chromium-*/chrome-linux/chrome')[0])
  pg=b.new_page(viewport={'width':1024,'height':768})
  for n in ['sss','laf_1452117708','hsh_1452180009','for_1452017338','apa_1452201551']:
    pg.goto('file://'+D+'cl_prev/'+n+('.html.html' if '_' in n else '.html'));pg.wait_for_timeout(300)
    pg.screenshot(path=D+'shot_'+n+'.png',full_page=True)
  pg=b.new_page(viewport={'width':1400,'height':900})
  pg.goto('file:///workspace/work/gm/index.html');pg.wait_for_timeout(6000)
  pg.evaluate("CW.show();CW.openSite('craigslist')");pg.wait_for_timeout(800)
  f=[fr for fr in pg.frames if 'spokane / coeur' in (fr.title() or '')][0]
  f.click('a[href="sss/"]');pg.wait_for_timeout(800)
  f=[fr for fr in pg.frames if 'for sale / wanted' in (fr.title() or '')][0]
  f.click('text=Generac 4000 watt');pg.wait_for_timeout(800)
  pg.screenshot(path=D+'shot_cl_win2.png')
  b.close()
print('shots ok')
