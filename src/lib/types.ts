export type TxType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  note: string;
  date: string; // YYYY-MM-DD
  created_at?: string;
  user_id?: string;
}

export type NewTransaction = Omit<
  Transaction,
  "id" | "created_at" | "user_id"
>;

export const INCOME_CATEGORIES = [
  "เงินเดือน",
  "โบนัส",
  "ขายของ",
  "ดอกเบี้ย",
  "ของขวัญ",
  "อื่นๆ",
];

export const EXPENSE_CATEGORIES = [
  "อาหาร",
  "เดินทาง",
  "ที่พัก",
  "ช้อปปิ้ง",
  "บิล/ค่าน้ำค่าไฟ",
  "สุขภาพ",
  "บันเทิง",
  "อื่นๆ",
];
