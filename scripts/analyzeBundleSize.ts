
import fs from 'fs';
import path from 'path';

interface ChunkInfo {
  name: string;
  size: number;
  sizeFormatted: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeDistFolder(): ChunkInfo[] {
  const distPath = path.join(process.cwd(), 'dist', 'assets');
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ Dossier dist/assets non trouvé. Veuillez builder l\'application d\'abord.');
    return [];
  }

  const files = fs.readdirSync(distPath);
  const chunks: ChunkInfo[] = [];

  files.forEach(file => {
    if (file.endsWith('.js') || file.endsWith('.css')) {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      
      chunks.push({
        name: file,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size)
      });
    }
  });

  return chunks.sort((a, b) => b.size - a.size);
}

function printBundleAnalysis() {
  console.log('🔍 Analyse du bundle READ\n');
  
  const chunks = analyzeDistFolder();
  
  if (chunks.length === 0) {
    return;
  }

  console.log('📦 Chunks par taille (décroissant):\n');
  
  let totalSize = 0;
  const heavyChunks: ChunkInfo[] = [];
  
  chunks.forEach((chunk, index) => {
    totalSize += chunk.size;
    
    // Identifier les chunks > 1MB
    if (chunk.size > 1000 * 1024) {
      heavyChunks.push(chunk);
    }
    
    const icon = chunk.size > 1000 * 1024 ? '🚨' : 
                 chunk.size > 500 * 1024 ? '⚠️' : '✅';
    
    console.log(`${icon} ${index + 1}. ${chunk.name} - ${chunk.sizeFormatted}`);
  });
  
  console.log(`\n📊 Taille totale: ${formatBytes(totalSize)}`);
  
  if (heavyChunks.length > 0) {
    console.log('\n🚨 Chunks lourds (>1MB) détectés:');
    heavyChunks.forEach(chunk => {
      console.log(`   • ${chunk.name} - ${chunk.sizeFormatted}`);
    });
    
    console.log('\n💡 Recommandations:');
    console.log('   • Considérer le lazy loading pour ces chunks');
    console.log('   • Vérifier les dépendances incluses');
    console.log('   • Optimiser les imports (tree-shaking)');
  } else {
    console.log('\n✅ Aucun chunk lourd détecté');
  }
  
  console.log('\n🎯 Performance check:');
  const jsFiles = chunks.filter(c => c.name.endsWith('.js'));
  const cssFiles = chunks.filter(c => c.name.endsWith('.css'));
  
  console.log(`   • ${jsFiles.length} fichiers JS`);
  console.log(`   • ${cssFiles.length} fichiers CSS`);
  console.log(`   • Bundle principal: ${jsFiles[0]?.sizeFormatted || 'N/A'}`);
}

// Exécuter l'analyse
printBundleAnalysis();
