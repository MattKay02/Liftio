// Generates lib/exerciseImages.ts from the WebP files in assets/exercises/.
// Must be run AFTER process-exercise-images.js.
// Run: node scripts/generate-exercise-image-map.js

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets/exercises');
const OUTPUT_FILE = path.join(__dirname, '../lib/exerciseImages.ts');

function main() {
  const files = fs.readdirSync(ASSETS_DIR).filter(f => f.endsWith('.webp'));

  // Group files by exercise key using regex: last -1.webp or -2.webp is the variant suffix
  // This correctly handles keys that contain -2 in their name (e.g. kneeling-triceps-extension-with-cable-2)
  const exerciseMap = {};

  for (const filename of files) {
    const match = filename.match(/^(.+)-([12])\.webp$/);
    if (!match) {
      console.warn(`Skipping unexpected filename: ${filename}`);
      continue;
    }
    const [, key, variant] = match;
    if (!exerciseMap[key]) {
      exerciseMap[key] = {};
    }
    exerciseMap[key][variant === '1' ? 'start' : 'end'] = filename;
  }

  // Sort keys alphabetically
  const sortedKeys = Object.keys(exerciseMap).sort();

  // Verify each key has both start and end
  let warnings = 0;
  for (const key of sortedKeys) {
    if (!exerciseMap[key].start || !exerciseMap[key].end) {
      console.warn(`Warning: ${key} is missing start or end image`);
      warnings++;
    }
  }

  // Generate TypeScript content
  const lines = [
    '// AUTO-GENERATED — do not edit manually.',
    '// Re-run: node scripts/generate-exercise-image-map.js',
    '',
    "export type ExerciseImageVariant = 'start' | 'end';",
    '',
    'export const exerciseImages: Record<string, Record<ExerciseImageVariant, number>> = {',
  ];

  for (const key of sortedKeys) {
    const { start, end } = exerciseMap[key];
    if (!start || !end) continue;
    lines.push(`  '${key}': {`);
    lines.push(`    start: require('../assets/exercises/${start}'),`);
    lines.push(`    end:   require('../assets/exercises/${end}'),`);
    lines.push(`  },`);
  }

  lines.push('};');
  lines.push('');
  lines.push('export const getExerciseImage = (');
  lines.push('  imageKey: string | null | undefined,');
  lines.push("  variant: ExerciseImageVariant = 'start'");
  lines.push('): number | null => {');
  lines.push('  if (!imageKey) return null;');
  lines.push('  return exerciseImages[imageKey]?.[variant] ?? null;');
  lines.push('};');
  lines.push('');

  fs.writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf8');

  console.log(`Generated ${OUTPUT_FILE}`);
  console.log(`Exercise keys: ${sortedKeys.length}`);
  console.log(`Warnings: ${warnings}`);
}

main();
