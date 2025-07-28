#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

console.log('🚀 Lancement de la migration finale...\n');

try {
  // Exécuter le codemod
  console.log('📝 Exécution du codemod...');
  execSync('node codemod/completeMigration.mjs', { stdio: 'inherit' });
  
  // Vérifier s'il reste des classes obsolètes
  console.log('\n🔍 Vérification finale...');
  try {
    const result = execSync('git grep -nE "text-(xs|sm|base|lg|xl|[2-6]xl)" -- "*.ts*" "*.js*" "*.jsx" "*.tsx"', { encoding: 'utf8' });
    console.log('❌ Classes obsolètes encore présentes:');
    console.log(result);
  } catch (e) {
    console.log('✅ CLEAR - Aucune classe obsolète trouvée!');
  }
  
  // Vérifier tracking
  console.log('\n🔍 Vérification tracking...');
  try {
    const trackingResult = execSync('git grep -nE "tracking-(wide|wider|widest)" -- ":!src/components/ui/**"', { encoding: 'utf8' });
    console.log('❌ Classes tracking encore présentes hors UI:');
    console.log(trackingResult);
  } catch (e) {
    console.log('✅ TRACKING CLEAR - Aucune classe tracking hors UI!');
  }
  
  console.log('\n✅ Migration terminée avec succès!');
  
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error.message);
  process.exit(1);
}