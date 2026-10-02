// Load an offer pack's messages into the Operator outreach queue as PENDING drafts (nothing is sent: you approve
// each one in the Outreach tab, then send it yourself). Safe to run twice: drafts already queued are skipped.
// Usage: node tools/load-offer.js offers/virtual-director.json https://your-site.vercel.app
const fs = require('fs');
const path = require('path');

const [file, siteUrl] = process.argv.slice(2);
if (!file || !siteUrl) {
  console.error('Usage: node tools/load-offer.js <offer.json> <site url>');
  process.exit(1);
}
const offer = JSON.parse(fs.readFileSync(file, 'utf8'));
const dataDir = path.join(__dirname, '..', 'data');
const queueFile = path.join(dataDir, 'outreach_queue.json');
fs.mkdirSync(dataDir, { recursive: true });
const db = fs.existsSync(queueFile) ? JSON.parse(fs.readFileSync(queueFile, 'utf8')) : { queue: [] };
db.queue = db.queue || [];

let added = 0;
for (const [i, m] of offer.messages.entries()) {
  const message = m.message.replaceAll('{{SITE_URL}}', siteUrl.replace(/\/$/, ''));
  if (db.queue.some((q) => q.clientName === offer.offer && q.label === m.label)) continue;
  db.queue.push({ id: Date.now() + i, clientName: offer.offer, niche: m.niche, label: m.label, message, status: 'pending', createdAt: new Date().toISOString() });
  added++;
}
fs.writeFileSync(queueFile, JSON.stringify(db, null, 2));
console.log(`${added} draft(s) added to the outreach queue as pending. Open Operator → Outreach to review and approve.`);
console.log('Lead sources to work from:');
for (const s of offer.leadSources) console.log(`  - ${s.where}: ${s.query}`);
