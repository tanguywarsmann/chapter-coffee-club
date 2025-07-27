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

function replaceTypographyClasses(content, filePath) {
  let modifiedContent = content;
  let replacements = 0;

  // Remplacer chaque classe du mapping avec préfixes responsive
  Object.entries(typographyMap).forEach(([oldClass, newClass]) => {
    // Pattern pour capturer la classe avec ou sans préfixes responsive/variants
    const patterns = [
      // Classes simples : text-xl, text-2xl, etc.
      new RegExp(`\\b${oldClass}\\b`, 'g'),
      // Classes avec préfixes responsive : sm:text-xl, md:text-2xl, etc.
      new RegExp(`\\b([a-z0-9]+:)${oldClass}\\b`, 'g'),
      // Classes avec états : hover:text-xl, focus:text-2xl, etc.
      new RegExp(`\\b(hover:|focus:|active:|disabled:)${oldClass}\\b`, 'g'),
      // Classes avec dark mode : dark:text-xl, etc.
      new RegExp(`\\bdark:${oldClass}\\b`, 'g')
    ];

    patterns.forEach(pattern => {
      const matches = modifiedContent.match(pattern);
      if (matches) {
        replacements += matches.length;
        if (pattern.source.includes('([a-z0-9]+:)')) {
          modifiedContent = modifiedContent.replace(pattern, `$1${newClass}`);
        } else if (pattern.source.includes('(hover:|focus:|active:|disabled:)')) {
          modifiedContent = modifiedContent.replace(pattern, `$1${newClass}`);
        } else if (pattern.source.includes('dark:')) {
          modifiedContent = modifiedContent.replace(pattern, `dark:${newClass}`);
        } else {
          modifiedContent = modifiedContent.replace(pattern, newClass);
        }
      }
    });
  });

  // Supprimer les classes tracking obsolètes (sauf dans /ui/)
  if (!filePath.includes('/ui/')) {
    const trackingPatterns = [
      /\btracking-wide\b/g,
      /\btracking-wider\b/g,
      /\btracking-widest\b/g
    ];
    
    trackingPatterns.forEach(pattern => {
      const matches = modifiedContent.match(pattern);
      if (matches) {
        replacements += matches.length;
        modifiedContent = modifiedContent.replace(pattern, '');
      }
    });
    
    // Nettoyer les espaces multiples
    modifiedContent = modifiedContent.replace(/\s+/g, ' ');
  }

  return { content: modifiedContent, replacements };
}

function processFile(filePath) {
  filesAnalyzed++;
  
  const originalContent = readFileSync(filePath, 'utf8');
  const { content: newContent, replacements } = replaceTypographyClasses(originalContent, filePath);

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

console.log('🚀 Début de la migration typographique complète...\n');

allFiles.forEach(processFile);

console.log('\n📊 Résultats de la migration:');
console.log(`- Fichiers analysés: ${filesAnalyzed}`);
console.log(`- Fichiers modifiés: ${filesModified}`);
console.log(`- Remplacements effectués: ${replacementsTotal}`);

// Vérifier s'il reste des classes obsolètes
console.log('\n🔍 Vérification finale...');
const checkFiles = getAllFiles(srcPath);
let remainingIssues = 0;

checkFiles.forEach(filePath => {
  const content = readFileSync(filePath, 'utf8');
  const obsoleteMatches = content.match(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)/g);
  const trackingMatches = filePath.includes('/ui/') ? null : content.match(/tracking-(wide|wider|widest)/g);
  
  if (obsoleteMatches || trackingMatches) {
    remainingIssues++;
    console.log(`⚠️  ${filePath}: ${obsoleteMatches?.length || 0} text classes, ${trackingMatches?.length || 0} tracking classes`);
  }
});

if (remainingIssues === 0) {
  console.log('✅ Migration terminée avec succès - aucune classe obsolète détectée!');
} else {
  console.log(`❌ ${remainingIssues} fichiers contiennent encore des classes obsolètes`);
}

console.log('\n✅ Migration terminée!');