# บันทึกรายรับ-รายจ่าย (Expense Tracker)

เว็ปแอปบันทึกรายรับ-รายจ่าย สร้างด้วย **Next.js + TypeScript + Tailwind CSS** ใช้ **Supabase** เป็นฐานข้อมูล และสามารถส่งออกรายงานเป็น **Excel, PDF และรูปภาพ** ได้

## ฟีเจอร์

- **ระบบผู้ใช้** — สมัคร/เข้าสู่ระบบด้วยอีเมล+รหัสผ่าน (Supabase Auth), เก็บ session อัตโนมัติ, แยกข้อมูลของแต่ละผู้ใช้ด้วย Row Level Security
- เพิ่ม / ลบ รายการรายรับและรายจ่าย พร้อมหมวดหมู่ วันที่ และรายละเอียด
- สรุปยอดรายรับรวม รายจ่ายรวม และยอดคงเหลือ
- กรองข้อมูลตามเดือน
- ส่งออกรายงาน:
  - **Excel** (`.xlsx`) — ผ่าน [SheetJS (xlsx)](https://sheetjs.com/)
  - **PDF** — เรนเดอร์รายงานเป็นรูปแล้วใส่ใน PDF (รองรับภาษาไทยเต็มรูปแบบ) ผ่าน [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas-pro](https://github.com/yorickshan/html2canvas-pro)
  - **รูปภาพ** (`.png`)
- ใช้ Supabase เป็นฐานข้อมูล โดยมี **โหมดสาธิต** ที่เก็บข้อมูลใน `localStorage` อัตโนมัติเมื่อยังไม่ได้ตั้งค่า Supabase

## เริ่มต้นใช้งาน

```bash
npm install
npm run dev
```

เปิด http://localhost:3000

> หากยังไม่ได้ตั้งค่า Supabase แอปจะทำงานในโหมดสาธิต โดยเก็บข้อมูลไว้ในเบราว์เซอร์

## ตั้งค่า Supabase

1. สร้างโปรเจคที่ [supabase.com](https://supabase.com)
2. รันสคริปต์ใน [`supabase/schema.sql`](supabase/schema.sql) ใน SQL Editor
3. คัดลอก `.env.local.example` เป็น `.env.local` แล้วใส่ค่าจาก Project Settings → API:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. (แนะนำ) ปิดการยืนยันอีเมลเพื่อให้สมัครได้ทันที: Authentication → Providers → Email → ปิด "Confirm email"
5. รีสตาร์ท dev server

> เมื่อตั้งค่า Supabase แล้ว แอปจะบังคับให้เข้าสู่ระบบก่อนใช้งาน และผู้ใช้แต่ละคนจะเห็นเฉพาะรายการของตัวเอง

## โครงสร้างโปรเจค

```
src/
  app/
    layout.tsx
    page.tsx          # หน้าหลัก รวม state ทั้งหมด
  components/
    Summary.tsx       # การ์ดสรุปยอด
    TransactionForm.tsx
    TransactionList.tsx
    ExportBar.tsx     # ปุ่มส่งออก Excel / PDF / รูปภาพ
    AuthForm.tsx      # หน้า login / register
  lib/
    supabase.ts       # Supabase client
    auth.tsx          # AuthProvider + useAuth (จัดการ session)
    store.ts          # data layer (Supabase หรือ localStorage)
    export.ts         # ฟังก์ชันส่งออก
    format.ts         # จัดรูปแบบเงิน/วันที่
    types.ts
supabase/
  schema.sql
```

## คำสั่ง

```bash
npm run dev     # โหมดพัฒนา
npm run build   # build สำหรับ production
npm run start   # รัน production build
npm run lint    # ตรวจ lint
```
