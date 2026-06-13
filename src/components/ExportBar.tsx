"use client";

import { useState } from "react";
import { Transaction } from "@/lib/types";
import {
  exportElementToImage,
  exportElementToPDF,
  exportToExcel,
} from "@/lib/export";

interface ExportBarProps {
  transactions: Transaction[];
  targetRef: React.RefObject<HTMLDivElement | null>;
}

export default function ExportBar({ transactions, targetRef }: ExportBarProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const disabled = transactions.length === 0;

  async function withBusy(name: string, fn: () => void | Promise<void>) {
    setBusy(name);
    try {
      await fn();
    } catch (err) {
      console.error(err);
      alert("ส่งออกไม่สำเร็จ: " + (err instanceof Error ? err.message : ""));
    } finally {
      setBusy(null);
    }
  }

  const btn =
    "rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-40";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={disabled || busy !== null}
        onClick={() => withBusy("excel", () => exportToExcel(transactions))}
        className={btn}
      >
        {busy === "excel" ? "กำลังส่งออก..." : "ส่งออก Excel"}
      </button>
      <button
        type="button"
        disabled={disabled || busy !== null}
        onClick={() =>
          withBusy("pdf", async () => {
            if (targetRef.current)
              await exportElementToPDF(targetRef.current);
          })
        }
        className={btn}
      >
        {busy === "pdf" ? "กำลังส่งออก..." : "ส่งออก PDF"}
      </button>
      <button
        type="button"
        disabled={disabled || busy !== null}
        onClick={() =>
          withBusy("image", async () => {
            if (targetRef.current)
              await exportElementToImage(targetRef.current);
          })
        }
        className={btn}
      >
        {busy === "image" ? "กำลังส่งออก..." : "ส่งออกรูปภาพ"}
      </button>
    </div>
  );
}
