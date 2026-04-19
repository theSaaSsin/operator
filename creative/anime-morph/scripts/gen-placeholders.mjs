/**
 * gen-placeholders.mjs
 * Generates 10 placeholder PNG files (1920×1080 solid-colour gradient)
 * for each scene so Remotion Studio renders without asset errors.
 *
 * Run once: node scripts/gen-placeholders.mjs
 *
 * Replace each file in public/assets/ with your actual AI-generated images.
 */
import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = join(__dirname, '..', 'public', 'assets');
mkdirSync(OUT_DIR, { recursive: true });

const ASSETS = [
  { file: 'real.png',         label: 'Real Joshua',              from: '#0a0a0f', to: '#1a1a2e', accent: '#4488ff' },
  { file: 'naruto.png',       label: 'Naruto Style',             from: '#ff6600', to: '#001a2e', accent: '#ff9900' },
  { file: 'onepiece.png',     label: 'One Piece Style',          from: '#002244', to: '#0077cc', accent: '#1de5ff' },
  { file: 'dbz.png',          label: 'Dragon Ball Z Style',      from: '#000000', to: '#ffffaa', accent: '#ffff00' },
  { file: 'bleach.png',       label: 'Bleach Style',             from: '#050510', to: '#1a0030', accent: '#8800ff' },
  { file: 'demonslayer.png',  label: 'Demon Slayer Style',       from: '#1a0000', to: '#660011', accent: '#ff1133' },
  { file: 'jjk.png',          label: 'Jujutsu Kaisen Style',     from: '#000000', to: '#0a1a0a', accent: '#00ff44' },
  { file: 'mha.png',          label: 'My Hero Academia Style',   from: '#001133', to: '#003388', accent: '#1155ff' },
  { file: 'sololeveling.png', label: 'Solo Leveling Style',      from: '#000000', to: '#110022', accent: '#aa00ff' },
  { file: 'final.png',        label: 'Final Multiverse Form',    from: '#000000', to: '#001a1a', accent: '#1de5ff' },
];

const W = 1920, H = 1080;

for (const asset of ASSETS) {
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');

  // Background gradient
  const bg = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, H * 0.9);
  bg.addColorStop(0, asset.from);
  bg.addColorStop(1, asset.to);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Silhouette placeholder (dark human shape)
  ctx.fillStyle = '#00000088';
  ctx.beginPath();
  // Head
  ctx.arc(W / 2, H * 0.3, 120, 0, Math.PI * 2);
  ctx.fill();
  // Body
  ctx.fillRect(W / 2 - 100, H * 0.42, 200, 360);
  // Aura glow
  const aura = ctx.createRadialGradient(W / 2, H * 0.55, 50, W / 2, H * 0.55, 340);
  aura.addColorStop(0, `${asset.accent}44`);
  aura.addColorStop(1, 'transparent');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.ellipse(W / 2, H * 0.55, 340, 480, 0, 0, Math.PI * 2);
  ctx.fill();

  // Label
  ctx.fillStyle = '#ffffff';
  ctx.font      = 'bold 56px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(asset.label, W / 2, H - 60);

  // Sub-label
  ctx.fillStyle = asset.accent;
  ctx.font      = '32px sans-serif';
  ctx.fillText('[ PLACEHOLDER — replace with AI image ]', W / 2, H - 20);

  writeFileSync(join(OUT_DIR, asset.file), canvas.toBuffer('image/png'));
  console.log(`✓  ${asset.file}`);
}

console.log('\nAll placeholders written to public/assets/');
console.log('Replace each file with your AI-generated character image.\n');
