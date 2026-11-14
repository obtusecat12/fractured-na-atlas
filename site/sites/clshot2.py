from playwright.sync_api import sync_playwright
import glob
D='/workspace/work/gm/sites/'
with sync_playwright() as p:
  b=p.chromium.launch(executable_path=glob.glob('/home/sandbox/.cache/ms-playwright/chromium-*/chrome-linux/chrome')[0])
  pg=b.new_page(viewport={'width':1024,'height':768})
  for n in ['ccc','laf_1452239157.html','com_1451903377.html','bab_1452219388.html']:
    pg.goto('file://'+D+'cl_prev/'+n+'.html');pg.wait_for_timeout(300)
    pg.screenshot(path=D+'shot2_'+n.split('.')[0]+'.png',full_page=True)
  b.close()
print('ok')
