import { Transaction } from "@/lib/types";
import { formatDate, formatTHB } from "@/lib/format";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
}

export default function TransactionList({
  transactions,
  onDelete,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-400">
        ยังไม่มีรายการ — เริ่มเพิ่มรายรับหรือรายจ่ายของคุณ
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
          <tr>
            <th className="px-4 py-3 font-medium">วันที่</th>
            <th className="px-4 py-3 font-medium">หมวดหมู่</th>
            <th className="px-4 py-3 font-medium">รายละเอียด</th>
            <th className="px-4 py-3 text-right font-medium">จำนวนเงิน</th>
            {onDelete && <th className="px-4 py-3"></th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr
              key={t.id}
              className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
            >
              <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                {formatDate(t.date)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    t.type === "income"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {t.category}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-600">{t.note || "-"}</td>
              <td
                className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${
                  t.type === "income" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {t.type === "income" ? "+" : "-"}
                {formatTHB(t.amount)}
              </td>
              {onDelete && (
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(t.id)}
                    className="text-zinc-400 transition-colors hover:text-rose-600"
                    aria-label="ลบรายการ"
                  >
                    ลบ
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
