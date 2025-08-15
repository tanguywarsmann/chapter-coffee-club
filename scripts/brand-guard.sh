#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://www.vread.fr}"
APEX_URL="${APEX_URL:-https://vread.fr}"
SITEMAP_URL="${SITEMAP_URL:-$BASE_URL/sitemap.xml}"
ROBOTS_URL="${ROBOTS_URL:-$BASE_URL/robots.txt}"

red()  { printf "\033[31m%s\033[0m\n" "$*"; }
green(){ printf "\033[32m%s\033[0m\n" "$*"; }
fail(){ red "❌ $*"; exit 1; }
info(){ printf "• %s\n" "$*"; }

http_code() { curl -s -o /dev/null -w "%{http_code}" "$1"; }
head_code() { curl -sI -o /dev/null -w "%{http_code}" "$1"; }
header()    { curl -sI "$1"; }
body()      { curl -sL "$1"; }

assert_code_200() {
  local url="$1"; local code; code="$(head_code "$url")"
  [ "$code" = "200" ] || fail "HTTP $code sur $url (attendu 200)"
  info "200 OK → $url"
}

# 1) Pages clés
for path in "/" "/blog" "/a-propos" "/presse"; do
  assert_code_200 "$BASE_URL$path"
done

# 2) Apex -> www, pas de chaîne
REDIRECTS=$(curl -sI -L -o /dev/null -w "%{num_redirects}" "$APEX_URL/")
FINAL_URL=$(curl -sI -L -o /dev/null -w "%{url_effective}" "$APEX_URL/")
FINAL_CODE=$(curl -sI -L -o /dev/null -w "%{http_code}" "$APEX_URL/")
[[ "$REDIRECTS" -le 1 ]] || fail "Chaîne de redirections trop longue ($REDIRECTS) depuis $APEX_URL/"
[[ "$FINAL_URL" == "$BASE_URL/"* ]] || fail "Apex ne redirige pas vers $BASE_URL/ (→ $FINAL_URL)"
info "Apex redirige correctement ($REDIRECTS hop) vers $FINAL_URL (code final $FINAL_CODE)"

# 3) Sitemap : status + contenu + URLs valides
code=$(head_code "$SITEMAP_URL"); [ "$code" = "200" ] || fail "Sitemap $SITEMAP_URL retourne $code"
headers=$(header "$SITEMAP_URL" | tr -d '\r')
echo "$headers" | grep -iq "content-type: .*xml" || fail "Sitemap sans Content-Type XML"
sm=$(body "$SITEMAP_URL")
echo "$sm" | grep -q "<urlset" || fail "Sitemap sans <urlset>"
# Extraction robuste des <loc> compatible Bash 3.2 (macOS) et Bash 5+
# - tolère espaces/retours ligne
LOCS=()
if command -v mapfile >/dev/null 2>&1; then
  mapfile -t LOCS < <(echo "$sm" \
    | tr -d '\r' \
    | sed -n 's/^[[:space:]]*<loc>[[:space:]]*\(https\?:\/\/[^<]*\)<\/loc>.*/\1/p')
else
  while IFS= read -r line; do
    LOCS+=("$line")
  done < <(echo "$sm" \
    | tr -d '\r' \
    | sed -n 's/^[[:space:]]*<loc>[[:space:]]*\(https\?:\/\/[^<]*\)<\/loc>.*/\1/p')
fi
[ "${#LOCS[@]}" -gt 0 ] || fail "Aucune <loc> trouvée dans le sitemap"
for u in "${LOCS[@]}"; do
  [[ "$u" == "$BASE_URL"* ]] || fail "URL sitemap hors www: $u"
  c=$(head_code "$u"); [ "$c" = "200" ] || fail "URL du sitemap non 200: $u (code $c)"
done
info "Sitemap OK avec ${#LOCS[@]} URL(s)"

# 4) Robots
rob=$(body "$ROBOTS_URL")
echo "$rob" | grep -q "Sitemap: $SITEMAP_URL" || fail "robots.txt ne référence pas $SITEMAP_URL"
echo "$rob" | grep -q "^Disallow: /blog-admin/" || fail "robots.txt devrait contenir 'Disallow: /blog-admin/'"
info "robots.txt OK"

# 5) Home HTML : canonical, og:url, JSON-LD
home=$(body "$BASE_URL/")
echo "$home" | grep -qi 'rel="canonical".*https://www\.vread\.fr/' || fail "Canonical home manquant/mauvais"
echo "$home" | grep -qi 'property="og:url".*https://www\.vread\.fr/' || fail "OG URL home manquant/mauvais"
echo "$home" | grep -qi '"@type":"WebSite"' || fail "JSON-LD WebSite manquant"
echo "$home" | grep -qi '"@type":"Organization"' || fail "JSON-LD Organization manquant"
echo "$home" | grep -qi '"url":"https://www\.vread\.fr/"' || fail "JSON-LD url != https://www.vread.fr/"
info "Balises home OK (canonical, og:url, JSON-LD)"

# 6) Headers sécurité
h=$(header "$BASE_URL/" | tr -d '\r')
echo "$h" | grep -iq "^Content-Security-Policy:" || fail "Header CSP manquant"
echo "$h" | grep -iq "^X-Frame-Options: *DENY" || fail "X-Frame-Options: DENY manquant"
echo "$h" | grep -iq "^Referrer-Policy: *strict-origin-when-cross-origin" || fail "Referrer-Policy incorrect"
echo "$h" | grep -iq "^X-Content-Type-Options: *nosniff" || fail "X-Content-Type-Options manquant"
echo "$h" | grep -iq "^Strict-Transport-Security:" || fail "HSTS manquant"
info "Headers sécurité OK"

# 7) Googlebot 200
botcode=$(curl -sI -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" "$BASE_URL/" | awk 'NR==1{print $2}')
[ "$botcode" = "200" ] || fail "Googlebot ne reçoit pas 200 (code $botcode)"

green "✅ Brand guard OK"