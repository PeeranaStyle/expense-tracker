"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Summary from "@/components/Summary";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import ExportBar from "@/components/ExportBar";
import {
  createTransaction,
  fetchTransactions,
  removeTransaction,
} from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { NewTransaction, Transaction } from "@/lib/types";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState<string>("all");
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetchTransactions()
      .then((data) => {
        if (active) setTransactions(data);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ")
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function handleAdd(tx: NewTransaction) {
    const created = await createTransaction(tx);
    setTransactions((prev) =>
      [created, ...prev].sort((a, b) => b.date.localeCompare(a.date))
    );
  }

  async function handleDelete(id: string) {
    const prev = transactions;
    setTransactions((list) => list.filter((t) => t.id !== id));
    try {
      await removeTransaction(id);
    } catch {
      setTransactions(prev);
    }
  }

  const months = useMemo(() => {
    const set = new Set(transactions.map((t) => t.date.slice(0, 7)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filtered = useMemo(
    () =>
      month === "all"
        ? transactions
        : transactions.filter((t) => t.date.startsWith(month)),
    [transactions, month]
  );

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of filtered) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return { income, expense };
  }, [filtered]);

  return (
    <div className="min-h-full w-full bg-zinc-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">
            บันทึกรายรับ-รายจ่าย
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            จัดการเงินของคุณ และส่งออกรายงานเป็น Excel, PDF หรือรูปภาพ
          </p>
        </header>

        {!isSupabaseConfigured && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            ยังไม่ได้ตั้งค่า Supabase — กำลังใช้โหมดสาธิต (เก็บข้อมูลใน
            เบราว์เซอร์) ตั้งค่า <code>NEXT_PUBLIC_SUPABASE_URL</code> และ{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> เพื่อเชื่อมต่อฐานข้อมูล
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <TransactionForm onAdd={handleAdd} />
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-500"
              >
                <option value="all">ทุกเดือน</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ExportBar transactions={filtered} targetRef={reportRef} />
            </div>

            <div ref={reportRef} className="space-y-4 bg-zinc-50 p-1">
              <Summary income={totals.income} expense={totals.expense} />
              {loading ? (
                <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-zinc-400">
                  กำลังโหลด...
                </div>
              ) : error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
                  {error}
                </div>
              ) : (
                <TransactionList
                  transactions={filtered}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
