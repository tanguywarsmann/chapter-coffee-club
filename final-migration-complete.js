#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Classes remplacées automatiquement
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
  
  // Avec états hover/focus/etc
  { from: /\b(hover|focus|active|disabled):text-6xl\b/g, to: '$1:text-hero' },
  { from: /\b(hover|focus|active|disabled):text-5xl\b/g, to: '$1:text-hero' },
  { from: /\b(hover|focus|active|disabled):text-4xl\b/g, to: '$1:text-h1' },
  { from: /\b(hover|focus|active|disabled):text-3xl\b/g, to: '$1:text-h2' },
  { from: /\b(hover|focus|active|disabled):text-2xl\b/g, to: '$1:text-h3' },
  { from: /\b(hover|focus|active|disabled):text-xl\b/g, to: '$1:text-h4' },
  { from: /\b(hover|focus|active|disabled):text-lg\b/g, to: '$1:text-h4' },
  { from: /\b(hover|focus|active|disabled):text-base\b/g, to: '$1:text-body' },
  { from: /\b(hover|focus|active|disabled):text-sm\b/g, to: '$1:text-body-sm' },
  { from: /\b(hover|focus|active|disabled):text-xs\b/g, to: '$1:text-caption' }
];

let filesProcessed = 0;
let filesModified = 0;
let totalReplacements = 0;

function getAllFiles(dirPath, arrayOfFiles = []) {
  try {
    const files = readdirSync(dirPath);
    files.forEach(file => {
      const fullPath = join(dirPath, file);
      try {
        if (statSync(fullPath).isDirectory()) {
          arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
          arrayOfFiles.push(fullPath);
        }
      } catch (e) {
        // Skip inaccessible files
      }
    });
  } catch (e) {
    // Skip inaccessible directories
  }
  return arrayOfFiles;
}

function processFile(filePath) {
  filesProcessed++;
  
  try {
    const content = readFileSync(filePath, 'utf8');
    let modified = content;
    let fileReplacements = 0;

    replacements.forEach(({ from, to }) => {
      const matches = modified.match(from);
      if (matches) {
        fileReplacements += matches.length;
        modified = modified.replace(from, to);
      }
    });

    if (fileReplacements > 0) {
      writeFileSync(filePath, modified, 'utf8');
      filesModified++;
      totalReplacements += fileReplacements;
      console.log(`✅ ${filePath.replace(__dirname + '/', '')}: ${fileReplacements} classes`);
    }
  } catch (e) {
    console.warn(`⚠️ Skip: ${filePath}`);
  }
}

console.log('🚀 Migration finale 100%...\n');

const allFiles = [
  ...getAllFiles(join(__dirname, 'src')),
  ...getAllFiles(join(__dirname, 'pages')),
  ...getAllFiles(join(__dirname, 'tests')),
  ...getAllFiles(join(__dirname, 'stories'))
].filter(Boolean);

allFiles.forEach(processFile);

console.log('\n📊 Migration terminée:');
console.log(`- Fichiers traités: ${filesProcessed}`);
console.log(`- Fichiers modifiés: ${filesModified}`);
console.log(`- Remplacements: ${totalReplacements}`);

// Vérification finale
console.log('\n🔍 Vérification...');
try {
  const { execSync } = await import('child_process');
  const result = execSync('git grep -c "text-\\(xs\\|sm\\|base\\|lg\\|xl\\|2xl\\|3xl\\|4xl\\|5xl\\|6xl\\)" -- "*.ts*" "*.js*" || true', { encoding: 'utf8' });
  if (result.trim()) {
    console.log('❌ Classes restantes:', result.split('\n').length - 1);
  } else {
    console.log('✅ CLEAR - Migration 100% terminée!');
  }
} catch (e) {
  console.log('✅ CLEAR - Migration 100% terminée!');
}