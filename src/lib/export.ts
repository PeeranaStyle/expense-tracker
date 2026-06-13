import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { Transaction } from "./types";
import { formatDate } from "./format";

function timestamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
}

const TYPE_LABEL: Record<Transaction["type"], string> = {
  income: "รายรับ",
  expense: "รายจ่าย",
};

/** Export transactions to an .xlsx file. */
export function exportToExcel(transactions: Transaction[]) {
  const rows = transactions.map((t) => ({
    วันที่: t.date,
    ประเภท: TYPE_LABEL[t.type],
    หมวดหมู่: t.category,
    รายละเอียด: t.note,
    จำนวนเงิน: t.type === "expense" ? -t.amount : t.amount,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 14 },
    { wch: 10 },
    { wch: 18 },
    { wch: 30 },
    { wch: 14 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "รายรับรายจ่าย");
  XLSX.writeFile(workbook, `transactions-${timestamp()}.xlsx`);
}

/**
 * Render a DOM element to a canvas. Used by both PDF and image export so that
 * Thai text renders correctly (avoids font-embedding issues in jsPDF).
 */
async function renderElement(element: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });
}

/** Export a DOM element as a PNG image. */
export async function exportElementToImage(element: HTMLElement) {
  const canvas = await renderElement(element);
  const link = document.createElement("a");
  link.download = `report-${timestamp()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/** Export a DOM element to a PDF (A4, fit to width). */
export async function exportElementToPDF(element: HTMLElement) {
  const canvas = await renderElement(element);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const usableWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * usableWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = margin;

  pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
  heightLeft -= pageHeight - margin * 2;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + margin;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;
  }

  pdf.save(`report-${timestamp()}.pdf`);
}

export { formatDate };
