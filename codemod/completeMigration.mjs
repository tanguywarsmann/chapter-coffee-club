#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mapping de remplacement complet
const replacements = [
  // Classes simples
  { from: /\btext-6xl\b/g, to: 'text-hero' },
  { from: /\btext-5xl\b/g, to: 'text-hero' },
  { from: /\btext-4xl\b/g, to: 'text-h1' },
  { from: /\btext-3xl\b/g, to: 'text-h2' },
  { from: /\btext-2xl\b/g, to: 'text-h3' },
  { from: /\btext-xl\b/g, to: 'text-h4' },
  { from: /\btext-lg\b/g, to: 'text-h4' },
  { from: /\btext-base\b/g, to: 'text-body' },
  { from: /\btext-sm\b/g, to: 'text-body-sm' },
  { from: /\btext-xs\b/g, to: 'text-caption' },
  
  // Classes avec préfixes responsive
  { from: /\b(sm|md|lg|xl|2xl):text-6xl\b/g, to: '$1:text-hero' },
  { from: /\b(sm|md|lg|xl|2xl):text-5xl\b/g, to: '$1:text-hero' },
  { from: /\b(sm|md|lg|xl|2xl):text-4xl\b/g, to: '$1:text-h1' },
  { from: /\b(sm|md|lg|xl|2xl):text-3xl\b/g, to: '$1:text-h2' },
  { from: /\b(sm|md|lg|xl|2xl):text-2xl\b/g, to: '$1:text-h3' },
  { from: /\b(sm|md|lg|xl|2xl):text-xl\b/g, to: '$1:text-h4' },
  { from: /\b(sm|md|lg|xl|2xl):text-lg\b/g, to: '$1:text-h4' },
  { from: /\b(sm|md|lg|xl|2xl):text-base\b/g, to: '$1:text-body' },
  { from: /\b(sm|md|lg|xl|2xl):text-sm\b/g, to: '$1:text-body-sm' },
  { from: /\b(sm|md|lg|xl|2xl):text-xs\b/g, to: '$1:text-caption' },
  
  // Classes avec états
  { from: /\b(hover|focus|active|disabled):text-6xl\b/g, to: '$1:text-hero' },
  { from: /\b(hover|focus|active|disabled):text-5xl\b/g, to: '$1:text-hero' },
  { from: /\b(hover|focus|active|disabled):text-4xl\b/g, to: '$1:text-h1' },
  { from: /\b(hover|focus|active|disabled):text-3xl\b/g, to: '$1:text-h2' },
  { from: /\b(hover|focus|active|disabled):text-2xl\b/g, to: '$1:text-h3' },
  { from: /\b(hover|focus|active|disabled):text-xl\b/g, to: '$1:text-h4' },
  { from: /\b(hover|focus|active|disabled):text-lg\b/g, to: '$1:text-h4' },
  { from: /\b(hover|focus|active|disabled):text-base\b/g, to: '$1:text-body' },
  { from: /\b(hover|focus|active|disabled):text-sm\b/g, to: '$1:text-body-sm' },
  { from: /\b(hover|focus|active|disabled):text-xs\b/g, to: '$1:text-caption' },
  
  // Classes dark mode
  { from: /\bdark:text-6xl\b/g, to: 'dark:text-hero' },
  { from: /\bdark:text-5xl\b/g, to: 'dark:text-hero' },
  { from: /\bdark:text-4xl\b/g, to: 'dark:text-h1' },
  { from: /\bdark:text-3xl\b/g, to: 'dark:text-h2' },
  { from: /\bdark:text-2xl\b/g, to: 'dark:text-h3' },
  { from: /\bdark:text-xl\b/g, to: 'dark:text-h4' },
  { from: /\bdark:text-lg\b/g, to: 'dark:text-h4' },
  { from: /\bdark:text-base\b/g, to: 'dark:text-body' },
  { from: /\bdark:text-sm\b/g, to: 'dark:text-body-sm' },
  { from: /\bdark:text-xs\b/g, to: 'dark:text-caption' }
];

// Nettoyage tracking (sauf dans UI)
const trackingReplacements = [
  { from: /\s+tracking-wide\s+/g, to: ' ' },
  { from: /\s+tracking-wider\s+/g, to: ' ' },
  { from: /\btracking-wide\b/g, to: '' },
  { from: /\btracking-wider\b/g, to: '' }
];

let filesAnalyzed = 0;
let filesModified = 0;
let replacementsTotal = 0;

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = join(dirPath, file);
    if (statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function processFile(filePath) {
  filesAnalyzed++;
  
  const originalContent = readFileSync(filePath, 'utf8');
  let modifiedContent = originalContent;
  let fileReplacements = 0;

  // Appliquer tous les remplacements
  replacements.forEach(({ from, to }) => {
    const matches = modifiedContent.match(from);
    if (matches) {
      fileReplacements += matches.length;
      modifiedContent = modifiedContent.replace(from, to);
    }
  });

  // Nettoyer tracking sauf dans /ui/
  if (!filePath.includes('/ui/')) {
    trackingReplacements.forEach(({ from, to }) => {
      const matches = modifiedContent.match(from);
      if (matches) {
        fileReplacements += matches.length;
        modifiedContent = modifiedContent.replace(from, to);
      }
    });
    
    // Nettoyer les espaces multiples
    modifiedContent = modifiedContent.replace(/\s+/g, ' ');
  }

  if (fileReplacements > 0) {
    writeFileSync(filePath, modifiedContent, 'utf8');
    filesModified++;
    replacementsTotal += fileReplacements;
    console.log(`✅ ${filePath}: ${fileReplacements} remplacements`);
  }
}

// Traiter tous les fichiers
const srcPath = join(__dirname, '../src');
const allFiles = getAllFiles(srcPath);

console.log('🚀 Migration automatique complète...\n');

allFiles.forEach(processFile);

console.log('\n📊 Résultats finaux:');
console.log(`- Fichiers analysés: ${filesAnalyzed}`);
console.log(`- Fichiers modifiés: ${filesModified}`);
console.log(`- Remplacements effectués: ${replacementsTotal}`);

// Vérification finale
console.log('\n🔍 Vérification finale...');
let remainingIssues = 0;

allFiles.forEach(filePath => {
  const content = readFileSync(filePath, 'utf8');
  const obsoleteMatches = content.match(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)/g);
  const trackingMatches = filePath.includes('/ui/') ? null : content.match(/tracking-(wide|wider)/g);
  
  if (obsoleteMatches || trackingMatches) {
    remainingIssues++;
    console.log(`⚠️  ${filePath}: ${obsoleteMatches?.length || 0} classes, ${trackingMatches?.length || 0} tracking`);
  }
});

if (remainingIssues === 0) {
  console.log('✅ Migration 100% terminée avec succès!');
} else {
  console.log(`❌ ${remainingIssues} fichiers contiennent encore des classes obsolètes`);
}