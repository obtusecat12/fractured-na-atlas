// 内容包清单。新增内容包：把文件放进 content/packs/，再把文件名（不带 .js）加到下面。
var CONTENT_PACKS = [
  'base-2009-10'
];
CONTENT_PACKS.forEach(function (n) { document.write('<script src="content/packs/' + n + '.js"><\/script>'); });
