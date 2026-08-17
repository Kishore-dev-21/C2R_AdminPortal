/**
 * auditExportService
 * Generates professional PDF, CSV, and JSON audit reports
 * for the Click2Ration blockchain audit trail.
 *
 * PDF uses jsPDF + jspdf-autotable (browser-native, no server required).
 * No PII is ever included — only transfer records and hashes.
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Block } from "./blockchainService";
import { AuditReport } from "./blockchainService";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ExportData {
  report: AuditReport;
  blocks: Block[];
  verifyResult?: {
    valid: boolean;
    checkedBlocks: number;
    tamperedBlocks: Array<{ blockNumber?: number; index?: number }>;
    verifiedAt: string;
  } | null;
  generatedBy?: string;
}

// ── Shared helpers ─────────────────────────────────────────────────────────

const TRANSFER_LABELS: Record<string, string> = {
  WAREHOUSE_TO_DISTRICT: "Warehouse → District",
  DISTRICT_TO_SHOP: "District → Shop",
  INVENTORY_MOVEMENT: "Inventory Movement",
  FRAUD_LOG: "Fraud Log",
  DELIVERY_PROOF: "Delivery Proof",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function shortHash(h: string): string {
  if (!h || h.length < 14) return h ?? "—";
  return `${h.slice(0, 10)}...${h.slice(-8)}`;
}

function getBlockRow(block: Block): string[] {
  const p = block.payload as any;
  const isFraud = block.transferType === "FRAUD_LOG";
  return [
    String(block.index),
    block.transactionId,
    isFraud ? (p.caseId ?? "—") : (p.batchId ?? "—"),
    isFraud ? (p.fraudType ?? "—") : (p.commodity ?? "—"),
    isFraud ? "—" : `${p.quantity ?? ""} ${p.unit ?? ""}`.trim(),
    isFraud ? (p.district ?? "—") : (p.source ?? "—"),
    isFraud ? (p.shop ?? "—") : (p.destination ?? "—"),
    TRANSFER_LABELS[block.transferType] ?? block.transferType,
    fmtDate(block.timestamp),
    shortHash(block.hash),
    block.verificationStatus,
  ];
}

// ── PDF Export ─────────────────────────────────────────────────────────────

export function exportPDF(data: ExportData): void {
  const { report, blocks, verifyResult, generatedBy } = data;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // ── Colour palette ──
  const NAVY   = [15,  23,  42]  as [number, number, number];
  const GREEN  = [22, 163, 74]   as [number, number, number];
  const RED    = [220, 38,  38]  as [number, number, number];
  const AMBER  = [217, 119,  6]  as [number, number, number];
  const GREY   = [100, 116, 139] as [number, number, number];
  const LGREY  = [241, 245, 249] as [number, number, number];
  const WHITE  = [255, 255, 255] as [number, number, number];

  // ── Header banner ──────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 22, "F");

  // Logo text (no image dependency)
  doc.setTextColor(...WHITE);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Click2Ration", 14, 10);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("National Public Distribution System", 14, 15);
  doc.text("Government of India  ·  Ministry of Consumer Affairs", 14, 19);

  // Report title (right-aligned)
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("BLOCKCHAIN AUDIT REPORT", pageW - 14, 10, { align: "right" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${fmtDate(report.generatedAt)}`, pageW - 14, 15, { align: "right" });
  if (generatedBy) doc.text(`By: ${generatedBy}`, pageW - 14, 19, { align: "right" });

  let y = 28;

  // ── Chain Integrity Banner ─────────────────────────────────────────────
  const chainValid = verifyResult?.valid ?? report.chainValid;
  const bannerColor = chainValid ? GREEN : RED;
  doc.setFillColor(...bannerColor);
  doc.roundedRect(14, y, pageW - 28, 12, 2, 2, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const chainLabel = chainValid
    ? `[PASSED] CHAIN INTEGRITY VERIFIED - All ${verifyResult?.checkedBlocks ?? report.chainLength} blocks are cryptographically intact`
    : `[FAILED] CHAIN INTEGRITY FAILED - Tampering detected in ${verifyResult?.tamperedBlocks?.length ?? 0} block(s)`;
  doc.text(chainLabel, pageW / 2, y + 7.5, { align: "center" });

  // If tampered, list blocks
  if (!chainValid && verifyResult?.tamperedBlocks?.length) {
    y += 14;
    doc.setFillColor(...RED);
    doc.setFontSize(7);
    doc.setTextColor(...WHITE);
    const tList = verifyResult.tamperedBlocks.map(t => `#${t.blockNumber ?? t.index}`).join(", ");
    doc.text(`Tampered blocks: ${tList}`, 14, y + 4);
    y += 8;
  } else {
    y += 14;
  }

  // ── Summary Statistics ─────────────────────────────────────────────────
  y += 2;
  doc.setTextColor(...NAVY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("CHAIN STATISTICS", 14, y);
  y += 4;

  const stats = report.stats;
  const statItems = [
    { label: "Total Blocks on Chain", value: String(stats.totalBlocks), color: NAVY },
    { label: "Stock Transfers",       value: String(stats.totalTransfers), color: [37, 99, 235] as [number,number,number] },
    { label: "Fraud Logs",            value: String(stats.fraudLogs), color: RED },
    { label: "WH → District",         value: String(stats.warehouseToDistrict), color: AMBER },
    { label: "District → Shop",       value: String(stats.districtToShop), color: GREEN },
    { label: "Inventory Moves",       value: String(stats.inventoryMovements), color: [124, 58, 237] as [number,number,number] },
  ];

  const boxW = (pageW - 28 - 10) / 6;
  statItems.forEach((s, i) => {
    const bx = 14 + i * (boxW + 2);
    doc.setFillColor(...LGREY);
    doc.roundedRect(bx, y, boxW, 16, 1.5, 1.5, "F");
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...s.color);
    doc.text(s.value, bx + boxW / 2, y + 9, { align: "center" });
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GREY);
    doc.text(s.label, bx + boxW / 2, y + 14, { align: "center" });
  });

  y += 22;

  // ── Recent Blockchain Transactions table ──────────────────────────────
  doc.setTextColor(...NAVY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("RECENT BLOCKCHAIN TRANSACTIONS", 14, y);
  y += 2;

  const displayBlocks = blocks.filter(b => b.index > 0).slice(0, 20);
  const tableRows = displayBlocks.map(getBlockRow);

  autoTable(doc, {
    startY: y,
    head: [["#", "Transaction ID", "Batch / Case ID", "Commodity / Type", "Qty", "Source", "Destination", "Transfer Type", "Timestamp", "Hash", "Status"]],
    body: tableRows,
    styles: {
      fontSize: 6,
      cellPadding: 1.5,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 6.5,
    },
    alternateRowStyles: { fillColor: LGREY },
    columnStyles: {
      0:  { cellWidth: 8,  halign: "center" },
      1:  { cellWidth: 38, font: "courier", fontSize: 5.5 },
      2:  { cellWidth: 26, font: "courier", fontSize: 5.5 },
      3:  { cellWidth: 20 },
      4:  { cellWidth: 14, halign: "right" },
      5:  { cellWidth: 30 },
      6:  { cellWidth: 30 },
      7:  { cellWidth: 24 },
      8:  { cellWidth: 24 },
      9:  { cellWidth: 30, font: "courier", fontSize: 5 },
      10: { cellWidth: 16, halign: "center" },
    },
    didParseCell(hookData) {
      const col = hookData.column.index;
      const val = hookData.cell.raw as string;
      if (col === 10) {
        if (val === "VERIFIED")  hookData.cell.styles.textColor = GREEN;
        if (val === "TAMPERED")  hookData.cell.styles.textColor = RED;
        if (val === "PENDING")   hookData.cell.styles.textColor = AMBER;
      }
      if (col === 7 && val.includes("Fraud")) {
        hookData.cell.styles.textColor = RED;
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ── Tampering Alerts section (only if issues found) ────────────────────
  if (verifyResult && !verifyResult.valid && verifyResult.tamperedBlocks.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY ?? y + 40;
    let alertY = finalY + 8;

    // Check if we need a new page
    if (alertY + 30 > pageH - 14) {
      doc.addPage();
      alertY = 14;
    }

    doc.setTextColor(...RED);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("TAMPERING ALERTS", 14, alertY);
    alertY += 3;

    const alertRows = verifyResult.tamperedBlocks.map(t => [
      String(t.blockNumber ?? t.index ?? "?"),
      "Hash mismatch — block may have been modified after recording",
      fmtDate(verifyResult.verifiedAt),
    ]);
    autoTable(doc, {
      startY: alertY,
      head: [["Block #", "Alert Description", "Detected At"]],
      body: alertRows,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: RED, textColor: WHITE, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [255, 240, 240] },
      margin: { left: 14, right: 14 },
    });
  }

  // ── Footer on every page ───────────────────────────────────────────────
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let pg = 1; pg <= totalPages; pg++) {
    doc.setPage(pg);
    doc.setFillColor(...LGREY);
    doc.rect(0, pageH - 8, pageW, 8, "F");
    doc.setFontSize(6);
    doc.setTextColor(...GREY);
    doc.text("Click2Ration · National PDS Blockchain Audit System · Government of India", 14, pageH - 3);
    doc.text(`CONFIDENTIAL — For Official Use Only  ·  Page ${pg} of ${totalPages}`, pageW - 14, pageH - 3, { align: "right" });
  }

  // ── Save ───────────────────────────────────────────────────────────────
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`click2ration-blockchain-audit-${dateStr}.pdf`);
}

// ── CSV Export ─────────────────────────────────────────────────────────────

export function exportCSV(blocks: Block[]): void {
  const headers = [
    "Block#", "Transaction ID", "Batch ID", "Commodity",
    "Quantity", "Unit", "Source", "Destination",
    "Transfer Type", "Timestamp", "Hash (truncated)", "Verification Status",
  ];

  const rows = blocks
    .filter(b => b.index > 0)
    .map(block => {
      const p = block.payload as any;
      const isFraud = block.transferType === "FRAUD_LOG";
      return [
        block.index,
        block.transactionId,
        isFraud ? (p.caseId ?? "") : (p.batchId ?? ""),
        isFraud ? (p.fraudType ?? "") : (p.commodity ?? ""),
        isFraud ? "" : (p.quantity ?? ""),
        isFraud ? "" : (p.unit ?? ""),
        isFraud ? (p.district ?? "") : (p.source ?? ""),
        isFraud ? (p.shop ?? "") : (p.destination ?? ""),
        block.transferType,
        block.timestamp,
        shortHash(block.hash),
        block.verificationStatus,
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `click2ration-blockchain-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── JSON Export ────────────────────────────────────────────────────────────

export function exportJSON(report: AuditReport): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `click2ration-blockchain-audit-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
