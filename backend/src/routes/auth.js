const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

function makeToken(user) {
  return jwt.sign({ name: user.name, email: user.email }, process.env.JWT_SECRET, {
    subject: String(user.id), expiresIn: '7d'
  });
}
router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || name.length > 100) return res.status(400).json({ message: 'ชื่อควรมี 2–100 ตัวอักษร' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 190) return res.status(400).json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' });
    if (password.length < 8) return res.status(400).json({ message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' });
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ message: 'อีเมลนี้สมัครสมาชิกแล้ว' });
    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.execute('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)', [name,email,hash]);
    const user = { id: result.insertId, name, email };
    res.status(201).json({ token: makeToken(user), user });
  } catch (e) { next(e); }
});
router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const [rows] = await db.execute('SELECT id,name,email,password_hash FROM users WHERE email = ?', [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }
    const user = { id: rows[0].id, name: rows[0].name, email: rows[0].email };
    res.json({ token: makeToken(user), user });
  } catch (e) { next(e); }
});
module.exports = router;
