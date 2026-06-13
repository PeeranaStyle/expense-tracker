import {
  isSupabaseConfigured,
  supabase,
  TRANSACTIONS_TABLE,
} from "./supabase";
import { NewTransaction, Transaction } from "./types";

const LS_KEY = "expense-tracker-transactions";

/**
 * Data access layer for transactions.
 *
 * When Supabase is configured (NEXT_PUBLIC_SUPABASE_URL + ANON_KEY) it is used
 * as the backend. Otherwise the app falls back to browser localStorage so it
 * stays fully usable for local development and demos.
 */

function readLocal(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Transaction[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(list: Transaction[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function sortByDateDesc(list: Transaction[]): Transaction[] {
  return [...list].sort((a, b) => {
    if (a.date === b.date) {
      return (b.created_at ?? "").localeCompare(a.created_at ?? "");
    }
    return b.date.localeCompare(a.date);
  });
}

export async function fetchTransactions(): Promise<Transaction[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Transaction[];
  }
  return sortByDateDesc(readLocal());
}

export async function createTransaction(
  tx: NewTransaction
): Promise<Transaction> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .insert(tx)
      .select()
      .single();
    if (error) throw error;
    return data as Transaction;
  }
  const record: Transaction = {
    ...tx,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  const list = readLocal();
  list.push(record);
  writeLocal(list);
  return record;
}

export async function removeTransaction(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .delete()
      .eq("id", id);
    if (error) throw error;
    return;
  }
  writeLocal(readLocal().filter((t) => t.id !== id));
}
