require('dotenv').config();
const express=require('express');
const cors=require('cors');
const helmet=require('helmet');
const rateLimit=require('express-rate-limit');
const db=require('./db');
const app=express();
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32){
  console.error('กรุณาตั้ง JWT_SECRET ในไฟล์ .env ให้มีความยาวอย่างน้อย 32 ตัวอักษร');
  process.exit(1);
}
app.use(helmet());
app.use(cors({origin:process.env.CLIENT_ORIGIN||'http://localhost:5173'}));
app.use(express.json({limit:'20kb'}));
app.use('/api/auth',rateLimit({windowMs:15*60*1000,max:30,standardHeaders:true,legacyHeaders:false}));
app.get('/api/health',async(req,res)=>{
  try{await db.query('SELECT 1');res.json({status:'ok',database:'connected'});}
  catch{res.status(503).json({status:'error',database:'unavailable'});}
});
app.use('/api/auth',require('./routes/auth'));
app.use('/api/transactions',require('./routes/transactions'));
app.use('/api/summary',require('./routes/summary'));
app.use('/api/budgets',require('./routes/budgets'));
app.use((req,res)=>res.status(404).json({message:'ไม่พบ API ที่เรียก'}));
app.use((err,req,res,next)=>{
  console.error(err);
  if(err.code==='ER_DUP_ENTRY') return res.status(409).json({message:'ข้อมูลนี้ซ้ำกัน'});
  res.status(500).json({message:'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่'});
});
const port=Number(process.env.PORT||4000);
app.listen(port,()=>console.log(`My Money API running at http://localhost:${port}`));
