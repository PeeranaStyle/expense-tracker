"use client";

import { useState } from "react";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  NewTransaction,
  TxType,
} from "@/lib/types";
import { todayISO } from "@/lib/format";

interface TransactionFormProps {
  onAdd: (tx: NewTransaction) => Promise<void>;
}

export default function TransactionForm({ onAdd }: TransactionFormProps) {
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function switchType(next: TxType) {
    setType(next);
    setCategory(
      (next === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[0]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = Number(amount);
    if (!amount || Number.isNaN(value) || value <= 0) {
      setError("กรุณากรอกจำนวนเงินที่มากกว่า 0");
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({ type, amount: value, category, note: note.trim(), date });
      setAmount("");
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-zinc-800">
        เพิ่มรายการ
      </h2>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => switchType("income")}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            type === "income"
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
          }`}
        >
          รายรับ
        </button>
        <button
          type="button"
          onClick={() => switchType("expense")}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            type === "expense"
              ? "border-rose-500 bg-rose-50 text-rose-700"
              : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
          }`}
        >
          รายจ่าย
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            จำนวนเงิน (บาท)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            หมวดหมู่
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            วันที่
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            รายละเอียด (ไม่บังคับ)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="เช่น ค่ากาแฟ"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500"
          />
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
        >
          {submitting ? "กำลังบันทึก..." : "บันทึกรายการ"}
        </button>
      </div>
    </form>
  );
}
