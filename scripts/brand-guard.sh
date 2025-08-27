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
head()      { curl -sI "$1"; }

# 1) Apex redirige vers www (308/301)
acode=$(head "$APEX_URL" | awk 'NR==1{print $2}')
loc=$(head "$APEX_URL" | awk -F': ' '/^location:/I{print $2}' | tr -d '\r')
[[ "$acode" =~ ^30[18]$ ]] || fail "Apex ne renvoie pas 301/308 (code $acode)"
[[ "$loc" == "$BASE_URL/" || "$loc" == "$BASE_URL" ]] || fail "Location apex incorrecte: $loc"
info "Redirection apex OK"

# 2) Page d’accueil 200
[ "$(http_code "$BASE_URL/")" = "200" ] || fail "Accueil n’est pas 200"
info "Accueil 200 OK"

# 3) robots.txt & sitemap.xml
[ "$(http_code "$ROBOTS_URL")" = "200" ] || fail "robots.txt manquant"
grep -qi "sitemap: $SITEMAP_URL" <(curl -s "$ROBOTS_URL") || fail "robots ne référence pas le sitemap"
[ "$(http_code "$SITEMAP_URL")" = "200" ] || fail "sitemap.xml manquant"
info "Robots + Sitemap OK"

# 4) Canonical sur pages clés
for path in "/" "/a-propos" "/presse"; do
  url="$BASE_URL${path}"
  html=$(curl -s "$url")
  canon=$(printf "%s" "$html" | grep -io '<link[^>]*rel=["'"'"']canonical["'"'"'][^>]*>' | head -n1)
  [[ -n "$canon" ]] || fail "Canonical absent sur $url"
done
info "Canonicals OK"

# 5) En-têtes de sécurité
hdr=$(head "$BASE_URL/")
echo "$hdr" | grep -iq "^content-security-policy:" || fail "CSP manquant"
echo "$hdr" | grep -iq "^x-frame-options: *DENY" || fail "X-Frame-Options: DENY manquant"
echo "$hdr" | grep -iq "^referrer-policy: *strict-origin-when-cross-origin" || fail "Referrer-Policy incorrect"
echo "$hdr" | grep -iq "^x-content-type-options: *nosniff" || fail "X-Content-Type-Options manquant"
echo "$hdr" | grep -iq "^strict-transport-security:" || fail "HSTS manquant"
info "Headers sécurité OK"

# 6) Googlebot reçoit 200
gcode=$(curl -sI -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" "$BASE_URL/" | awk 'NR==1{print $2}')
[ "$gcode" = "200" ] || fail "Googlebot ne reçoit pas 200 (code $gcode)"

green "✅ Brand guard OK"
