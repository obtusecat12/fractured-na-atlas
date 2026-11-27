// bm.js (v3.0) - bookmarks menu entries; window opens on Google only, everything else from the bookmark button
(function () {
  var M = window.CWSITE_META || {};
  window.CWBOOKMARKS = [
    { key: 'youtube', title: 'YouTube - Broadcast Yourself.', fav: window.YT_FAV, w: 1035, h: 560 },
    { key: 'cnn', title: 'CNN.com - Breaking News, U.S., World, Weather, Entertainment & Video News', fav: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAzUlEQVR4nO2SoQ6CYBSFD46gJi0Gu8WGI/AgRgqdzUdw+gREi/MxLD7CDzRtytxgOCWgG0yFHYtzgs5C9cRv53y74UoCICqkVmX8FzxjyzIPlsVbGDKLYwaTCbe6TpLcGQadep0kudG0rxx702QWx1yrKoUkUQDc6jrzNOXV8+i2WgVBmcsNRUFi20iEKFyWRxHOqxU6o9FPLqeui/ZwiOZggMRxCuVgPEa/xMq8dpzNEC0W6C2XUC4XdKfTV/Hu+zjN5x+Cdy79X7m64AH7NZTkLVrA8QAAAABJRU5ErkJggg==", w: 1035, h: 560 },
    { key: 'yahoofinance', title: 'Yahoo! Finance - Business Finance, Stock Market, Quotes, News', fav: window.YF_FAV, w: 1035, h: 600 },
    { key: 'finviz', title: 'FINVIZ.com - Stock Screener', fav: window.FV_FAV, w: 1035, h: 620 },
    { key: 'flickr', title: "Flickr: kmendoza916's Photostream", fav: window.FL_FAV, w: 1000, h: 640 },
    { key: 'craigslist', title: "craigslist: spokane / coeur d'alene classifieds for jobs, apartments, personals, for sale, services, community, and events", fav: window.CL_FAV, w: 1035, h: 600 },
    { key: 'bigpicture', title: '2009: A nation divided - The Big Picture - Boston.com', fav: window.BP_FAV, w: 1035, h: 620 },
    { key: 'topo', title: 'NCS-NOC :: Backbone Status', fav: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADc0lEQVR4nF2TS0xUZxiG3/OfMyMznM4ABQYEZcAGM1OxMcFC6pWiCxtiuoFiZdHUpDdr1A1Ly6IltZe0acLCuGyapvaSNlGaSFOFkHaKUy7KwNhAQcTIZebMzDnMwD//+c/XFcT67N4veRdv8j0K/g8re7ak5vmGvS2hUGi/T9dLoSiM5/PJmbm56L2Ju7cezM/NAnDwNM8ABy+e7vgztrBIGcuidCJBnHPa4Jxm43G6M3iLbv7aT+cvnI+WBwJHn+wqr506/dHvP12j708cpp/f7JRTE+N8SUgRGRkR8zMzIrb4SHzS/gr/owJipcZDN7vfozfOnesDoChNTU3tN65fv+bz+3OPVxPuf7++oi388i12h16A8c9dVHz5DWRkCHM3fkD1iVeRHfrNEbXP5Vou9+mH9jee1Lq6uj4sLimxM5lMQXVZGYs3t0KNDEOP3MZEoQ9/fdyDIiOBve9eREF9CLVn3meZR4teNzl2e0fHZ2xtba2IMaatrqyw2eUlBHfVobzzDAYDtcg2NKNhdR6tsxNY+PwSVg0DFV4PtpeXM8aY5nK56rWRSERaGxzr0WGsfvUp9KMvIxOL4diFbrj2vYh7Z1+H/U43vJHbkN9dxXygDMFQGLls1hkdHYVWGwyyv8fHYTxcxO6p+2Cz9zF+5DjUpkOo9HqgXv0ROwLl2JVbR+zKFxh+6xSGT3aisukAivx+pul+P+q2V2IhsNMZ6rmM+ro61rjNDb70GNqePaj2eLCWToOpDJVdb+NhabWTWF7CwWCQFRcXQ7NtG0SElmPHmQQhnTGxwbmzISUbGx0FEUFKCc45Ctxu7HvpAPN4vVCkhLBtR1NVFUSE7JoFXdexs7ICLreLud3bwBjbehYhBDjnyOVyMNNp6LoOxhhjlmUtE5FNgOMQQdg2hLAhpYSqqlBVFfl8HpxzcM7hOA6IyFEUxc5msyusv7//g1Qqpem6vpHP520igqIoAAAiwmbevAkh7MLCwtz6+ro2MDBwFgCU1tbWS5OTk2SaJhmGIZPJJLcsS3DOBedcWJYlDMPgyWRSmqZJ09PT1NbW1gdA2dpYVVXV3NPTMxiNRimdTpNt27SJlJJM06SxsTHq7e2N1NTUHN4S6SkpFZ/PtyMcDh8Jh8ONpaWlAUVRkEgkEvF4/M7U1NRQKpV68KTO/wEwz8yoW00oqgAAAABJRU5ErkJggg==", w: 900, h: 532 },
    '-',
    { key: 'skulls', title: 'Welcome to SKULLS!', fav: (M.skulls || {}).fav, w: 900, h: 560 },
    { key: 'rasph', title: 'Rasphodel \u2014 Web Client', fav: (M.rasph || {}).fav, w: 900, h: 540 },
    { key: 'nurse', title: 'Nurse Jackie - Free Online Stress Games', fav: (M.nurse || {}).fav, w: 900, h: 540 }
  ];
  // protruding tab on the right edge of the map
  function initTab() {
    var tab = document.createElement('div'); tab.id = 'bmtab'; tab.title = '书签 Bookmarks';
    tab.innerHTML = '<svg width="14" height="16" viewBox="0 0 14 16"><path d="M2 1.5h10v13L7 11l-5 3.5z" fill="#f4f4f4" stroke="#6f6f6f"/><path d="M4 4.5h6M4 7h6" stroke="#9a9a9a"/></svg><span>书签</span>';
    var list = document.createElement('div'); list.id = 'bmlist'; list.hidden = true;
    list.innerHTML = '<div class="h">书签</div>' + CWBOOKMARKS.map(function (b, i) { return b === '-' ? '<div class="sep"></div>' : '<a data-i="' + i + '"><img src="' + (b.fav || '') + '"><span></span></a>'; }).join('');
    list.querySelectorAll('a').forEach(function (a) { a.querySelector('span').textContent = CWBOOKMARKS[+a.dataset.i].title; });
    document.body.appendChild(tab); document.body.appendChild(list);
    function place() { var r = tab.getBoundingClientRect(); list.style.right = (innerWidth - r.left + 2) + 'px'; list.style.top = Math.max(4, Math.min(r.top, innerHeight - list.offsetHeight - 4)) + 'px'; }
    function close() { list.hidden = true; tab.classList.remove('on'); }
    tab.addEventListener('click', function () { if (!list.hidden) { close(); return; } list.hidden = false; tab.classList.add('on'); place(); });
    document.addEventListener('mousedown', function (e) { if (!list.hidden && !list.contains(e.target) && !tab.contains(e.target)) close(); }, true);
    list.addEventListener('click', function (e) { var a = e.target.closest('a'); if (!a) return; close(); var W = window.CW; if (!W) return; if (W.el.hidden) W.show(); else W.focus(); W.openSite(CWBOOKMARKS[+a.dataset.i].key); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTab); else initTab();
})();
