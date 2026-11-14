# Wiki rewrite brief (2026-11-08)

Project: an alt-history "2009 Wikipedia" replica (Monobook) inside a fictional 2009 world where the US fractured after the "Presidents' Day Massacre" (Mon 16 Feb 2009, adapted from Atwood's The Handmaid's Tale). Canon timeline: /workspace/work/gm/wiki/TIMELINE.md. Canon is binding: keep every name, date, number and fact already in the article unless it contradicts real history (then fix the real-history part). Fictional people only (never real people, no real reporters as bylines); real places, outlets, agencies, laws, roads, counties are wanted for realism. Article date = early November 2009; nothing after that.

## User's complaint
"The later sections are all very short and all the same length. Too AI-like, not a realistic Wikipedia article." The second half (地理/政府/经济/旗帜/国际反应 etc.) is one tidy paragraph each, symmetrical.

## What a real Nov-2009 Wikipedia article on a fast-moving current event looks like
- Uneven. Written by many editors. Some sections ballooned with news detail (dated, blow-by-blow, "On 3 March...", "By mid-April..."), with ### subsections; others are 1–2 sentences, or carry the expand tag.
- Lots of concrete real-world detail: real county names, real towns, highways, river miles, dams, bases, census-2000 / 2008-estimate figures (look them up with web_search/web_fetch on real Wikipedia/Census pages and use the real numbers), real agricultural/industry facts, real distances.
- At least one data table (e.g. member counties with seat, 2000 census population, date joined; or a reactions table; or election/vote result).
- Some lists (reactions by country/state, "Notable incidents"), some prose. Not every section needs references; some claims carry {{citation needed}} / {{来源请求}}.
- Hedged, slightly clunky encyclopedic tone, reported speech ("according to the Spokesman-Review..."), quotes from fictional officials, occasional awkward sentence, overlinking. No AI tells: no rule-of-three, no tidy closing summary sentences, no "值得注意的是/此外/总之", no parallel paragraph shapes, no em-dash flourishes, no evaluative adjectives.
- References: grow to roughly 15–30, mixing real outlets (AP, Reuters, local papers, CBC, BBC, agency press releases) with dates in 2009, a couple of pre-2009 real historical sources (real ones, correctly cited), maybe one "retrieved on" web cite. Fictional bylines only.
- zh version is a zh.wikipedia 2009 article (Simplified, mainland-ish 2009 zh-wiki style, translated-feel phrasing is OK, some English in brackets), not a sentence-for-sentence translation of en; the two can differ in section depth like real interlanguage articles (zh often a bit shorter/laggier, en more detailed), but facts must agree.
- Total length: en roughly 2–3x current; zh roughly 1.5–2.5x.
- Keep lead + infobox (you may fix/extend infobox rows). Rework the whole body, especially the second half.

## Markdown syntax the renderer (mkwiki.py md_build) supports — use ONLY these
- `# Title` first line. `> 【模板:现正发生】...` / `> {{Current}} ...` ambox lines at top; `> 【模板:消歧义】...` / `> {{About}} ...` hatnote.
- `## 信息框` / `## Infobox` then a 2-col pipe table (`| key | value |`). Rows with key 沿革/成立/History/Establishment are split on `；`/`;` then `：`/`:`.
- `## Section`, `### Subsection` (no ####).
- Paragraph = one line. `* item` bullet. `>> text` = blockquote.
- Pipe table inside a section = wikitable; first row = header; `|---|` lines are skipped.
- `{{Main|Target}}` / `{{主条目|目标}}` / `{{See also|A|B}}` / `{{参见|...}}` on its own line = hatnote.
- `{{Expand section}}` / `【模板:扩充章节】` own line = expand box.
- inline: `[[Link]]`, `[[Target|label]]`, `**bold**`, `*italic*`, `<ref>N</ref>` (N = number in references list), `{{citation needed}}`, `{{来源请求}}`, `{{who}}`, `{{谁}}`, `{{clarify}}`, `{{flagicon|USA|Canada|Mexico|EU|Gilead}}`, `<br>`.
- `[[Image:file.jpg|caption]]` own line — only for images already used in the article (do not invent new image files).
- `## 参考资料` / `## References` then lines `1. ...` numbered sequentially; `<ref>N</ref>` must match.
- `[[Category:...]]` lines; last line `最后修订于2009年11月X日（星期X）HH:MM。` / `This page was last modified on X November 2009, at HH:MM.` (bump to a date in 1–7 Nov 2009).

## Deliver
Overwrite articles/<id>.zh.md and articles/<id>.en.md. Then run `cd /workspace/work/gm/wiki && python3 mkwiki.py` to check it builds (prints ok). Do not touch other articles' files. Do not edit mkwiki.py. Report back in 5 lines: what sections changed, which real figures you looked up, anything you changed in canon facts and why.
