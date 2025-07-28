#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mapping complet final
const replacements = [
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
  
  // Avec préfixes responsive
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
];

// Tracking cleanup (sauf dans UI)
const trackingReplacements = [
  { from: /\s+tracking-wide\s+/g, to: ' ' },
  { from: /\s+tracking-wider\s+/g, to: ' ' },
  { from: /\btracking-wide\b/g, to: '' },
  { from: /\btracking-wider\b/g, to: '' }
];

let filesModified = 0;
let replacementsTotal = 0;

function getAllFiles(dirPath, arrayOfFiles = []) {
  try {
    const files = readdirSync(dirPath);
    files.forEach(file => {
      const fullPath = join(dirPath, file);
      if (statSync(fullPath).isDirectory()) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        arrayOfFiles.push(fullPath);
      }
    });
  } catch (e) {
    // Ignore directories that don't exist
  }
  return arrayOfFiles;
}

function processFile(filePath) {
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
  }

  if (fileReplacements > 0) {
    writeFileSync(filePath, modifiedContent, 'utf8');
    filesModified++;
    replacementsTotal += fileReplacements;
    console.log(`✅ ${filePath}: ${fileReplacements} remplacements`);
  }
}

// Traiter tous les fichiers
const allFiles = [
  ...getAllFiles(join(__dirname, 'src')),
  ...getAllFiles(join(__dirname, 'pages')),
  ...getAllFiles(join(__dirname, 'tests')),
  ...getAllFiles(join(__dirname, 'stories')),
];

console.log('🚀 Migration finale - batch processing...\n');

allFiles.forEach(processFile);

console.log('\n📊 Résultats:');
console.log(`- Fichiers modifiés: ${filesModified}`);
console.log(`- Remplacements: ${replacementsTotal}`);
console.log('\n✅ Migration batch terminée!');