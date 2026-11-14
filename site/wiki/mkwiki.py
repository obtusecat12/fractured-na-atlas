# Builds 2009 Monobook replicas of the Gilead article (zh + en) -> wiki/out/gilead_zh.html, gilead_en.html
# Assets in wiki/mb (MediaWiki 1.15.1 monobook skin, GPL; Wikimedia Commons icons; flag + locator are ours).
import os, html
D = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(D, 'out'); os.makedirs(OUT, exist_ok=True)

COMMON_CSS = r"""
/* 2009 Wikipedia MediaWiki:Common.css excerpts (re-typed) */
.infobox{border:1px solid #aaa;background-color:#f9f9f9;color:black;margin:.5em 0 .5em 1em;padding:.2em;float:right;clear:right;font-size:88%;line-height:1.5em;width:22em}
.infobox th,.infobox td{vertical-align:top;text-align:left;padding:2px 4px}
.infobox th{font-weight:bold}
.infobox caption{font-size:125%;font-weight:bold}
.infobox .ib-title{font-size:125%;font-weight:bold;text-align:center;background:#f0f0f0}
.infobox .ib-sub{text-align:center;font-size:90%}
.infobox .ib-hd{background:#ddd;text-align:center}
.ambox{margin:0 10%;border-collapse:collapse;background:#fbfbfb;border:1px solid #aaa;border-left:10px solid #1e90ff;margin-bottom:4px}
.ambox th.ambox-text,.ambox td.ambox-text{padding:.25em .5em;width:100%}
.ambox td.ambox-image{padding:2px 0 2px .5em;text-align:center}
.ambox-notice{border-left:10px solid #1e90ff}
.ambox-content{border-left:10px solid #f28500}
.ambox-current{border-left:10px solid #1e90ff}
.references{font-size:90%}
ol.references{margin-left:3.2em}
.reference{font-size:80%;vertical-align:super;line-height:1}
#toc,.toc{border:1px solid #aaa;background-color:#f9f9f9;padding:5px;font-size:95%;display:table}
#toc h2,.toc h2{display:inline;border:none;padding:0;font-size:100%;font-weight:bold}
#toc .toctitle{text-align:center}
#toc ul{list-style-type:none;list-style-image:none;margin-left:0;padding-left:0;text-align:left}
#toc ul ul{margin:0 0 0 2em}
.toctoggle{font-size:94%}
.tocnumber{color:#000}
.editsection{float:right;margin-left:5px;font-size:83%;font-weight:normal}
a.new{color:#ba0000}
.flagicon img{border:1px solid #ccc;vertical-align:middle;margin-right:3px}
#catlinks{margin-top:1em;clear:both}
.thumbcaption{font-size:94%;text-align:left;line-height:1.4em;padding:3px 0 0 0}
.locmap{border:1px solid #ccc}
/* zh variant tabs */
#p-variants{}
body.zh #p-cactions li a{padding:0 .6em}
"""

def wrap(L, aid, title, content, cat, FOOT0):
    zh = L == 'zh'
    t = lambda a, b: a if zh else b
    host = t('zh.wikipedia.org', 'en.wikipedia.org')
    def lk(x, new=False): return '<a href="#"%s>%s</a>' % (' class="new"' if new else '', x)
    if zh:
        tabs = [('ca-nstab-main', '条目', 1), ('ca-talk', '讨论', 0), ('ca-varlang-0', '不转换', 0), ('ca-varlang-1', '简体', 0), ('ca-varlang-2', '繁體', 0), ('ca-varlang-3', '大陆简体', 1), ('ca-varlang-4', '港澳繁體', 0), ('ca-varlang-5', '马新简体', 0), ('ca-varlang-6', '台灣正體', 0), ('ca-edit', '编辑本页', 0), ('ca-history', '历史', 0)]
        nav = ['首页', '分类索引', '特色内容', '新闻动态', '最近更改', '随机条目']
        help_ = ['帮助', '维基社群', '方针与指引', '互助客栈', '询问处', '字词转换', 'IRC即时聊天', '联络我们', '关于维基百科', '资助维基百科']
        tools = ['链入页面', '链出更改', '上传文件', '特殊页面', '可打印版', '永久链接', '引用此文']
        langs = [('English', 'en')]
        foot = [FOOT0, '本站的全部文字在<a href="#">知识共享 署名-相同方式共享 3.0协议</a>之条款下提供，附加条款亦可能应用。（请参阅<a href="#">使用条款</a>）<br>Wikipedia®和维基百科标志是<a href="#">维基媒体基金会</a>的注册商标；维基™是维基媒体基金会的商标。<br>维基媒体基金会是在美国佛罗里达州登记的501(c)(3)免税、非营利、慈善机构。', '<a href="#">隐私政策</a>', '<a href="#">关于维基百科</a>', '<a href="#">免责声明</a>']
        pers = '<li id="pt-anonuserpage"><a href="#" style="color:#2a4b8d">您的IP</a></li><li><a href="#">参数设置</a></li><li id="pt-login"><a href="#">登录／创建账户</a></li>'
        heads = ('导航', '帮助', '搜索', '工具箱', '其他语言', '进入', '搜索')
        sitesub = '维基百科，自由的百科全书'
    else:
        tabs = [('ca-nstab-main', 'article', 1), ('ca-talk', 'discussion', 0), ('ca-edit', 'edit this page', 0), ('ca-history', 'history', 0)]
        nav = ['Main page', 'Contents', 'Featured content', 'Current events', 'Random article']
        help_ = ['About Wikipedia', 'Community portal', 'Recent changes', 'Contact Wikipedia', 'Donate to Wikipedia', 'Help']
        tools = ['What links here', 'Related changes', 'Upload file', 'Special pages', 'Printable version', 'Permanent link', 'Cite this page']
        langs = [('中文', 'zh')]
        foot = [FOOT0, 'Text is available under the <a href="#">Creative Commons Attribution-ShareAlike License</a>; additional terms may apply. See <a href="#">Terms of Use</a> for details.<br>Wikipedia® is a registered trademark of the <a href="#">Wikimedia Foundation, Inc.</a>, a non-profit organization.', '<a href="#">Privacy policy</a>', '<a href="#">About Wikipedia</a>', '<a href="#">Disclaimers</a>']
        pers = '<li id="pt-login"><a href="#">Log in / create account</a></li>'
        heads = ('navigation', 'interaction', 'search', 'toolbox', 'languages', 'Go', 'Search')
        sitesub = 'From Wikipedia, the free encyclopedia'
    def portlet(pid, h, items): return '<div class="portlet" id="%s"><h5>%s</h5><div class="pBody"><ul>%s</ul></div></div>' % (pid, h, ''.join('<li><a href="#">%s</a></li>' % x for x in items))
    other = '%s_%s.html' % (aid, 'en' if zh else 'zh')
    page = f'''<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="{L}" lang="{L}" dir="ltr"><head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>{title} - {t('维基百科，自由的百科全书', 'Wikipedia, the free encyclopedia')}</title>
<link rel="stylesheet" href="mb/shared.css" /><link rel="stylesheet" href="mb/main.css" />
<style>{COMMON_CSS}</style></head>
<body class="mediawiki ltr ns-0 ns-subject page-{title.replace(' ', '_')} skin-monobook {L}">
<div id="globalWrapper"><div id="column-content"><div id="content"><a name="top" id="top"></a>
<div id="siteNotice"></div>
<h1 id="firstHeading" class="firstHeading">{title}</h1>
<div id="bodyContent"><h3 id="siteSub">{sitesub}</h3><div id="contentSub"></div>
<div id="jump-to-nav">{t('跳转到：', 'Jump to: ')}<a href="#column-one">{t('导航', 'navigation')}</a>, <a href="#searchInput">{t('搜索', 'search')}</a></div>
{content}
<div class="printfooter">{t('取自', 'Retrieved from')} "<a href="#">http://{host}/wiki/{html.escape(title.replace(' ', '_'))}</a>"</div>
{cat}<div class="visualClear"></div></div></div></div>
<div id="column-one">
<div id="p-cactions" class="portlet"><h5>Views</h5><div class="pBody"><ul>{''.join('<li id="%s"%s><a href="#">%s</a></li>' % (i, ' class="selected"' if s else '', x) for i, x, s in tabs)}</ul></div></div>
<div class="portlet" id="p-personal"><h5>Personal tools</h5><div class="pBody"><ul>{pers}</ul></div></div>
<div class="portlet" id="p-logo"><a style="background-image: url(mb/{L}_wiki.png);" href="#" title="{t('首页', 'Main Page')}"></a></div>
{portlet('p-navigation', heads[0], nav)}
{portlet('p-interaction', heads[1], help_)}
<div id="p-search" class="portlet"><h5><label for="searchInput">{heads[2]}</label></h5><div id="searchBody" class="pBody"><form action="#" id="searchform"><input id="searchInput" name="search" type="text" accesskey="f" /> <input type="submit" name="go" class="searchButton" id="searchGoButton" value="{heads[5]}" />&nbsp; <input type="submit" name="fulltext" class="searchButton" id="mw-searchButton" value="{heads[6]}" /></form></div></div>
{portlet('p-tb', heads[3], tools)}
<div id="p-lang" class="portlet"><h5>{heads[4]}</h5><div class="pBody"><ul>{''.join('<li class="interwiki-%s"><a href="%s">%s</a></li>' % (c, other, n) for n, c in langs)}</ul></div></div>
</div><div class="visualClear"></div>
<div id="footer"><div id="f-copyrightico"><a href="#"><img src="mb/wikimedia-button.png" width="88" height="31" alt="Wikimedia Foundation" /></a></div><div id="f-poweredbyico"><a href="#"><img src="mb/poweredby_mediawiki_88x31.png" height="31" width="88" alt="Powered by MediaWiki" /></a></div>
<ul id="f-list">{''.join('<li>%s</li>' % x for x in foot)}</ul></div></div></body></html>'''
    return page

def T(zh, en): return {'zh': zh, 'en': en}

def build(L):
    zh = L == 'zh'
    t = lambda a, b: a if zh else b
    title = t('基列共和国', 'Republic of Gilead')
    host = t('zh.wikipedia.org', 'en.wikipedia.org')
    secs = [
      ('名称', 'Name', None),
      ('历史', 'History', [('背景', 'Background'), ('总统日大屠杀', "Presidents' Day Massacre"), ('电子卡冻结', 'Compucard freeze'),
                         ('宣布成立与“战争”', 'Proclamation and "the War"'), ('与东北邻区的关系', 'Relations with northeastern neighbours')]),
      ('政治', 'Politics', None), ('国际反应', 'International reaction', None), ('参见', 'See also', None),
      ('参考资料', 'References', None), ('外部链接', 'External links', None)]
    toc = []; n = 0
    for a, b, sub in secs:
        n += 1
        s = '<li class="toclevel-1"><a href="#s%d"><span class="tocnumber">%d</span> <span class="toctext">%s</span></a>' % (n, n, t(a, b))
        if sub:
            s += '<ul>' + ''.join('<li class="toclevel-2"><a href="#s%d_%d"><span class="tocnumber">%d.%d</span> <span class="toctext">%s</span></a></li>' % (n, j + 1, n, j + 1, t(x, y)) for j, (x, y) in enumerate(sub)) + '</ul>'
        toc.append(s + '</li>')
    def r(i): return '<sup class="reference"><a href="#cite_note-%d">[%d]</a></sup>' % (i, i)
    def lk(x, new=False): return '<a href="#"%s>%s</a>' % (' class="new"' if new else '', x)
    ed = '<span class="editsection">[' + lk(t('编辑', 'edit')) + ']</span>'
    def h2(i, a, b): return '<h2>%s<span class="mw-headline" id="s%d">%s</span></h2>' % (ed, i, t(a, b))
    def h3(i, j, a, b): return '<h3>%s<span class="mw-headline" id="s%d_%d">%s</span></h3>' % (ed, i, j, t(a, b))
    fl = lambda f: '<span class="flagicon"><img src="mb/%s.png" width="22" alt=""></span>' % f

    amb = (
      '<table class="ambox ambox-current"><tr><td class="ambox-image"><img src="mb/ambox_current.png" width="42" alt=""></td><td class="ambox-text">'
      + t('本条目记述一个<b>正在发生的事件</b>。随着事件发展，内容可能迅速变化，初期报道亦可能不可靠。',
          'This article documents a <b>current event</b>. Information may change rapidly as the event progresses, and initial news reports may be unreliable.')
      + '</td></tr></table>'
      + '<table class="ambox ambox-content"><tr><td class="ambox-image"><img src="mb/scales.png" width="40" alt=""></td><td class="ambox-text">'
      + t('本条目的<b>中立性有争议</b>。请参见' + lk('讨论页') + '中的相关讨论。<small>（2009年10月）</small>',
          '<b>The neutrality of this article is disputed.</b> Please see the discussion on the ' + lk('talk page') + '. <small><i>(October 2009)</i></small>')
      + '</td></tr></table>')

    rows = [
      (t('格言', 'Motto'), t('“在祂眼下”<br><small>Under His Eye</small>', '"Under His Eye"')),
      (t('首都', 'Capital'), t(lk('华盛顿哥伦比亚特区') + '（宣称）<br><small>部分机关迁往' + lk('剑桥') + '</small>', lk('Washington, D.C.') + ' (claimed)<br><small>some ministries at ' + lk('Cambridge') + '</small>')),
      (t('最大城市', 'Largest city'), lk(t('纽约市', 'New York City'))),
      (t('官方语言', 'Official languages'), t(lk('英语') + '（事实上）', lk('English') + ' (de facto)')),
      (t('政体', 'Government'), t(lk('神权政治') + '、' + lk('军政府'), lk('Theocracy') + ', ' + lk('military junta'))),
      (t('&nbsp;-&nbsp;临时最高委员会主席', '&nbsp;-&nbsp;Chairman of the Provisional Supreme Council'), lk(t('B·弗雷德里克·贾德', 'B. Frederick Judd'), True)),
      (t('&nbsp;-&nbsp;委员会主要成员', '&nbsp;-&nbsp;Leading Council members'), lk(t('弗雷德里克·R·沃特福德', 'Frederick R. Waterford'), True) + '<br>' + lk(t('约瑟夫·劳伦斯', 'Joseph Lawrence'), True)),
      (t('立法机关', 'Legislature'), t('无（委员会以敕令治理）', 'None (rule by edict)')),
      ('HD', t('成立', 'Establishment')),
      (t('&nbsp;-&nbsp;' + lk('总统日大屠杀'), '&nbsp;-&nbsp;' + lk("Presidents' Day Massacre")), t('2009年2月16日', '16 February 2009')),
      (t('&nbsp;-&nbsp;紧急状态', '&nbsp;-&nbsp;State of emergency'), t('2009年2月17日', '17 February 2009')),
      (t('&nbsp;-&nbsp;宣布成立', '&nbsp;-&nbsp;Proclaimed'), t('2009年4月', 'April 2009')),
      ('HD', t('面积', 'Area')),
      (t('&nbsp;-&nbsp;实际控制区', '&nbsp;-&nbsp;Effective control'), t('约209,000 平方公里<br><small>（约80,700 平方英里）（含北部三区，估计）</small>', 'c. 209,000 km<sup>2</sup><br><small>(80,700 sq mi) (incl. northern districts, est.)</small>')),
      ('HD', t('人口', 'Population')),
      (t('&nbsp;-&nbsp;危机前估计', '&nbsp;-&nbsp;Pre-crisis estimate'), t('约4,300万' + r(1), 'c. 43 million' + r(1))),
      (t('&nbsp;-&nbsp;现时', '&nbsp;-&nbsp;Current'), t('不详，因逃亡与“安置”大幅减少', 'unknown; much reduced by flight and "resettlement"')),
      (t('货币', 'Currency'), t(lk('美元') + '（流通中）；政府推行' + lk('电子卡', True) + '账户', lk('United States dollar') + ' (in circulation); ' + lk('Compucard', True) + ' accounts')),
      (t('时区', 'Time zone'), lk(t('北美东部时区', 'Eastern')) + ' (UTC−5)'),
      (t('电话区号', 'Calling code'), t('无（国际线路中断）', 'none (international lines cut)')),
    ]
    ib = ['<table class="infobox" cellspacing="5">',
          '<tr><td colspan="2" class="ib-title">%s<br><span style="font-weight:normal;font-size:85%%">%s</span></td></tr>' % (t('基列神权共和国', 'Divine Republic of Gilead'), t('Divine Republic of Gilead', '')),
          '<tr><td colspan="2" style="text-align:center"><img src="mb/gilead_200.png" width="125" style="border:1px solid #ccc"><br><small>' + lk(t('国旗', 'Flag')) + '</small></td></tr>',
          '<tr><td colspan="2" style="text-align:center"><img class="locmap" src="mb/gilead_locator.png" width="250"><br><small>' + t('基列实际控制区（红色），2009年11月', 'Area under Gilead control (red), November 2009') + '</small></td></tr>']
    for a, b in rows:
        ib.append('<tr><td colspan="2" class="ib-hd"><b>%s</b></td></tr>' % b if a == 'HD' else '<tr><th>%s</th><td>%s</td></tr>' % (a, b))
    ib.append('</table>')

    P = []
    P.append(t(
      '<p><b>基列共和国</b>（英语：<span lang="en">Republic of Gilead</span>），官方自称<b>基列神权共和国</b>（<span lang="en">Divine Republic of Gilead</span>），是2009年4月在' + lk('华盛顿哥伦比亚特区') + '宣布成立的一个政权，由在' + lk('总统日大屠杀', True) + '后接管联邦首都的军事—宗教团体“' + lk('雅各之子', True) + '”领导。截至2009年11月，基列实际控制' + lk('美国东北部') + '沿' + lk('95号州际公路') + '的城市带，从' + lk('弗吉尼亚州') + '北部经' + lk('巴尔的摩') + '、' + lk('费城') + '、' + lk('纽约市') + '延伸至' + lk('新英格兰') + '大部，北部另有三个由其扶植的自治区。</p>'
      '<p>基列政权未获' + lk('联合国') + '任何成员国承认。' + lk('美国联邦政府', True) + '（' + lk('萨克拉门托') + '）、' + lk('加拿大') + '、' + lk('欧洲联盟') + '视其为非法占领当局。' + lk('圣座') + '则在其将' + lk('天主教') + '列为“敌对教派”后召回驻华盛顿教廷大使。</p>',
      '<p>The <b>Republic of Gilead</b>, officially the <b>Divine Republic of Gilead</b>, is a regime proclaimed in ' + lk('Washington, D.C.') + ' in April 2009 by the "' + lk('Sons of Jacob', True) + '", a military-religious movement that seized the federal capital after the ' + lk("Presidents' Day Massacre", True) + '. As of November 2009 Gilead controls the ' + lk('Interstate 95') + ' urban corridor of the ' + lk('Northeastern United States') + ', from ' + lk('Northern Virginia') + ' through ' + lk('Baltimore') + ', ' + lk('Philadelphia') + ' and ' + lk('New York City') + ' to most of ' + lk('New England') + ', with three client districts in the north.</p>'
      '<p>Gilead is not recognized by any member state of the ' + lk('United Nations') + '. The ' + lk('United States Government (2009–)', True) + ' in ' + lk('Sacramento, California', False) + ', ' + lk('Canada') + ' and the ' + lk('European Union') + ' regard it as an illegal occupying authority. The ' + lk('Holy See') + ' recalled its nuncio from Washington after Gilead declared the ' + lk('Catholic Church') + ' a "hostile sect".</p>'))
    P.append('<table id="toc" class="toc" summary="%s"><tr><td><div id="toctitle"><h2>%s</h2> <span class="toctoggle">[<a href="#">%s</a>]</span></div><ul>%s</ul></td></tr></table>' % (t('目录', 'Contents'), t('目录', 'Contents'), t('隐藏', 'hide'), ''.join(toc)))
    P.append(h2(1, '名称', 'Name'))
    P.append(t('<p>“基列”一词出自《' + lk('希伯来圣经') + '》中的' + lk('基列') + '地区，《' + lk('耶利米书') + '》8:22有“在基列岂没有乳香呢？”之句。该名称最早出现在2006年至2007年间“雅各之子”相关团体内部流传的油印小册子中。' + r(2) + '</p>',
               '<p>"Gilead" is taken from the region of ' + lk('Gilead') + ' in the ' + lk('Hebrew Bible') + '; ' + lk('Jeremiah') + ' 8:22 asks "Is there no balm in Gilead?". The name first appears in mimeographed pamphlets circulated among groups linked to the Sons of Jacob in 2006–2007.' + r(2) + '</p>'))
    P.append(h2(2, '历史', 'History'))
    P.append(h3(2, 1, '背景', 'Background'))
    P.append(t('<p>2003年至2008年间，美国及多数工业化国家出生率持续下降。' + lk('美国疾病控制与预防中心') + '2006年起在报告中使用“出生荒”（Birth Dearth）一词。' + r(3) + '同期出现多起' + lk('梅毒') + '抗药菌株（媒体称“R型梅毒”）疫情以及化学污染、核电站事故恐慌，进一步加剧了社会不安。</p><p>“雅各之子”是2005年前后成形的一批保守派智库与教会网络的统称，主张以“恢复传统家庭秩序”应对生育危机。其成员包括退役军官、私人安保公司人员与若干州议员，但此前在全国政坛影响有限。' + r(4) + '</p>',
               '<p>Between 2003 and 2008 birth rates fell steadily in the United States and most industrialized countries. From 2006 the ' + lk('Centers for Disease Control and Prevention') + ' used the term "Birth Dearth" in its reports.' + r(3) + ' Outbreaks of a drug-resistant strain of ' + lk('syphilis') + ' (dubbed "R-strain" by the press) and scares over chemical contamination and nuclear plant accidents added to public unease.</p><p>"Sons of Jacob" is a collective name for a network of conservative think tanks and churches that took shape around 2005, advocating a "restoration of the traditional family order" as the answer to the fertility crisis. Its members included retired officers, private security contractors and a number of state legislators, but it had little influence in national politics before 2009.' + r(4) + '</p>'))
    P.append(h3(2, 2, '总统日大屠杀', "Presidents' Day Massacre"))
    P.append(t('<p>2009年2月16日（' + lk('总统日') + '），白宫遭炸弹袭击；同日，' + lk('美国国会') + '为听取总统关于“国家生育紧急状态”的演说召开联席会议时，遭武装人员扫射。总统、副总统及大多数在场议员遇难。袭击最初被归咎于“伊斯兰狂热分子”，但此说法至今未经任何独立调查证实。' + r(5) + '</p><p>2月17日，驻华盛顿军方宣布全国紧急状态，“暂时中止”' + lk('美国宪法') + '，实施宵禁、新闻审查，并开始发放' + lk('身份通行证', True) + '（Identipass）。</p>',
               '<p>On 16 February 2009 (' + lk("Presidents' Day") + ') the White House was bombed, and gunmen opened fire on a joint session of ' + lk('United States Congress', False).replace('United States Congress', 'Congress') + ' convened to hear the President\'s address on a "national fertility emergency". The President, the Vice President and most members present were killed. The attack was initially blamed on "Islamic fanatics", a claim that no independent inquiry has confirmed.' + r(5) + '</p><p>On 17 February the military in Washington declared a national emergency and "temporarily suspended" the ' + lk('Constitution') + ', imposing a curfew and press censorship and introducing the ' + lk('Identipass', True) + '.</p>'))
    P.append(h3(2, 3, '电子卡冻结', 'Compucard freeze'))
    P.append(t('<p>2009年3月，临时当局冻结所有女性名下的银行账户与电子卡，将资金转归其丈夫或男性近亲，并以命令解除女性的就业。' + lk('波士顿') + '与华盛顿的抗议游行遭到开枪镇压。' + r(6) + '</p>',
               '<p>In March 2009 the provisional authorities froze all bank accounts and Compucards held by women, transferring the funds to husbands or male next of kin, and ordered women dismissed from employment. Protest marches in ' + lk('Boston') + ' and Washington were fired upon.' + r(6) + '</p>'))
    P.append(h3(2, 4, '宣布成立与“战争”', 'Proclamation and "the War"'))
    P.append(t('<p>2009年4月，临时政府在华盛顿宣布成立基列共和国，并宣布' + lk('贵格会') + '、' + lk('天主教') + '与' + lk('浸信会') + '为“敌对教派”。同年春夏，基列军队（自称“天启天使”第四师）在' + lk('阿巴拉契亚山脉') + '与浸信会武装交战；另一部沿95号州际公路北上，先后控制' + lk('费城') + '、' + lk('纽约市') + '与' + lk('波士顿') + '，随后接管新英格兰大部。' + lk('底特律') + '亦曾发生巷战，该地区目前处于' + lk('无线电静默区', True) + '。</p><p>2009年7月，基列宣布将“含的子孙”迁往' + lk('北达科他州') + '所谓“第一民族家园”。' + lk('美国公民自由联盟') + '及多个国际人权组织称之为强制驱逐。' + r(7) + '同期，基列推行针对' + lk('犹太人') + '的“遣返”计划，据报有船只载运离境者前往' + lk('以色列') + '，部分船只下落不明。</p>',
               '<p>In April 2009 the provisional government proclaimed the Republic of Gilead in Washington and named the ' + lk('Quakers') + ', ' + lk('Catholics') + ' and ' + lk('Baptists') + ' "hostile sects". Through the spring and summer Gilead\'s forces (styled the 4th Division, "Angels of the Apocalypse") fought Baptist militias in the ' + lk('Appalachian Mountains') + ', while another column advanced north along I-95, taking Philadelphia, New York City and Boston before occupying most of New England. Street fighting was also reported in ' + lk('Detroit') + ', now within the ' + lk('Radio Silence zone', True) + '.</p><p>In July 2009 Gilead announced the "Resettlement of the Children of Ham" to "National Homeland One" in ' + lk('North Dakota') + '. The ' + lk('American Civil Liberties Union', False).replace('American Civil Liberties Union', 'ACLU') + ' and several international human rights groups have called it a forced deportation.' + r(7) + ' Gilead also began a "repatriation" scheme for ' + lk('Jews') + '; ships reportedly carried departees toward ' + lk('Israel') + ', and some are unaccounted for.</p>'))
    P.append(h3(2, 5, '与东北邻区的关系', 'Relations with northeastern neighbours'))
    P.append(t('<p>' + lk('马萨诸塞州') + '东南部（' + lk('普利茅斯县') + '至' + lk('楠塔基特') + '）目前由' + lk('黑水公司安全特许区', True) + '控制，与基列对峙。' + lk('缅因州') + '北部的' + lk('阿鲁斯图克边区', True) + '、' + lk('佩诺布斯科特圣约区', True) + '与跨佛蒙特、新罕布什尔两州的' + lk('东北王国区', True) + '名义上自治，实际由基列驻军控制。' + lk('佛蒙特共和国', True) + '与' + lk('绿山共和国', True) + '拒绝承认基列在新英格兰的任何管辖。</p>',
               '<p>Southeastern ' + lk('Massachusetts') + ' (' + lk('Plymouth County') + ' to ' + lk('Nantucket') + ') is held by the ' + lk('Blackwater Security Concession', True) + ', which faces Gilead across a fortified line. In northern ' + lk('Maine') + ', the ' + lk('Aroostook March', True) + ' and the ' + lk('Penobscot Covenant District', True) + ', together with the ' + lk('District of the Northeast Kingdom', True) + ' straddling Vermont and New Hampshire, are nominally autonomous but garrisoned by Gilead. The ' + lk('Republic of Vermont', True) + ' and the ' + lk('Green Mountain Republic', True) + ' reject any Gileadean jurisdiction in New England.</p>'))
    P.append(h2(3, '政治', 'Politics'))
    P.append(t('<p>基列目前没有成文宪法。权力集中于“雅各之子委员会”，以敕令治理。据流出的内部文件，社会按男性职衔（“大主教”、“卫士”、“天使”）与女性角色分级。' + r(8) + '由于新闻管制，外界对基列内部情况的了解主要来自逃亡者证词与' + lk('加拿大') + '难民机构的访谈。</p>',
               '<p>Gilead has no written constitution. Power rests with the Council of the Sons of Jacob, which governs by edict. According to leaked internal documents, society is ranked by male titles ("Commander", "Guardian", "Angel") and assigned female roles.' + r(8) + ' Because of press controls, outside knowledge of conditions in Gilead comes mainly from refugee testimony and interviews by Canadian refugee agencies.</p>'))
    P.append(h2(4, '国际反应', 'International reaction'))
    P.append('<ul>' + ''.join('<li>%s<b>%s</b>：%s</li>'.replace('：', t('：', ': ')) % (fl(f), lk(a), b) for f, a, b in [
        ('f_us', t('美国联邦政府', 'U.S. federal government'), t('称基列为“在联邦首都非法夺权的叛乱集团”。', 'calls Gilead "an insurgent faction that has unlawfully seized the federal capital".')),
        ('f_ca', t('加拿大', 'Canada'), t('关闭与基列控制区之间的全部口岸，开放难民通道。', 'closed all border crossings with Gilead-held territory and opened refugee channels.')),
        ('f_eu', t('欧洲联盟', 'European Union'), t('冻结与基列有关人员的资产。', 'froze assets of persons linked to Gilead.')),
        ('f_mx', t('墨西哥', 'Mexico'), t('未表态；参见' + lk('2009年墨西哥对新墨西哥州的干预', True) + '。', 'no statement; see ' + lk('2009 Mexican intervention in New Mexico', True) + '.'))]) + '</ul>')
    P.append(h2(5, '参见', 'See also'))
    P.append('<ul>' + ''.join('<li>' + lk(x, True) + '</li>' for x in (t('总统日大屠杀', "Presidents' Day Massacre"), t('2009年美国解体', 'Dissolution of the United States (2009)'), t('美国联邦政府 (2009年–)', 'United States Government (2009–)'), t('无线电静默区', 'Radio Silence zone'), t('联邦通信委员会09-4A号紧急指令', 'FCC Emergency Directive 09-4A'))) + '</ul>')
    P.append(h2(6, '参考资料', 'References'))
    refs = [
      t('按基列及北部三区现辖县份合计，依美国人口普查局县级人口估计推算。', 'Sum of counties now held by Gilead and the northern districts, from U.S. Census Bureau county population estimates.'),
      '"\'Gilead\' pamphlets circulated in Virginia churches". <i>Richmond Times-Dispatch</i>. 2007-11-03.',
      '"Fertility in the United States: Birth Dearth Update". <i>CDC Data Brief</i>. 2006.',
      'Marsh, Allen. "Who are the Sons of Jacob?". <i>The Atlantic</i>. 2009-03-02.',
      '"Unanswered questions over February 16 attacks". <i>BBC News</i>. 2009-05-11.',
      '"Troops fire on marchers in Boston". <i>Reuters</i>. 2009-03-21.',
      '"UN rights chief condemns \'resettlement\' in North Dakota". <i>AFP</i>. 2009-08-04.',
      '"Leaked papers describe Gilead\'s \'household\' ranks". <i>The Globe and Mail</i>. 2009-10-12.']
    P.append('<div class="references-small"><ol class="references">' + ''.join('<li id="cite_note-%d"><b><a href="#">^</a></b> %s%s</li>' % (i + 1, x, t(' （英文）', '') if i else '') for i, x in enumerate(refs)) + '</ol></div>')
    P.append(h2(7, '外部链接', 'External links'))
    P.append('<ul><li>' + t('<span style="color:#888">（已失效）</span>基列临时委员会官方网站', '<span style="color:#888">(dead link)</span> Official website of the Provisional Council of Gilead') + '</li></ul>')
    cats = t(['2009年建立的国家或政权', '美国的分离主义', '神权政治', '未被承认的国家'], ['States and territories established in 2009', 'Secessionism in the United States', 'Theocracies', 'Unrecognized states'])
    cat = '<div id="catlinks" class="catlinks"><div id="mw-normal-catlinks">' + lk(t('页面分类', 'Categories')) + ': ' + ' | '.join('<span dir="ltr">' + lk(c) + '</span>' for c in cats) + '</div></div>'

    page = wrap(L, 'gilead', title, amb + ''.join(ib) + ''.join(P), cat, t('本页面最后修订于2009年11月6日 (星期五) 21:14。', 'This page was last modified on 6 November 2009 at 21:14.'))
    open(os.path.join(D, 'gilead_%s.html' % L), 'w').write(page)

# gilead now built from articles/gilead.*.md via md_build (2026-11-08)

# ---------- generic markdown article -> Monobook (articles/<id>.<L>.md) ----------
import re as _re
FICT = ['大屠杀', 'Massacre', '雅各之子', 'Sons of Jacob', '军管区', 'Military District', '太平洋司令部领地', 'Command Territory', '联邦保护区', 'Protectorate',
        '联邦飞地', 'Enclave', '占领区', 'Occupation Zone', '核打击区', 'strike zone', '核爆炸', 'nuclear explosions', '卡斯卡迪亚', 'Cascadia']
FLAGS = {'Canada': 'f_ca', 'EU': 'f_eu', 'Mexico': 'f_mx', 'USA': 'f_us', 'Gilead': 'gilead_22', 'Deseret': 'dst_22', 'Sequoyah': 'sequoyah_22'}
ARTS = {'基列共和国': 'gilead', 'Republic of Gilead': 'gilead'}
SEALS = {'sequoyah': 'sequoyah_seal_110.png'}
def md_build(aid, L, flag_img, loc_img, loc_cap):
    zh = L == 'zh'; t = lambda a, b: a if zh else b
    src = open(os.path.join(D, 'articles', '%s.%s.md' % (aid, L)), encoding='utf-8').read().splitlines()
    def lk(x, new=False): return '<a href="#"%s>%s</a>' % (' class="new"' if new else '', x)
    def inl(x):
        x = x.replace('&', '&amp;').replace('<br>', '\x01')
        x = _re.sub(r'<ref>(\d+)</ref>', lambda m: '\x02%s\x03' % m.group(1), x)
        x = x.replace('<', '&lt;').replace('>', '&gt;').replace('\x01', '<br>')
        x = _re.sub(r'\x02(\d+)\x03', lambda m: '<sup class="reference"><a href="#cite_note-%s">[%s]</a></sup>' % (m.group(1), m.group(1)), x)
        x = _re.sub(r'\{\{(citation needed|来源请求|需要来源)\}\}', lambda m: '<sup class="noprint Template-Fact">[<i>%s</i>]</sup>' % ('<a href="#">citation needed</a>' if m.group(1)=='citation needed' else '<a href="#">来源请求</a>'), x)
        x = _re.sub(r'\{\{(who|谁)\}\}', lambda m: '<sup class="noprint">[<i><a href="#">%s</a></i>]</sup>' % ('who?' if m.group(1)=='who' else '谁？'), x)
        x = _re.sub(r'\{\{(clarify|澄清)\}\}', lambda m: '<sup class="noprint">[<i><a href="#">%s</a></i>]</sup>' % ('clarification needed' if m.group(1)=='clarify' else '需要澄清'), x)
        x = _re.sub(r'\{\{flagicon\|(\w+)\}\}', lambda m: '<span class="flagicon"><img src="mb/%s.png" width="22" alt=""></span>' % FLAGS.get(m.group(1), 'f_us'), x)
        def wl(m):
            tgt, lab = (m.group(1).split('|', 1) + [None])[:2]; lab = lab or tgt
            return lk(lab, any(k in tgt for k in FICT))
        x = _re.sub(r'\[\[([^\]]+)\]\]', wl, x)
        x = _re.sub(r'\[(http[^ \]]+) ([^\]]+)\]', r'<a href="#" class="external text">\2</a>', x)
        x = _re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', x); x = _re.sub(r'\*(.+?)\*', r'<i>\1</i>', x)
        return x
    title = src[0][2:].strip(); i = 1
    hat, amb, lead, secs, ib, refs, cats, foot = [], [], [], [], [], [], [], ''
    cur = None; mode = None
    for ln in src[1:]:
        st = ln.strip()
        if not st: continue
        if st.startswith('[[Category:'):
            cats += _re.findall(r'\[\[Category:([^\]]+)\]\]', st); continue
        if st.startswith('最后修订于') or st.startswith('This page was last modified'):
            foot = t('本页面' + st.replace('最后修订于', '最后修订于').replace('（', ' (').replace('）', ') ').rstrip(),  st); continue
        if st.startswith('> '):
            c = st[2:]
            if '消歧义' in c or '{{About}}' in c: hat.append(inl(_re.sub(r'^(【模板:消歧义】|\{\{About\}\})\s*', '', c)))
            else: amb.append(inl(_re.sub(r'^(【模板:[^】]+】|\{\{\w+\}\})\s*', '', c)))
            continue
        if st.startswith('## '):
            h = st[3:]
            if h in ('信息框', 'Infobox'): mode = 'ib'; continue
            mode = 'ref' if h in ('参考资料', 'References') else 'sec'
            cur = {'h': h, 'subs': [], 'body': []}; secs.append(cur); continue
        if st.startswith('### '):
            cur['subs'].append(st[4:]); cur['body'].append(('h3', st[4:])); continue
        if mode == 'ib':
            if st.startswith('|---'): continue
            cells = [c.strip() for c in _re.split(r'\s\|\s', ' ' + st.strip('|').strip() + ' ')][:2]
            cells += [''] * (2 - len(cells))
            ib.append(cells); continue
        if mode == 'ref' and _re.match(r'\d+\. ', st):
            refs.append(inl(st.split('. ', 1)[1])); continue
        tgt = cur['body'] if cur else lead
        mm = _re.match(r'\{\{(Main|See also|Further|主条目|参见|延伸阅读)\|(.+)\}\}$', st)
        if mm:
            lab = {'Main': 'Main article', 'See also': 'See also', 'Further': 'Further information', '主条目': '主条目', '参见': '参见', '延伸阅读': '延伸阅读'}[mm.group(1)]
            tgt.append(('raw', '<div class="dablink" style="padding-left:2em;font-style:italic;margin-bottom:.5em">%s%s %s</div>' % (lab, '：' if zh else ':', '、'.join(inl('[[%s]]' % a) for a in mm.group(2).split('|')) if zh else ', '.join(inl('[[%s]]' % a) for a in mm.group(2).split('|')))))
            continue
        if st in ('{{Expand section}}', '【模板:扩充章节】'):
            tgt.append(('raw', '<table class="ambox ambox-content" style="margin:4px 10%%;border:1px solid #aaa;border-left:10px solid #f28500;background:#fbfbfb;width:80%%"><tr><td class="ambox-text" style="padding:.25em .5em;font-size:90%%">%s</td></tr></table>' % t('<b>此章节需要扩充。</b>您可以通过<a href="#">编辑</a>来帮助扩充此章节。', '<b>This section requires <a href="#">expansion</a>.</b>')))
            continue
        if st.startswith('|') and mode == 'sec':
            if st.startswith('|---'): continue
            cells = [c.strip() for c in st.strip().strip('|').split('|')]
            if tgt and tgt[-1][0] == 'tbl': tgt[-1][1].append(cells)
            else: tgt.append(('tbl', [cells]))
            continue
        if st.startswith('>> '):
            tgt.append(('raw', '<blockquote><p>%s</p></blockquote>' % inl(st[3:]))); continue
        mi = _re.match(r'\[\[Image:([\w.\-]+)\|(.+)\]\]$', st)
        if mi:
            tgt.append(('img', '<div class="thumb tleft"><div class="thumbinner" style="width:222px;"><a href="#" class="image"><img src="mb/%s" width="220" class="thumbimage" alt=""></a><div class="thumbcaption"><div class="magnify"><a href="#" class="internal" title="%s"><img src="mb/magnify-clip.png" width="15" height="11" alt=""></a></div>%s</div></div></div>' % (mi.group(1), t('放大', 'Enlarge'), inl(mi.group(2))))); continue
        tgt.append(('li', inl(st[2:])) if st.startswith('* ') else ('p', inl(st)))
    # infobox
    head = ib[0][0].split(' / ')
    rows = ['<table class="infobox" cellspacing="5">', '<tr><td colspan="2" class="ib-title">%s%s</td></tr>' % (head[0], ('<br><span style="font-weight:normal;font-size:85%%">%s</span>' % head[1]) if zh and len(head) > 1 else ''),
            (('<tr><td colspan="2" style="text-align:center"><img src="mb/%s" width="125" style="border:1px solid #ccc"><br><small>%s</small></td></tr>' % (flag_img, lk(next((k for k, v in ib[1:] if v.startswith('[[File:')), t('国旗', 'Flag'))))) if aid not in SEALS else
             ('<tr><td colspan="2" style="text-align:center"><table style="width:100%%;background:none;border:0"><tr><td style="text-align:center;vertical-align:middle;border:0"><img src="mb/%s" width="125" style="border:1px solid #ccc"><br><small>%s</small></td><td style="text-align:center;vertical-align:middle;border:0"><img src="mb/%s" width="85"><br><small>%s</small></td></tr></table></td></tr>' % (flag_img, lk([k for k, v in ib[1:] if v.startswith('[[File:')][0]), SEALS[aid], lk([k for k, v in ib[1:] if v.startswith('[[File:')][1])))),
            '<tr><td colspan="2" style="text-align:center"><img class="locmap" src="mb/%s" width="250"><br><small>%s</small></td></tr>' % (loc_img, loc_cap)]
    for k, v in ib[1:]:
        if v.startswith('[[File:'): continue
        if k in ('继任', 'Succession', '成立', 'Establishment', '沿革', 'History'):
            rows.append('<tr><td colspan="2" class="ib-hd"><b>%s</b></td></tr>' % k)
            for part in _re.split(r'[；;] ?', v):
                a, b = _re.split(r'[：:] ?', part, 1)
                rows.append('<tr><th>&nbsp;-&nbsp;%s</th><td>%s</td></tr>' % (inl(a), inl(b)))
            continue
        if k in ('面积', 'Area', '人口', 'Population'):
            rows.append('<tr><td colspan="2" class="ib-hd"><b>%s</b></td></tr><tr><th>&nbsp;-&nbsp;%s</th><td>%s</td></tr>' % (k, t('估计', 'Estimate'), inl(v))); continue
        rows.append('<tr><th>%s</th><td>%s</td></tr>' % (inl(k), inl(v)))
    rows.append('</table>')
    ed = '<span class="editsection">[' + lk(t('编辑', 'edit')) + ']</span>'
    out = []
    if hat: out += ['<div class="dablink" style="padding-left:2em;font-style:italic;margin-bottom:.5em">%s</div>' % h for h in hat]
    for a in amb:
        out.append('<table class="ambox ambox-current"><tr><td class="ambox-image"><img src="mb/ambox_current.png" width="42" alt=""></td><td class="ambox-text">%s</td></tr></table>' % a)
    out.append(''.join(rows))
    def flush(items):
        o = []; ul = False
        for kind, x in items:
            if kind == 'li' and not ul: o.append('<ul>'); ul = True
            if kind != 'li' and ul: o.append('</ul>'); ul = False
            if kind == 'tbl':
                o.append('<table class="wikitable" style="margin:1em 0;background:#f9f9f9;border:1px solid #aaa;border-collapse:collapse;font-size:95%%">' + ''.join('<tr>' + ''.join(('<th style="border:1px solid #aaa;padding:.2em .4em;background:#f2f2f2">%s</th>' if ri == 0 else '<td style="border:1px solid #aaa;padding:.2em .4em">%s</td>') % inl(c) for c in row) + '</tr>' for ri, row in enumerate(x)) + '</table>'); continue
            o.append({'p': '<p>%s</p>', 'li': '<li>%s</li>'}.get(kind, '%s') % x if kind != 'h3' else x)
        if ul: o.append('</ul>')
        return ''.join(o)
    out.append(flush(lead))
    toc = []
    for n, sc in enumerate(secs, 1):
        li = '<li class="toclevel-1"><a href="#s%d"><span class="tocnumber">%d</span> <span class="toctext">%s</span></a>' % (n, n, sc['h'])
        if sc['subs']: li += '<ul>' + ''.join('<li class="toclevel-2"><a href="#s%d_%d"><span class="tocnumber">%d.%d</span> <span class="toctext">%s</span></a></li>' % (n, j, n, j, x) for j, x in enumerate(sc['subs'], 1)) + '</ul>'
        toc.append(li + '</li>')
    out.append('<table id="toc" class="toc"><tr><td><div id="toctitle"><h2>%s</h2> <span class="toctoggle">[<a href="#">%s</a>]</span></div><ul>%s</ul></td></tr></table>' % (t('目录', 'Contents'), t('隐藏', 'hide'), ''.join(toc)))
    for n, sc in enumerate(secs, 1):
        out.append('<h2>%s<span class="mw-headline" id="s%d">%s</span></h2>' % (ed, n, sc['h']))
        if sc['h'] in ('参考资料', 'References'):
            out.append('<div class="references-small"><ol class="references">' + ''.join('<li id="cite_note-%d"><b><a href="#">^</a></b> %s%s</li>' % (j, x, t(' （英文）', '')) for j, x in enumerate(refs, 1)) + '</ol></div>'); continue
        items = []; j = 0
        for kind, x in sc['body']:
            if kind == 'h3':
                j += 1; items.append(('h3', '<h3>%s<span class="mw-headline" id="s%d_%d">%s</span></h3>' % (ed, n, j, inl(x))))
            else: items.append((kind, x))
        out.append(flush(items))
    cat = '<div id="catlinks" class="catlinks"><div id="mw-normal-catlinks">' + lk(t('页面分类', 'Categories')) + ': ' + ' | '.join('<span dir="ltr">' + lk(c) + '</span>' for c in cats) + '</div></div>'
    page = wrap(L, aid, title, ''.join(out), cat, foot)
    open(os.path.join(D, '%s_%s.html' % (aid, L)), 'w').write(page)
    return title

TITLES = {}
for L in ('zh', 'en'):
    TITLES.setdefault('gilead', {})[L] = md_build('gilead', L, 'gilead_200.png', 'gilead_locator.png', ('基列实际控制区（红色），2009年11月' if L == 'zh' else 'Area under Gilead control (red), November 2009'))
    TITLES.setdefault('usg', {})[L] = md_build('usg', L, 'us_200.png', 'usg_locator.png', t_ := ('联邦政府实际控制区（红色），2009年11月' if L == 'zh' else 'Area under federal control (red), November 2009'))
    TITLES.setdefault('jefferson', {})[L] = md_build('jefferson', L, 'jefferson_200.png', 'jefferson_locator.png', ('杰斐逊州实际控制区（红色），2009年11月' if L == 'zh' else 'Area controlled by the State of Jefferson (red), November 2009'))
    TITLES.setdefault('lincoln', {})[L] = md_build('lincoln', L, 'lincoln_200.png', 'lincoln_locator.png', ('林肯州实际控制区（红色），2009年11月' if L == 'zh' else 'Area controlled by the State of Lincoln (red), November 2009'))
    TITLES.setdefault('sup', {})[L] = md_build('sup', L, 'sup_200.png', 'sup_locator.png', ('苏必利尔州实际控制区（红色），2009年11月' if L == 'zh' else 'Area controlled by the State of Superior (red), November 2009'))
    if os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)),'articles','frk.%s.md'%L)): TITLES.setdefault('frk', {})[L] = md_build('frk', L, 'frk_200.png', 'frk_locator.png', ('富兰克林州（红色）' if L == 'zh' else 'Location of Franklin (red)'))
    TITLES.setdefault('dst', {})[L] = md_build('dst', L, 'dst_200.png', 'dst_locator.png', ('德塞雷特州（红色）' if L == 'zh' else 'Location of Deseret (red)'))
    if os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)),'articles','sequoyah.%s.md'%L)): TITLES.setdefault('sequoyah', {})[L] = md_build('sequoyah', L, 'sequoyah_200.png', 'sequoyah_locator.png', ('塞阔亚州政府实际控制区（红色），2009年11月' if L == 'zh' else 'Area controlled by the Sequoyah state government (red), November 2009'))
print('ok')

# ---- pack both pages into ../wikipage.js (self-contained srcdoc; images as data URIs) ----
import re, base64, json
def datauri(fn):
    ext = fn.rsplit('.', 1)[1].lower(); mt = {'png': 'image/png', 'gif': 'image/gif', 'jpg': 'image/jpeg'}[ext]
    return 'data:%s;base64,%s' % (mt, base64.b64encode(open(os.path.join(D, 'mb', fn), 'rb').read()).decode())
def inline(h):
    def css(m):
        c = open(os.path.join(D, m.group(1)), encoding='utf-8').read()
        c = re.sub(r'url\(["\']?([\w\-]+\.(?:png|gif|jpg))["\']?\)', lambda u: 'url(%s)' % datauri(u.group(1)) if os.path.exists(os.path.join(D, 'mb', u.group(1))) else 'none', c)
        return '<style>' + c + '</style>'
    h = re.sub(r'<link rel="stylesheet" href="(mb/[\w.]+)" />', css, h)
    h = re.sub(r'(src="|url\()mb/([\w\-]+\.(?:png|gif|jpg))', lambda m: m.group(1) + datauri(m.group(2)), h)
    # interlanguage link + in-page '#' links: tell the parent / do nothing
    for a_ in TITLES:
        for l_ in ('en', 'zh'):
            h = h.replace('href="%s_%s.html"' % (a_, l_), 'href="#" onclick="parent.postMessage({wiki:\'%s\',lang:\'%s\'},\'*\');return false"' % (a_, l_))
    h = h.replace('<a href="#">', '<a href="#" onclick="return false">').replace('<a href="#" class="new">', '<a href="#" class="new" onclick="return false">')
    return h
pages = {a: {L: inline(open(os.path.join(D, '%s_%s.html' % (a, L)), encoding='utf-8').read()) for L in ('zh', 'en')} for a in TITLES}
js = """/* wikipage.js — generated by wiki/mkwiki.py: 2009 Monobook replicas (zh/en) opened in a Chrome tab */
(function () {
  var P = %s, FAV = %s, META = %s;
  window.CWSITES = window.CWSITES || {};
  function make(id) {
    return function (W) {
      var lang = (window.LANG && LANG.mode && LANG.mode() === 'en') ? 'en' : 'zh';
      var ifr = document.createElement('iframe'); ifr.setAttribute('title', 'Wikipedia');
      var t = W.open({ title: '', fav: FAV, host: '', path: '', node: ifr });
      function show(l) {
        lang = l; ifr.srcdoc = P[id][l];
        t.title = META[id][l] + (l === 'zh' ? ' - 维基百科，自由的百科全书' : ' - Wikipedia, the free encyclopedia');
        t.host = l + '.wikipedia.org'; t.path = '/wiki/' + (l === 'zh' ? META[id].zh : META[id].en.replace(/ /g, '_'));
        W.select(t);
      }
      window.addEventListener('message', function (e) { if (e.data && e.data.wiki === id && e.source === ifr.contentWindow) show(e.data.lang); });
      show(lang); return t;
    };
  }
  Object.keys(META).forEach(function (id) { CWSITES['wiki_' + id] = make(id); });
  window.openWiki = function (id) {
    if (!CWSITES['wiki_' + id] || !window.CW) return false;
    CW.show(); CW.openSite('wiki_' + id); return true;
  };
  window.WIKI_HAS = META;
  if (typeof buildSidebar === 'function' && window.D && D.meta) try { buildSidebar(null); } catch (e) {}
})();
""" % (json.dumps(pages, ensure_ascii=False).replace('</', '<\\/'), json.dumps(datauri('fav16.png')), json.dumps(TITLES, ensure_ascii=False))
open(os.path.join(D, '..', 'wikipage.js'), 'w', encoding='utf-8').write(js)
print('wikipage.js', len(js))
