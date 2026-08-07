"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Summary from "@/components/Summary";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import ExportBar from "@/components/ExportBar";
import AuthForm from "@/components/AuthForm";
import {
  createTransaction,
  fetchTransactions,
  removeTransaction,
} from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { NewTransaction, Transaction } from "@/lib/types";

export default function Home() {
  const { authEnabled, session, user, loading: authLoading, signOut } =
    useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState<string>("all");
  const reportRef = useRef<HTMLDivElement>(null);

  const userId = user?.id;

  useEffect(() => {
    let active = true;
    async function load() {
      if (authEnabled && !userId) {
        if (active) {
          setTransactions([]);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTransactions();
        if (active) setTransactions(data);
      } catch (err) {
        if (active)
          setError(
            err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ"
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [authEnabled, userId]);

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

  if (authEnabled && authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-400">
        กำลังโหลด...
      </div>
    );
  }

  if (authEnabled && !session) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-full w-full bg-zinc-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              บันทึกรายรับ-รายจ่าย
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              จัดการเงินของคุณ และส่งออกรายงานเป็น Excel, PDF หรือรูปภาพ
            </p>
          </div>
          {authEnabled && user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500">{user.email}</span>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                ออกจากระบบ
              </button>
            </div>
          )}
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
