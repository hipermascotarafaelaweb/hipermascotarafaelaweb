#!/usr/bin/env node

/**
 * Script para comprimir imágenes antes de subirlas a Supabase
 * Uso: node scripts/compress-images.js <ruta-carpeta>
 * Ejemplo: node scripts/compress-images.js ./imagenes-productos
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const args = process.argv.slice(2);
if (!args[0]) {
  console.error('❌ Uso: node scripts/compress-images.js <ruta-carpeta>');
  process.exit(1);
}

const inputDir = args[0];
if (!fs.existsSync(inputDir)) {
  console.error(`❌ Carpeta no encontrada: ${inputDir}`);
  process.exit(1);
}

const outputDir = path.join(inputDir, 'compressed');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const files = fs.readdirSync(inputDir).filter(file =>
  imageExtensions.includes(path.extname(file).toLowerCase())
);

if (files.length === 0) {
  console.warn('⚠️ No se encontraron imágenes en la carpeta');
  process.exit(0);
}

let processed = 0;
let totalOriginal = 0;
let totalCompressed = 0;

async function compressImage(file) {
  const inputPath = path.join(inputDir, file);
  const ext = path.extname(file).toLowerCase();
  const basename = path.basename(file, ext);
  const outputPath = path.join(outputDir, `${basename}.webp`);

  try {
    const inputStats = fs.statSync(inputPath);
    const inputSize = inputStats.size;
    totalOriginal += inputSize;

    // Comprimir a WebP (40% más pequeño que JPEG)
    await sharp(inputPath)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const outputStats = fs.statSync(outputPath);
    const outputSize = outputStats.size;
    totalCompressed += outputSize;

    const savedPercent = Math.round((1 - outputSize / inputSize) * 100);
    console.log(`✅ ${file} → ${Math.round(outputSize / 1024)}KB (ahorrado ${savedPercent}%)`);
    processed++;
  } catch (error) {
    console.error(`❌ Error al procesar ${file}:`, error.message);
  }
}

(async () => {
  console.log(`📦 Comprimiendo ${files.length} imágenes...\n`);

  for (const file of files) {
    await compressImage(file);
  }

  console.log(`\n✨ Listo! ${processed}/${files.length} imágenes comprimidas`);
  console.log(`📊 Espacio ahorrado: ${Math.round((1 - totalCompressed / totalOriginal) * 100)}%`);
  console.log(`📁 Carpeta de salida: ${outputDir}`);
  console.log('\n💡 Tip: Las imágenes comprimidas están listas para subir a Supabase');
})();
