// Optimizes source food photos into web-ready textures at public/images/.
// - Resizes to max 1024px (long edge), JPEG q72, sRGB — ~150-300KB each.
// - Renames Unsplash filenames to stable slugs used by src/data/menu.js.
// - Skips outputs newer than their source (fast re-runs).
// Sources: project/restaurant/images (canonical) with fallback to images/.
// Runs automatically via npm `predev` / `prebuild` (see package.json).
import sharp from 'sharp';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'images');
mkdirSync(outDir, { recursive: true });

const SRC_DIRS = [join(root, 'project', 'restaurant', 'images'), join(root, 'images')];

// slug -> source filename (exact names on disk, spaces/parens included)
const PHOTOS = {
  'margherita-pizza': 'chad-montano-MqT0asuoIcU-unsplash (1).jpg',
  'pepperoni-pizza': 'ivan-torres-MQUqbmszGGM-unsplash.jpg',
  'smash-burger': 'jonathan-borba-8l8Yl2ruUsg-unsplash.jpg',
  'cheese-burger': 'amirali-mirhashemian-jh5XyK4Rr3Y-unsplash.jpg',
  'bacon-burger': 'david-foodphototasty-E94j3rMcxlw-unsplash.jpg',
  'swiss-burger': 'amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg',
  'alfredo-pasta': 'aleksandra-tanasiienko-0y6eMd8vevA-unsplash.jpg',
  'arrabbiata-pasta': 'ben-lei-flFd8L7_B3g-unsplash.jpg',
  'bbq-platter': 'victoria-shes-UC0HZdUitWY-unsplash (1).jpg',
  'garden-bowl': 'dan-gold-4_jhDO54BYg-unsplash.jpg',
};

function findSource(name) {
  for (const dir of SRC_DIRS) {
    const p = join(dir, name);
    if (existsSync(p)) return p;
  }
  return null;
}

let done = 0, skipped = 0, missing = 0;
for (const [slug, file] of Object.entries(PHOTOS)) {
  const src = findSource(file);
  const out = join(outDir, `${slug}.jpg`);
  if (!src) { console.warn(`[photos] MISSING source for ${slug}: ${file}`); missing++; continue; }
  if (existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs) { skipped++; continue; }
  await sharp(src).rotate().resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true }).toFile(out);
  done++;
  console.log(`[photos] ${slug}.jpg`);
}
console.log(`[photos] done=${done} skipped=${skipped} missing=${missing}`);
if (missing > 0) process.exitCode = 1;
