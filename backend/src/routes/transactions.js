const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
router.use(auth);

function validDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) && !Number.isNaN(Date.parse(s)); }
function validate(body) {
  const type = body.type;
  const amount = Number(body.amount);
  const category = String(body.category || '').trim();
  const note = String(body.note || '').trim();
  const date = String(body.transaction_date || '');
  if (!['income','expense'].includes(type)) return 'กรุณาเลือกประเภทรายการ';
  if (!Number.isFinite(amount) || amount <= 0 || amount > 9999999999) return 'จำนวนเงินต้องมากกว่า 0';
  if (!category || category.length > 80) return 'กรุณาระบุหมวดหมู่ไม่เกิน 80 ตัวอักษร';
  if (note.length > 255) return 'หมายเหตุต้องไม่เกิน 255 ตัวอักษร';
  if (!validDate(date)) return 'วันที่ไม่ถูกต้อง';
  return null;
}
router.get('/', async (req, res, next) => {
  try {
    const month = String(req.query.month || '');
    const search = String(req.query.search || '').trim().slice(0,100);
    if (!/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({message:'เดือนต้องอยู่ในรูปแบบ YYYY-MM'});
    const like = `%${search}%`;
    const [rows] = await db.execute(
      `SELECT id,type,amount,category,note,transaction_date,created_at
       FROM transactions WHERE user_id=? AND transaction_date >= ? AND transaction_date < DATE_ADD(?, INTERVAL 1 MONTH)
       AND (? = '' OR category LIKE ? OR COALESCE(note,'') LIKE ?)
       ORDER BY transaction_date DESC,id DESC`,
      [req.user.id, `${month}-01`, `${month}-01`, search, like, like]
    );
    res.json(rows);
  } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const error = validate(req.body); if (error) return res.status(400).json({message:error});
    const {type,amount,category,note,transaction_date} = req.body;
    const [r] = await db.execute('INSERT INTO transactions (user_id,type,amount,category,note,transaction_date) VALUES (?,?,?,?,?,?)',
      [req.user.id,type,Number(amount),String(category).trim(),String(note||'').trim()||null,transaction_date]);
    const [rows] = await db.execute('SELECT id,type,amount,category,note,transaction_date FROM transactions WHERE id=? AND user_id=?',[r.insertId,req.user.id]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try {
    const error = validate(req.body); if (error) return res.status(400).json({message:error});
    const {type,amount,category,note,transaction_date} = req.body;
    const [r] = await db.execute('UPDATE transactions SET type=?,amount=?,category=?,note=?,transaction_date=? WHERE id=? AND user_id=?',
      [type,Number(amount),String(category).trim(),String(note||'').trim()||null,transaction_date,req.params.id,req.user.id]);
    if (!r.affectedRows) return res.status(404).json({message:'ไม่พบรายการนี้'});
    const [rows] = await db.execute('SELECT id,type,amount,category,note,transaction_date FROM transactions WHERE id=? AND user_id=?',[req.params.id,req.user.id]);
    res.json(rows[0]);
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const [r] = await db.execute('DELETE FROM transactions WHERE id=? AND user_id=?',[req.params.id,req.user.id]);
    if (!r.affectedRows) return res.status(404).json({message:'ไม่พบรายการนี้'});
    res.json({message:'ลบรายการแล้ว'});
  } catch (e) { next(e); }
});
module.exports = router;
