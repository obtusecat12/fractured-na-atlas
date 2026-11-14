for round in 1 2 3 4; do
 while IFS=$'\t' read u f s; do [ -s "$f" ] && continue; curl -sL -m 25 -o "$f" "https://web.archive.org/web/20091105000000id_/$u"; [ -s "$f" ] || rm -f "$f"; sleep 1; done < map.txt
 sleep 20
done; ls res | wc -l
