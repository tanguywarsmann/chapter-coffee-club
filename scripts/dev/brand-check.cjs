/**
 * VREAD brand check – minimal, no deps.
 * - Vérifie index.html (application-name, og:site_name, canonical, JSON-LD Organization + WebSite/SearchAction)
 * - Scanne src/** pour des "READ" orphelins (hors "VREAD", "ALREADY", "THREAD"...)
 * Exit code 0 = OK, 1 = erreurs.
 */
const fs = require('fs');
const path = require('path');

const Y = s => console.log('\x1b[33m%s\x1b[0m', s);
const G = s => console.log('\x1b[32m%s\x1b[0m', s);
const R = s => console.error('\x1b[31m%s\x1b[0m', s);

let errors = 0;

// ---------- 1) index.html checks ----------
const INDEX = path.resolve('index.html');
try {
  const html = fs.readFileSync(INDEX, 'utf8');

  const hasAppName = /<meta\s+name=["']application-name["']\s+content=["']VREAD["']\s*\/?>/i.test(html);
  const hasOgSite  = /<meta\s+property=["']og:site_name["']\s+content=["']VREAD["']\s*\/?>/i.test(html);
  const hasCanon   = /<link\s+rel=["']canonical["']\s+href=["']https:\/\/www\.vread\.fr\/["']\s*\/?>/i.test(html);

  const hasOrg     = /"@type"\s*:\s*"Organization"/.test(html) && /"name"\s*:\s*"VREAD"/.test(html);
  const hasWebSite = /"@type"\s*:\s*"WebSite"/.test(html);
  const hasSearch  = /"@type"\s*:\s*"SearchAction"/.test(html) && /"target"\s*:\s*"https:\/\/www\.vread\.fr\/search\?q=\{search_term_string\}"/.test(html);

  Y('🔎 index.html');
  if (!hasAppName) { R('❌ application-name VREAD manquant'); errors++; } else { G('✅ application-name VREAD'); }
  if (!hasOgSite)  { R('❌ og:site_name VREAD manquant');   errors++; } else { G('✅ og:site_name VREAD'); }
  if (!hasCanon)   { R('❌ canonical https://www.vread.fr/ manquant'); errors++; } else { G('✅ canonical OK'); }
  if (!hasOrg)     { R('❌ JSON-LD Organization VREAD incomplet'); errors++; } else { G('✅ Organization OK'); }
  if (!hasWebSite) { R('❌ JSON-LD WebSite absent'); errors++; } else { G('✅ WebSite OK'); }
  if (!hasSearch)  { R('❌ WebSite.potentialAction/SearchAction incorrect'); errors++; } else { G('✅ SearchAction OK'); }
} catch (e) {
  R(`❌ Lecture index.html échouée: ${e.message}`); errors++;
}

// ---------- 2) scan src/** for "READ" orphelin ----------
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(t|j)sx?$/.test(entry.name)) out.push(p);
  }
  return out;
}
const SRC = path.resolve('src');
let problems = [];
if (fs.existsSync(SRC)) {
  Y('\n🔎 scan des sources pour "READ" orphelin');
  const files = walk(SRC);
  const bad = /\bREAD\b(?!-?\w)/i; // mot READ isolé
  for (const f of files) {
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (bad.test(line) && !/VREAD/i.test(line) && !/ALREADY|THREAD|BREADCRUMB/i.test(line)) {
        problems.push({ f, i: i + 1, line: line.trim().slice(0, 140) });
      }
    });
  }
  if (problems.length) {
    R(`❌ ${problems.length} occurrence(s) "READ" suspecte(s) :`);
    problems.slice(0, 30).forEach(p => R(`   ${p.f}:${p.i} → ${p.line}`)); // limité à 30 affichages
    errors += problems.length;
  } else {
    G('✅ aucune occurrence problématique');
  }
} else {
  Y('ℹ️  dossier src/ introuvable, scan sauté');
}

// ---------- Résumé ----------
Y('\n📊 RÉSUMÉ');
if (errors === 0) {
  G('🎉 Tout est OK. Cohérence VREAD confirmée.');
  process.exit(0);
} else {
  R(`💥 ${errors} erreur(s) détectée(s).`);
  process.exit(1);
}
