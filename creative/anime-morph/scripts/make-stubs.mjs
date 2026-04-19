/**
 * make-stubs.mjs — zero-dependency placeholder generator.
 * Creates valid 1×1 PNG stubs for each scene asset so Remotion
 * can load them without crashing during development.
 *
 * Run: node scripts/make-stubs.mjs
 *
 * Once you have real images, copy them into public/assets/ with matching names.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = join(__dirname, '..', 'public', 'assets');
mkdirSync(OUT_DIR, { recursive: true });

// Minimal valid 1×1 PNG bytes (PNG spec)
// IHDR: 1×1, 8-bit, RGB.  IDAT: one transparent pixel.  IEND.
function make1x1PNG(r, g, b) {
  // Pre-computed 1×1 solid-colour PNG (no zlib re-generation needed)
  // Using a known-good 1×1 transparent PNG base and tinting metadata only.
  // This is the canonical 68-byte 1×1 white PNG in hex:
  const hex =
    '89504e470d0a1a0a' + // PNG signature
    '0000000d49484452' + // IHDR chunk (13 bytes)
    '00000001'         + // width: 1
    '00000001'         + // height: 1
    '08020000'         + // 8-bit RGB, no interlace
    '0090' + '77' + '53' + // CRC (pre-computed for w=1 h=1 depth=8 type=2)
    // Replace with a known-good 1×1 colour PNG
    '00';

  // Use a pre-built minimal PNG: 1×1 pixel, RGBA, value set to given RGB
  // Below is a real 67-byte 1x1 PNG (Base64 decoded to Buffer)
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return Buffer.from(base64, 'base64');
}

const ASSETS = [
  'real', 'naruto', 'onepiece', 'dbz', 'bleach',
  'demonslayer', 'jjk', 'mha', 'sololeveling', 'final',
];

for (const name of ASSETS) {
  const outPath = join(OUT_DIR, `${name}.png`);
  writeFileSync(outPath, make1x1PNG(0, 0, 0));
  console.log(`✓  ${name}.png (stub)`);
}

console.log(`\n${ASSETS.length} stubs written to public/assets/`);
console.log('Replace each stub with your AI-generated 1920×1080 PNG.');
