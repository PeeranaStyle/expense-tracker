import { formatTHB } from "@/lib/format";

interface SummaryProps {
  income: number;
  expense: number;
}

export default function Summary({ income, expense }: SummaryProps) {
  const balance = income - expense;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-medium text-emerald-700">รายรับรวม</p>
        <p className="mt-1 text-2xl font-bold text-emerald-700">
          {formatTHB(income)}
        </p>
      </div>
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
        <p className="text-sm font-medium text-rose-700">รายจ่ายรวม</p>
        <p className="mt-1 text-2xl font-bold text-rose-700">
          {formatTHB(expense)}
        </p>
      </div>
      <div
        className={`rounded-xl border p-5 ${
          balance >= 0
            ? "border-sky-200 bg-sky-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <p
          className={`text-sm font-medium ${
            balance >= 0 ? "text-sky-700" : "text-amber-700"
          }`}
        >
          คงเหลือ
        </p>
        <p
          className={`mt-1 text-2xl font-bold ${
            balance >= 0 ? "text-sky-700" : "text-amber-700"
          }`}
        >
          {formatTHB(balance)}
        </p>
      </div>
    </div>
  );
}
