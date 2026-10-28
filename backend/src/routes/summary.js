const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
router.use(auth);
function validMonth(m) { return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(m || '')); }
router.get('/', async (req,res,next) => {
  try {
    const month=String(req.query.month||'');
    if (!validMonth(month)) return res.status(400).json({message:'เดือนต้องอยู่ในรูปแบบ YYYY-MM'});
    const start=`${month}-01`;
    const [rows]=await db.execute(
      `SELECT type, COALESCE(SUM(amount),0) AS total FROM transactions
       WHERE user_id=? AND transaction_date>=? AND transaction_date<DATE_ADD(?,INTERVAL 1 MONTH) GROUP BY type`,
      [req.user.id,start,start]);
    const [cats]=await db.execute(
      `SELECT category, SUM(amount) AS total FROM transactions WHERE user_id=? AND type='expense'
       AND transaction_date>=? AND transaction_date<DATE_ADD(?,INTERVAL 1 MONTH)
       GROUP BY category ORDER BY total DESC LIMIT 6`,[req.user.id,start,start]);
    const totals={income:0,expense:0};
    rows.forEach(r=>{totals[r.type]=Number(r.total)});
    res.json({...totals,balance:totals.income-totals.expense,expenseByCategory:cats});
  } catch(e){next(e);}
});
module.exports=router;
