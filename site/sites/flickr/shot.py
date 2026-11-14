import sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1000,'height':900})
    for f in sys.argv[1:]:
        pg.goto('file://'+f+'.html'); pg.wait_for_timeout(300); pg.screenshot(path=f+'.png',full_page=False)
    b.close()
