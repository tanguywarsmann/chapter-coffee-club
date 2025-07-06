
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

interface OptimizationResult {
  original: string;
  webp: string;
  avif: string;
  originalSize: number;
  webpSize: number;
  avifSize: number;
}

const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png'];
const QUALITY_WEBP = 85;
const QUALITY_AVIF = 80;

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function optimizeImage(inputPath: string): Promise<OptimizationResult | null> {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    if (!SUPPORTED_FORMATS.includes(ext)) {
      return null;
    }

    const dir = path.dirname(inputPath);
    const name = path.basename(inputPath, ext);
    
    const webpPath = path.join(dir, `${name}.webp`);
    const avifPath = path.join(dir, `${name}.avif`);

    // Obtenir les stats du fichier original
    const originalStats = fs.statSync(inputPath);
    
    // Générer WebP
    await sharp(inputPath)
      .webp({ quality: QUALITY_WEBP, effort: 6 })
      .toFile(webpPath);
    
    // Générer AVIF
    await sharp(inputPath)
      .avif({ quality: QUALITY_AVIF, effort: 4 })
      .toFile(avifPath);

    // Obtenir les tailles des nouveaux fichiers
    const webpStats = fs.statSync(webpPath);
    const avifStats = fs.statSync(avifPath);

    return {
      original: inputPath,
      webp: webpPath,
      avif: avifPath,
      originalSize: originalStats.size,
      webpSize: webpStats.size,
      avifSize: avifStats.size
    };
  } catch (error) {
    console.error(`Erreur lors de l'optimisation de ${inputPath}:`, error);
    return null;
  }
}

async function processDirectory(dirPath: string): Promise<OptimizationResult[]> {
  const results: OptimizationResult[] = [];
  
  if (!fs.existsSync(dirPath)) {
    console.log(`Le dossier ${dirPath} n'existe pas, ignoré.`);
    return results;
  }

  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Récursion pour les sous-dossiers
      const subResults = await processDirectory(filePath);
      results.push(...subResults);
    } else {
      const result = await optimizeImage(filePath);
      if (result) {
        results.push(result);
      }
    }
  }
  
  return results;
}

async function main() {
  console.log('🖼️  Optimisation des images avec Sharp...\n');
  
  const publicDir = path.join(process.cwd(), 'public');
  const imageDirs = [
    path.join(publicDir, 'images'),
    path.join(publicDir, 'blog-images'),
    path.join(publicDir, 'lovable-uploads')
  ];
  
  let totalResults: OptimizationResult[] = [];
  
  for (const dir of imageDirs) {
    console.log(`📁 Traitement du dossier: ${path.relative(process.cwd(), dir)}`);
    const results = await processDirectory(dir);
    totalResults.push(...results);
  }
  
  if (totalResults.length === 0) {
    console.log('❌ Aucune image à optimiser trouvée.');
    return;
  }
  
  // Afficher le résumé
  console.log('\n📊 Résumé de l\'optimisation:\n');
  
  let totalOriginalSize = 0;
  let totalWebpSize = 0;
  let totalAvifSize = 0;
  
  totalResults.forEach((result, index) => {
    const relativePath = path.relative(process.cwd(), result.original);
    const webpSavings = ((result.originalSize - result.webpSize) / result.originalSize * 100).toFixed(1);
    const avifSavings = ((result.originalSize - result.avifSize) / result.originalSize * 100).toFixed(1);
    
    console.log(`${index + 1}. ${relativePath}`);
    console.log(`   Original: ${formatBytes(result.originalSize)}`);
    console.log(`   WebP: ${formatBytes(result.webpSize)} (-${webpSavings}%)`);
    console.log(`   AVIF: ${formatBytes(result.avifSize)} (-${avifSavings}%)`);
    console.log('');
    
    totalOriginalSize += result.originalSize;
    totalWebpSize += result.webpSize;
    totalAvifSize += result.avifSize;
  });
  
  const totalWebpSavings = ((totalOriginalSize - totalWebpSize) / totalOriginalSize * 100).toFixed(1);
  const totalAvifSavings = ((totalOriginalSize - totalAvifSize) / totalOriginalSize * 100).toFixed(1);
  
  console.log('🎯 Total:');
  console.log(`   Images optimisées: ${totalResults.length}`);
  console.log(`   Taille originale: ${formatBytes(totalOriginalSize)}`);
  console.log(`   Taille WebP: ${formatBytes(totalWebpSize)} (-${totalWebpSavings}%)`);
  console.log(`   Taille AVIF: ${formatBytes(totalAvifSize)} (-${totalAvifSavings}%)`);
  console.log(`\n✅ Optimisation terminée avec succès!`);
}

main().catch(console.error);
