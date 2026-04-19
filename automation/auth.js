/**
 * automation/auth.js — multi-user prep, SaaS-ready.
 *
 * v0 keeps the existing single-tenant cookie gate (op_auth) as the default,
 * but adds:
 *   - Users store at memory/users.json (id, email, role, passHash, createdAt)
 *   - Lightweight token issue/verify (HMAC-SHA256, no JWT lib needed)
 *   - middleware()  : returns { ok, user } for a request
 *   - bootstrap()   : seeds the owner user on first run from OWNER_EMAIL/OPERATOR_PASSWORD
 *
 * Switch on multi-user mode by setting BOSS_MULTI_USER=1.
 */
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const cfg    = require('../config/boss.config');
const memory = require('../ai/memory');

const USERS_FILE = path.join(cfg.paths.memory, 'users.json');
const SECRET     = process.env.BOSS_AUTH_SECRET || process.env.OPERATOR_PASSWORD || 'change-me-in-env';
const MULTI      = process.env.BOSS_MULTI_USER === '1';

function readUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (_) { return { users: [] }; }
}
function writeUsers(data) {
  fs.mkdirSync(cfg.paths.memory, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

function hashPass(plain, salt) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const h = crypto.scryptSync(plain, s, 32).toString('hex');
  return `${s}:${h}`;
}
function verifyPass(plain, stored) {
  const [salt, h] = String(stored).split(':');
  return hashPass(plain, salt) === stored;
}

function issueToken(userId) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 14; // 14 days
  const payload = `${userId}.${exp}`;
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex').slice(0, 32);
  return `${payload}.${sig}`;
}
function verifyToken(tok) {
  if (!tok) return null;
  const [userId, expStr, sig] = String(tok).split('.');
  if (!userId || !expStr || !sig) return null;
  const expected = crypto.createHmac('sha256', SECRET).update(`${userId}.${expStr}`).digest('hex').slice(0, 32);
  if (expected !== sig) return null;
  if (Number(expStr) < Date.now()) return null;
  return { userId };
}

function bootstrap() {
  const data = readUsers();
  if (data.users.length) return;
  const email = process.env.OWNER_EMAIL || cfg.owner;
  const pass  = process.env.OPERATOR_PASSWORD || 'changeme';
  data.users.push({
    id: 'u_owner',
    email, role: 'owner',
    passHash: hashPass(pass),
    createdAt: new Date().toISOString(),
  });
  writeUsers(data);
  memory.logDecision('auth', `bootstrapped owner ${email}`);
}

function login(email, pass) {
  const data = readUsers();
  const u = data.users.find(x => x.email === email);
  if (!u) return { ok: false, error: 'no such user' };
  if (!verifyPass(pass, u.passHash)) return { ok: false, error: 'bad password' };
  return { ok: true, token: issueToken(u.id), user: { id: u.id, email: u.email, role: u.role } };
}

function middleware(req) {
  if (!MULTI) return { ok: true, user: { id: 'u_owner', role: 'owner' } };
  const cookie = req.headers.cookie || '';
  const m = cookie.match(/(?:^|;\s*)boss_token=([^;]+)/);
  const t = m && decodeURIComponent(m[1]);
  const v = verifyToken(t);
  if (!v) return { ok: false };
  const u = readUsers().users.find(x => x.id === v.userId);
  return u ? { ok: true, user: { id: u.id, email: u.email, role: u.role } } : { ok: false };
}

module.exports = { bootstrap, login, middleware, issueToken, verifyToken, readUsers, MULTI };
