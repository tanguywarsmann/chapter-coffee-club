#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

/**
 * Codemod pour supprimer les classes de couleur des toasts
 * Usage: node codemod/removeToastColors.mjs
 */

const colorClasses = [
  'bg-green-50', 'bg-red-50', 'bg-blue-50', 'bg-yellow-50',
  'text-green-800', 'text-red-800', 'text-blue-800', 'text-yellow-800',
  'border-green-200', 'border-red-200', 'border-blue-200', 'border-yellow-200'
];

async function removeToastColors() {
  try {
    // Chercher tous les fichiers TypeScript/JavaScript
    const files = await glob('src/**/*.{ts,tsx,js,jsx}', { ignore: 'node_modules/**' });
    
    let modifiedFiles = 0;
    
    for (const file of files) {
      let content = readFileSync(file, 'utf8');
      let modified = false;
      
      // Supprimer les classes de couleur dans les appels toast
      const toastRegex = /toast\.(success|error|info|warning)\([^)]*className:\s*["']([^"']*)["'][^)]*\)/g;
      
      content = content.replace(toastRegex, (match, method, className) => {
        let newClassName = className;
        
        // Supprimer chaque classe de couleur
        colorClasses.forEach(colorClass => {
          newClassName = newClassName.replace(new RegExp(`\\b${colorClass}\\b\\s*`, 'g'), '');
        });
        
        // Nettoyer les espaces multiples
        newClassName = newClassName.replace(/\s+/g, ' ').trim();
        
        if (newClassName !== className) {
          modified = true;
          return match.replace(className, newClassName);
        }
        
        return match;
      });
      
      // Supprimer les classes de couleur dans les composants Toast directs
      const toastComponentRegex = /<Toast[^>]*className=["']([^"']*)["'][^>]*>/g;
      
      content = content.replace(toastComponentRegex, (match, className) => {
        let newClassName = className;
        
        colorClasses.forEach(colorClass => {
          newClassName = newClassName.replace(new RegExp(`\\b${colorClass}\\b\\s*`, 'g'), '');
        });
        
        newClassName = newClassName.replace(/\s+/g, ' ').trim();
        
        if (newClassName !== className) {
          modified = true;
          return match.replace(className, newClassName);
        }
        
        return match;
      });
      
      if (modified) {
        writeFileSync(file, content);
        modifiedFiles++;
        console.log(`✅ Nettoyé: ${file}`);
      }
    }
    
    console.log(`\n🎉 Codemod terminé: ${modifiedFiles} fichier(s) modifié(s)`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

removeToastColors();