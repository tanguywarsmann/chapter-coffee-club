#!/usr/bin/env node

/**
 * VÉRIFICATEUR DE COHÉRENCE DE MARQUE
 * Vérifie que la marque "VREAD" est cohérente dans tout le projet
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function log(color, message) {
  console.log(`${color}${message}${RESET}`);
}

async function checkBrandConsistency() {
  log(YELLOW, '🔍 Vérification de la cohérence de marque VREAD...\n');
  
  let errors = 0;
  
  // 1. Vérifier index.html pour application-name et og:site_name
  log(YELLOW, '📋 Vérification des balises HTML globales...');
  try {
    const indexContent = fs.readFileSync('index.html', 'utf8');
    
    if (!indexContent.includes('<meta name="application-name" content="VREAD">')) {
      log(RED, '❌ Manque: <meta name="application-name" content="VREAD">');
      errors++;
    } else {
      log(GREEN, '✅ application-name: VREAD');
    }
    
    if (!indexContent.includes('<meta property="og:site_name" content="VREAD">')) {
      log(RED, '❌ Manque: <meta property="og:site_name" content="VREAD">');
      errors++;
    } else {
      log(GREEN, '✅ og:site_name: VREAD');
    }
    
    if (!indexContent.includes('"name":"VREAD"')) {
      log(RED, '❌ JSON-LD Organization: nom manquant ou incorrect');
      errors++;
    } else {
      log(GREEN, '✅ JSON-LD Organization: VREAD');
    }
    
  } catch (error) {
    log(RED, `❌ Erreur lecture index.html: ${error.message}`);
    errors++;
  }
  
  // 2. Scanner les fichiers source pour les occurrences isolées de "READ"
  log(YELLOW, '\n📂 Analyse des fichiers source...');
  
  const patterns = [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/components/ui/**',
    '!src/**/node_modules/**'
  ];
  
  const files = await glob(patterns);
  const problematicFiles = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Chercher " READ " isolé (pas dans VREAD, ALREADY, THREAD etc.)
        if (/\b(?<!V)READ\b/.test(line) && !line.includes('VREAD')) {
          // Ignorer les commentaires et certains contextes légitimes
          if (!line.trim().startsWith('//') && 
              !line.trim().startsWith('*') &&
              !line.includes('readFile') &&
              !line.includes('readable') &&
              !line.includes('reader') &&
              !line.includes('already') &&
              !line.includes('thread') &&
              !line.includes('spread') &&
              !line.includes('bread')) {
            
            problematicFiles.push({
              file,
              line: index + 1,
              content: line.trim()
            });
          }
        }
      });
    } catch (error) {
      log(RED, `❌ Erreur lecture ${file}: ${error.message}`);
    }
  }
  
  if (problematicFiles.length > 0) {
    log(RED, `\n❌ ${problematicFiles.length} occurrence(s) problématique(s) de "READ" trouvée(s):`);
    problematicFiles.forEach(item => {
      log(RED, `   ${item.file}:${item.line} → ${item.content}`);
    });
    errors += problematicFiles.length;
  } else {
    log(GREEN, '✅ Aucune occurrence problématique de "READ" trouvée');
  }
  
  // 3. Résumé final
  log(YELLOW, '\n📊 RÉSUMÉ:');
  if (errors === 0) {
    log(GREEN, '🎉 Toutes les vérifications sont passées ! La marque VREAD est cohérente.');
  } else {
    log(RED, `💥 ${errors} erreur(s) détectée(s). Correction nécessaire.`);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  checkBrandConsistency().catch(error => {
    log(RED, `💥 Erreur fatale: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { checkBrandConsistency };