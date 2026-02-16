// Converts exercise PNGs from the everkinetic library to optimized WebP files.
// Run: node scripts/process-exercise-images.js
// Output: assets/exercises/<key>-1.webp and <key>-2.webp (504 files total)

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_DIR = 'C:/Projects/everkinetic-images/src/images-web';
const OUTPUT_DIR = path.join(__dirname, '../assets/exercises');

const SHARP_OPTIONS = {
  width: 600,
  height: 600,
  fit: 'inside',
  withoutEnlargement: true,
};
const WEBP_QUALITY = 80;

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SOURCE_DIR);

  // Only process -1.png and -2.png files (skip -3, -4)
  const validFiles = files.filter(f => /^.+-[12]\.png$/.test(f));
  const skippedFiles = files.filter(f => f.endsWith('.png') && !/^.+-[12]\.png$/.test(f));

  console.log(`Found ${files.length} total PNG files`);
  console.log(`Processing ${validFiles.length} files (-1 and -2 variants only)`);
  if (skippedFiles.length > 0) {
    console.log(`Skipping ${skippedFiles.length} extra variant files: ${skippedFiles.join(', ')}`);
  }

  let processed = 0;
  let errors = 0;

  for (const filename of validFiles) {
    const inputPath = path.join(SOURCE_DIR, filename);
    // Convert .png extension to .webp
    const outputFilename = filename.replace(/\.png$/, '.webp');
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    try {
      await sharp(inputPath)
        .resize(SHARP_OPTIONS)
        .webp({ quality: WEBP_QUALITY })
        .toFile(outputPath);
      processed++;
      if (processed % 50 === 0) {
        console.log(`Progress: ${processed}/${validFiles.length}`);
      }
    } catch (err) {
      console.error(`Error processing ${filename}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone! Processed: ${processed}, Errors: ${errors}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);

  // Verify output count
  const outputFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webp'));
  console.log(`WebP files in output: ${outputFiles.length} (expected: ${validFiles.length})`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
