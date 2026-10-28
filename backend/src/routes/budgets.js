const router=require('express').Router();
const db=require('../db');
const auth=require('../middleware/auth');
router.use(auth);
const validMonth=m=>/^\d{4}-(0[1-9]|1[0-2])$/.test(String(m||''));
router.get('/',async(req,res,next)=>{
  try{
    const month=String(req.query.month||'');
    if(!validMonth(month)) return res.status(400).json({message:'เดือนต้องอยู่ในรูปแบบ YYYY-MM'});
    const [rows]=await db.execute('SELECT amount FROM budgets WHERE user_id=? AND month=?',[req.user.id,month]);
    res.json({month,amount:rows.length?Number(rows[0].amount):0});
  }catch(e){next(e);}
});
router.put('/',async(req,res,next)=>{
  try{
    const month=String(req.body.month||''),amount=Number(req.body.amount);
    if(!validMonth(month)) return res.status(400).json({message:'เดือนต้องอยู่ในรูปแบบ YYYY-MM'});
    if(!Number.isFinite(amount)||amount<0||amount>9999999999) return res.status(400).json({message:'งบประมาณต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป'});
    await db.execute(`INSERT INTO budgets(user_id,month,amount) VALUES(?,?,?)
      ON DUPLICATE KEY UPDATE amount=VALUES(amount)`,[req.user.id,month,amount]);
    res.json({month,amount});
  }catch(e){next(e);}
});
module.exports=router;
