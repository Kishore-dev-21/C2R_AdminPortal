import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, Shield, GitCompare, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Database, Link2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fraudCases } from "@/data/mockData";
import { fraudComparisonData, FraudComparisonRecord } from "@/data/blockchainData";

const severityStyles: Record<string, string> = {
  Critical: "bg-destructive/20 text-destructive",
  High: "bg-warning/20 text-warning",
  Medium: "bg-info/20 text-info",
  Low: "bg-muted text-muted-foreground",
};

const statusStyles: Record<string, string> = {
  Flagged: "text-destructive",
  "Under Investigation": "text-warning",
  Escalated: "text-orange-500",
  Resolved: "text-success",
};

function shortHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ── Comparison Row ─────────────────────────────────────────────────────────

const ComparisonRow = ({ record }: { record: FraudComparisonRecord }) => {
  const [open, setOpen] = useState(false);
  const hasDiscrepancy = record.blockchainRecord.quantity !== record.databaseRecord.reportedQuantity;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-background hover:bg-accent/50 transition-colors text-left">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${severityStyles[record.severity]}`}>
            {record.severity}
          </span>
          <span className="text-xs font-medium text-foreground">{record.caseId}</span>
          <span className="text-xs text-muted-foreground">{record.fraudType}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{record.shop}, {record.district}</span>
          {hasDiscrepancy && (
            <span className="inline-flex items-center gap-1 text-[10px] text-destructive bg-destructive/10 px-2 py-0.5 rounded">
              <XCircle className="w-3 h-3" /> Mismatch Detected
            </span>
          )}
          {!hasDiscrepancy && (
            <span className="inline-flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3" /> Values Match
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-medium ${statusStyles[record.status] || "text-muted-foreground"}`}>
            {record.status}
          </span>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Blockchain Record */}
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-1.5 mb-3">
                <Link2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Blockchain Record (Immutable)</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-[10px] text-foreground">{record.blockchainRecord.transactionId}</span>
                <span className="text-muted-foreground">Batch ID</span>
                <span className="font-mono text-[10px]">{record.blockchainRecord.batchId}</span>
                <span className="text-muted-foreground">Commodity</span>
                <span>{record.blockchainRecord.commodity}</span>
                <span className="text-muted-foreground">Quantity</span>
                <span className={`font-semibold ${hasDiscrepancy ? "text-green-600 dark:text-green-400" : ""}`}>
                  {record.blockchainRecord.quantity} {record.blockchainRecord.unit}
                </span>
                <span className="text-muted-foreground">Timestamp</span>
                <span>{formatDate(record.blockchainRecord.timestamp)}</span>
                <span className="text-muted-foreground">Tx Hash</span>
                <span className="font-mono text-[10px]">{shortHash(record.blockchainRecord.hash)}</span>
              </div>
            </div>

            {/* Database Record */}
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-1.5 mb-3">
                <Database className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">Database Record (Operational)</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-[10px] text-foreground">{record.databaseRecord.orderId}</span>
                <span className="text-muted-foreground">Batch ID</span>
                <span className="text-muted-foreground italic text-[10px]">N/A (DB record)</span>
                <span className="text-muted-foreground">Commodity</span>
                <span>{record.databaseRecord.commodity}</span>
                <span className="text-muted-foreground">Reported Qty</span>
                <span className={`font-semibold ${hasDiscrepancy ? "text-destructive" : ""}`}>
                  {record.databaseRecord.reportedQuantity} {record.databaseRecord.unit}
                </span>
                <span className="text-muted-foreground">Recorded At</span>
                <span>{formatDate(record.databaseRecord.recordedAt)}</span>
                <span className="text-muted-foreground">Tx Hash</span>
                <span className="text-muted-foreground italic text-[10px]">Not applicable</span>
              </div>
            </div>
          </div>

          {/* Discrepancy Summary */}
          <div className={`px-4 py-3 border-t border-border text-xs ${hasDiscrepancy ? "bg-destructive/5" : "bg-green-500/5"}`}>
            <div className="flex items-start gap-2">
              {hasDiscrepancy
                ? <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                : <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              }
              <div>
                <span className={`font-medium ${hasDiscrepancy ? "text-destructive" : "text-green-700 dark:text-green-400"}`}>
                  AI Analysis:{" "}
                </span>
                <span className="text-muted-foreground">{record.discrepancy}</span>
              </div>
            </div>
            {hasDiscrepancy && (
              <div className="mt-2 flex items-center gap-4 ml-5 text-[11px]">
                <span className="text-muted-foreground">
                  Blockchain: <strong className="text-green-600 dark:text-green-400">{record.blockchainRecord.quantity} {record.blockchainRecord.unit}</strong>
                </span>
                <span className="text-muted-foreground">
                  Database: <strong className="text-destructive">{record.databaseRecord.reportedQuantity} {record.databaseRecord.unit}</strong>
                </span>
                <span className="text-destructive font-semibold">
                  Delta: {Math.abs(record.blockchainRecord.quantity - record.databaseRecord.reportedQuantity)} {record.blockchainRecord.unit} unaccounted
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────

const FraudPage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"cases" | "blockchain">("cases");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">{t("fraud.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("fraud.subtitle")}</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t("fraud.total_cases"), value: fraudCases.length, color: "text-foreground" },
          { label: t("fraud.critical"), value: fraudCases.filter(f => f.severity === "Critical").length, color: "text-destructive" },
          { label: t("fraud.under_investigation"), value: fraudCases.filter(f => f.status === "Under Investigation").length, color: "text-warning" },
          { label: t("fraud.resolved"), value: fraudCases.filter(f => f.status === "Resolved").length, color: "text-success" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="metric-card text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
            <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button onClick={() => setActiveTab("cases")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === "cases" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <AlertTriangle className="w-3.5 h-3.5" />
          {t("fraud.cases")}
        </button>
        <button onClick={() => setActiveTab("blockchain")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === "blockchain" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <GitCompare className="w-3.5 h-3.5" />
          Blockchain vs Database
        </button>
      </div>

      {activeTab === "cases" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="command-panel">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t("fraud.type")}</th>
                  <th>{t("common.district")}</th>
                  <th>{t("common.shop")}</th>
                  <th>{t("fraud.severity")}</th>
                  <th>{t("common.status")}</th>
                  <th>{t("fraud.progress")}</th>
                </tr>
              </thead>
              <tbody>
                {fraudCases.map(f => (
                  <tr key={f.id}>
                    <td className="font-mono text-xs">{f.id}</td>
                    <td className="text-xs">{f.type}</td>
                    <td>{f.district}</td>
                    <td>{f.shop}</td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${severityStyles[f.severity]}`}>
                        {f.severity}
                      </span>
                    </td>
                    <td className="text-xs">{f.status}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${f.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{f.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === "blockchain" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">AI-Detected Discrepancies</p>
              <p className="text-muted-foreground mt-0.5">
                The blockchain serves as an immutable audit trail. Each record below compares the
                authoritative blockchain entry against the operational database record.
                Any quantity mismatch indicates potential stock diversion, duplicate entry, or abnormal usage.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {fraudComparisonData.map((record, i) => (
              <motion.div key={record.caseId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}>
                <ComparisonRow record={record} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FraudPage;
