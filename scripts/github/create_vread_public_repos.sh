#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CFG="$ROOT/scripts/github/org_config.json"

jq -r . >/dev/null 2>&1 || { echo "jq est requis"; exit 1; }
gh --version >/dev/null 2>&1 || { echo "GitHub CLI (gh) est requis"; exit 1; }

ORG=$(jq -r '.ORG_SLUG' "$CFG")
SITE=$(jq -r '.SITE_URL' "$CFG")
XURL=$(jq -r '.X_URL' "$CFG")
LNK=$(jq -r '.LINKEDIN_URL' "$CFG")
DESC=$(jq -r '.DESCRIPTION' "$CFG")
TOPICS=$(jq -r '.TOPICS | join(",")' "$CFG")

echo "Organisation: $ORG"
echo "Homepage: $SITE"
echo "Description: $DESC"
echo

create_repo () {
  local NAME="$1"
  local DESCRIPTION="$2"
  local HOMEPAGE="$3"
  local PRIVATE_FLAG="$4"   # "public" ou "private"
  local DISABLE_ISSUES="$5" # "true/false"
  local DISABLE_WIKI="$6"   # "true/false"

  echo "Création repo $ORG/$NAME…"
  gh repo create "$ORG/$NAME" --"$PRIVATE_FLAG" \
    --description "$DESCRIPTION" \
    --homepage "$HOMEPAGE" \
    --disable-issues="$DISABLE_ISSUES" \
    --disable-wiki="$DISABLE_WIKI" \
    --confirm

  # Topics
  IFS=',' read -ra ARR <<< "$TOPICS"
  for t in "${ARR[@]}"; do gh repo edit "$ORG/$NAME" --add-topic "$t" >/dev/null || true; done

  # Options de merge et nettoyage
  gh api -X PATCH "repos/$ORG/$NAME" \
    -f allow_squash_merge=true \
    -f allow_merge_commit=false \
    -f allow_rebase_merge=false \
    -f delete_branch_on_merge=true >/dev/null || true
}

init_push_content () {
  local NAME="$1"
  local SRC_DIR="$2"

  local TMP="$(mktemp -d)"
  cp -R "$SRC_DIR/." "$TMP/"

  pushd "$TMP" >/dev/null
  git init -b main
  git add .
  git -c user.name="vread-bot" -c user.email="bot@vread.fr" commit -m "chore: initial public content"
  git remote add origin "https://github.com/$ORG/$NAME.git"
  git push -u origin main
  popd >/dev/null
  rm -rf "$TMP"
}

# 1) Repo .github (profil org)
WORKDIR="$ROOT/scripts/github/work"
rm -rf "$WORKDIR" && mkdir -p "$WORKDIR"

ORG_DIR="$WORKDIR/.github"
mkdir -p "$ORG_DIR/profile"
sed "s|{{SITE_URL}}|$SITE|g; s|{{X_URL}}|$XURL|g; s|{{LINKEDIN_URL}}|$LNK|g" \
  "$ROOT/scripts/github/templates/org_profile_README.md" > "$ORG_DIR/profile/README.md"

create_repo ".github" "$DESC" "$SITE" "public" "true" "true"
init_push_content ".github" "$ORG_DIR"

# 2) Repo press-kit
PK_DIR="$WORKDIR/press-kit"
mkdir -p "$PK_DIR/logos" "$PK_DIR/screens"
cp "$ROOT/scripts/github/templates/press_kit_README.md" "$PK_DIR/README.md"
cp "$ROOT/scripts/github/templates/LICENSE_CC_BY_ND_4_0.txt" "$PK_DIR/LICENSE"
cp "$ROOT/scripts/github/templates/.gitattributes" "$PK_DIR/.gitattributes"
echo "# Boilerplate presse VREAD" > "$PK_DIR/boilerplate.md"
# Placeholders
echo "(placer logos ici)" > "$PK_DIR/logos/README.txt"
echo "(placer captures ici)" > "$PK_DIR/screens/README.txt"

# Remplacements simples
sed -i.bak "s|{{SITE_URL}}|$SITE|g" "$PK_DIR/README.md" && rm -f "$PK_DIR/README.md.bak"

create_repo "press-kit" "VREAD — Press kit officiel" "$SITE" "public" "true" "true"
init_push_content "press-kit" "$PK_DIR"
gh release create "v1.0.0" --repo "$ORG/press-kit" --title "Press kit v1.0.0" --notes "Première livraison."

# 3) Repo brand
BR_DIR="$WORKDIR/brand"
mkdir -p "$BR_DIR/logos" "$BR_DIR/og"
cp "$ROOT/scripts/github/templates/brand_README.md" "$BR_DIR/README.md"
cp "$ROOT/scripts/github/templates/LICENSE_CC_BY_ND_4_0.txt" "$BR_DIR/LICENSE"
cp "$ROOT/scripts/github/templates/.gitattributes" "$BR_DIR/.gitattributes"
# Placeholders
echo "(placer social preview 1200x630 ici)" > "$BR_DIR/og/social-preview.png"

create_repo "brand" "VREAD — Brand guidelines publiques" "$SITE" "public" "true" "true"
init_push_content "brand" "$BR_DIR"

# 4) Repo public-changelog
CH_DIR="$WORKDIR/public-changelog"
mkdir -p "$CH_DIR"
cp "$ROOT/scripts/github/templates/changelog_README.md" "$CH_DIR/README.md"
echo "# 0.1.0\n- Première note publique" > "$CH_DIR/CHANGELOG.md"

sed -i.bak "s|{{SITE_URL}}|$SITE|g; s|{{X_URL}}|$XURL|g" "$CH_DIR/README.md" && rm -f "$CH_DIR/README.md.bak"

create_repo "public-changelog" "VREAD — Changelog public" "$SITE" "public" "true" "true"
init_push_content "public-changelog" "$CH_DIR"

echo
echo "Terminé."
echo "Épingle maintenant ces dépôts sur la page d'org: .github, press-kit, brand, public-changelog."
echo "Pense à vérifier le domaine de l'org (Verified domains) dans les Settings."
echo "Les repos publics ne contiennent que des assets/markdown. Aucun code applicatif."