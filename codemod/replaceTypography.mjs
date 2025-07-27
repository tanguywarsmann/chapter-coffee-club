#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le mapping
const typographyMap = JSON.parse(readFileSync(join(__dirname, '../typography-map.json'), 'utf8'));

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

function replaceTypographyClasses(content) {
  let modifiedContent = content;
  let replacements = 0;

  // Remplacer chaque classe du mapping
  Object.entries(typographyMap).forEach(([oldClass, newClass]) => {
    // Pattern pour capturer la classe avec ou sans préfixes responsive
    const pattern = new RegExp(`(^|\\s|"|'|\\()([a-z]+:)?${oldClass}(?=\\s|"|'|\\)|$)`, 'g');
    const matches = modifiedContent.match(pattern);
    if (matches) {
      replacements += matches.length;
      modifiedContent = modifiedContent.replace(pattern, `$1$2${newClass}`);
    }
  });

  // Supprimer les classes tracking obsolètes (sauf dans /ui/)
  const trackingPattern = /\s*(tracking-(wide|wider|widest))\s*/g;
  const trackingMatches = modifiedContent.match(trackingPattern);
  if (trackingMatches) {
    replacements += trackingMatches.length;
    modifiedContent = modifiedContent.replace(trackingPattern, ' ');
  }

  return { content: modifiedContent, replacements };
}

function processFile(filePath) {
  filesAnalyzed++;
  
  // Skip UI components for tracking cleanup
  if (filePath.includes('/ui/')) {
    return;
  }

  const originalContent = readFileSync(filePath, 'utf8');
  const { content: newContent, replacements } = replaceTypographyClasses(originalContent);

  if (replacements > 0) {
    writeFileSync(filePath, newContent, 'utf8');
    filesModified++;
    replacementsTotal += replacements;
    console.log(`✅ ${filePath}: ${replacements} remplacements`);
  }
}

// Traiter tous les fichiers dans src/
const srcPath = join(__dirname, '../src');
const allFiles = getAllFiles(srcPath);

console.log('🚀 Début de la migration typographique...\n');

allFiles.forEach(processFile);

console.log('\n📊 Résultats de la migration:');
console.log(`- Fichiers analysés: ${filesAnalyzed}`);
console.log(`- Fichiers modifiés: ${filesModified}`);
console.log(`- Remplacements effectués: ${replacementsTotal}`);
console.log('\n✅ Migration terminée!');