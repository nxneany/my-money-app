# My Money — เว็บแอปรายรับ–รายจ่าย

เว็บแอปภาษาไทย เน้นมือถือ ใช้ React + Vite, Node.js + Express และ MySQL
มีสมัครสมาชิก/เข้าสู่ระบบ, สรุปยอดรายเดือน, เพิ่ม/แก้ไข/ลบรายการ, ค้นหา และงบประมาณรายเดือน

## สิ่งที่ต้องติดตั้ง
- Node.js 20 ขึ้นไป
- MySQL 8 ขึ้นไป (หรือ MariaDB รุ่นที่รองรับ)
- npm

## 1) สร้างฐานข้อมูล
เปิด MySQL client แล้วรันไฟล์ `database/schema.sql`:
```bash
mysql -u root -p < database/schema.sql
```
หากใช้ผู้ใช้ฐานข้อมูลอื่น ให้สร้างฐานข้อมูล `my_money` และกำหนดสิทธิ์ให้ผู้ใช้นั้นก่อน

## 2) ตั้งค่า Backend
```bash
cd backend
cp .env.example .env
```
แก้ `backend/.env` ให้ตรงกับเครื่องของคุณ โดยเฉพาะ DB_USER, DB_PASSWORD และ JWT_SECRET (ใช้ค่าสุ่มยาว ๆ)
จากนั้น:
```bash
npm install
npm run dev
```
API จะทำงานที่ `http://localhost:4000`

## 3) ตั้งค่า Frontend (เปิด terminal อีกหน้าต่าง)
```bash
cd frontend
npm install
npm run dev
```
เปิด URL ที่ Vite แสดง (โดยทั่วไป `http://localhost:5173`)

## ทดลองใช้งานบนมือถือ
- มือถือและคอมพิวเตอร์ต้องอยู่เครือข่าย Wi-Fi เดียวกัน
- แก้ `frontend/.env` โดยตั้ง `VITE_API_URL=http://IP-คอมพิวเตอร์ของคุณ:4000/api`
- รัน Vite ให้เข้าถึงจากเครือข่ายได้: `npm run dev -- --host 0.0.0.0`
- เปิด `http://IP-คอมพิวเตอร์ของคุณ:5173` บนมือถือ
- อนุญาต firewall เฉพาะเครือข่ายส่วนตัว หากจำเป็น

## API หลัก
- `POST /api/auth/register` สมัครสมาชิก
- `POST /api/auth/login` เข้าสู่ระบบ
- `GET /api/transactions?month=YYYY-MM&search=คำค้น`
- `POST /api/transactions` เพิ่มรายการ
- `PUT /api/transactions/:id` แก้ไขรายการ
- `DELETE /api/transactions/:id` ลบรายการ
- `GET /api/summary?month=YYYY-MM` สรุปยอดรายเดือน
- `GET /api/budgets?month=YYYY-MM` ดูงบประมาณ
- `PUT /api/budgets` บันทึกงบประมาณ

## หมายเหตุ
- ข้อมูลรายการและงบประมาณแยกตามบัญชีผู้ใช้
- รหัสผ่านถูกแฮชด้วย bcrypt; token ถูกเก็บใน localStorage เพื่อให้เริ่มต้นใช้งานง่าย
- สำหรับ production ควรใช้ HTTPS, ตั้ง CORS ให้เป็นโดเมนจริง, เก็บ JWT secret ใน secret manager,
  เพิ่ม rate limiting และพิจารณาใช้ HttpOnly secure cookies แทน localStorage
- ข้อมูลในแอปเป็นข้อมูลจริงที่บันทึกลง MySQL ไม่ใช่ข้อมูลตัวอย่าง
"# my-money-app" 
