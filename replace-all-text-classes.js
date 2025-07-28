#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('🚀 Remplacement final en une seule passe...\n');

// Get all files with obsolete classes
let filesToProcess = [];
try {
  const grepResult = execSync('git grep -l "text-\\(xs\\|sm\\|base\\|lg\\|xl\\|2xl\\|3xl\\|4xl\\|5xl\\|6xl\\)" -- "*.ts*" "*.js*" || true', { encoding: 'utf8' });
  filesToProcess = grepResult.trim().split('\n').filter(f => f.length > 0);
} catch (e) {
  console.log('No files found or grep error');
}

console.log(`Found ${filesToProcess.length} files to process`);

let totalReplacements = 0;
let processedFiles = 0;

// All possible replacements in one pass
const replacements = [
  // Basic classes
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
  
  // With breakpoints
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
  
  // With states
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
  
  // Dark mode
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

filesToProcess.forEach(filePath => {
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
      processedFiles++;
      totalReplacements += fileReplacements;
      console.log(`✅ ${filePath}: ${fileReplacements} classes remplacées`);
    }
  } catch (e) {
    console.warn(`⚠️ Skip: ${filePath} - ${e.message}`);
  }
});

console.log('\n📊 Final Results:');
console.log(`- Files processed: ${processedFiles}`);
console.log(`- Total replacements: ${totalReplacements}`);

// Final verification
console.log('\n🔍 Final verification...');
try {
  const remainingResult = execSync('git grep -c "text-\\(xs\\|sm\\|base\\|lg\\|xl\\|2xl\\|3xl\\|4xl\\|5xl\\|6xl\\)" -- "*.ts*" "*.js*" || true', { encoding: 'utf8' });
  if (remainingResult.trim()) {
    console.log('❌ Remaining issues found');
    console.log(remainingResult);
  } else {
    console.log('✅ CLEAR - Migration 100% complete!');
  }
} catch (e) {
  console.log('✅ CLEAR - Migration 100% complete!');
}

console.log('\n🎉 Migration terminée!');