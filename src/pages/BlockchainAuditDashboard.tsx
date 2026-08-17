import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Link2, CheckCircle2, XCircle, Clock, Database,
  ArrowRightLeft, Warehouse, Store, AlertTriangle, Search,
  RefreshCw, Download, Filter, Hash, Activity, Wifi, WifiOff,
  FileText, FileJson, FileSpreadsheet, ChevronDown
} from "lucide-react";
import { blockchainApiService } from "@/services/blockchainApiService";
import { Block, TransferType, AuditReport } from "@/services/blockchainService";
import { useAuth } from "@/contexts/AuthContext";
import { exportPDF, exportCSV, exportJSON } from "@/services/auditExportService";

// ── Constants ──────────────────────────────────────────────────────────────

const TRANSFER_LABELS: Record<string, string> = {
  WAREHOUSE_TO_DISTRICT: "Warehouse → District",
  DISTRICT_TO_SHOP: "District → Shop",
  INVENTORY_MOVEMENT: "Inventory Movement",
  FRAUD_LOG: "Fraud Log",
  DELIVERY_PROOF: "Delivery Proof",
};

const TRANSFER_COLORS: Record<string, string> = {
  WAREHOUSE_TO_DISTRICT: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  DISTRICT_TO_SHOP: "bg-green-500/15 text-green-600 dark:text-green-400",
  INVENTORY_MOVEMENT: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  FRAUD_LOG: "bg-destructive/15 text-destructive",
  DELIVERY_PROOF: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
};

const TRANSFER_ICONS: Record<string, React.ElementType> = {
  WAREHOUSE_TO_DISTRICT: Warehouse,
  DISTRICT_TO_SHOP: Store,
  INVENTORY_MOVEMENT: ArrowRightLeft,
  FRAUD_LOG: AlertTriangle,
  DELIVERY_PROOF: CheckCircle2,
};

const COMMODITIES = ["Rice", "Wheat", "Sugar", "Cooking Oil", "Kerosene", "Salt"];
const SOURCES = [
  "Central Chennai Warehouse", "Madurai Storage Hub",
  "Coimbatore Food Depot", "Salem Grain Storage",
  "Chennai District", "Madurai District", "Coimbatore District", "Salem District",
];
const DESTINATIONS = [
  "Chennai District", "Madurai District", "Coimbatore District", "Salem District",
  "Anna Nagar FPS", "KK Nagar FPS", "T Nagar FPS",
  "Madurai Main FPS", "Coimbatore Central FPS", "Salem Market FPS",
];

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function shortHash(hash: string) {
  if (!hash || hash.length < 14) return hash ?? "—";
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function getPayloadSummary(block: Block) {
  const p = block.payload as any;
  if (block.transferType === "FRAUD_LOG") {
    return { source: p.district || "—", destination: p.shop || "—" };
  }
  return {
    batchId: p.batchId,
    commodity: p.commodity,
    quantity: `${p.quantity} ${p.unit}`,
    source: p.source,
    destination: p.destination,
  };
}

const defaultForm = {
  batchId: "", commodity: "Rice", quantity: "",
  unit: "kg", source: SOURCES[0], destination: DESTINATIONS[0],
  transferType: "WAREHOUSE_TO_DISTRICT" as TransferType,
};

// ── Main Component ─────────────────────────────────────────────────────────

const BlockchainAuditDashboard = () => {
  const { user } = useAuth();

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [stats, setStats] = useState({
    totalBlocks: 0, totalTransfers: 0, fraudLogs: 0,
    warehouseToDistrict: 0, districtToShop: 0, inventoryMovements: 0, deliveryProofs: 0,
  });
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean; checkedBlocks: number; tamperedBlocks: any[]; verifiedAt: string;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [searchTx, setSearchTx] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"history" | "add">("history");
  const [loading, setLoading] = useState(true);
  const [apiMode, setApiMode] = useState<"real" | "mock" | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [cachedReport, setCachedReport] = useState<AuditReport | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close export dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    const [blocksData, statsData] = await Promise.all([
      blockchainApiService.getHistory(50),
      blockchainApiService.getStats(),
    ]);
    setBlocks(blocksData);
    setStats(statsData);
    setApiMode(blockchainApiService.mode);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleVerifyChain = async () => {
    setVerifying(true);
    const result = await blockchainApiService.verifyChain();
    setVerifyResult(result);
    setVerifying(false);
  };

  const handleSearchTx = async () => {
    if (!searchTx.trim()) return;
    const result = await blockchainApiService.verifyTransaction(searchTx.trim());
    setSearchResult(result);
  };

  const filtered = filterType === "ALL" ? blocks : blocks.filter(b => b.transferType === filterType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.batchId.trim() || !form.quantity.trim()) return;
    setSubmitting(true);
    const block = await blockchainApiService.recordStockTransfer({
      batchId: form.batchId.trim(),
      commodity: form.commodity,
      quantity: Number(form.quantity),
      unit: form.unit,
      source: form.source,
      destination: form.destination,
      authorizedBy: user?.role || "SUPER_ADMIN",
      transferType: form.transferType,
    });
    if (block) {
      await reload();
      setSubmitMsg(`Block #${block.index} recorded. TX: ${block.transactionId}`);
      setForm(defaultForm);
      setActiveTab("history");
      setTimeout(() => setSubmitMsg(null), 5000);
    }
    setSubmitting(false);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    setExportOpen(false);
    const report = cachedReport ?? await blockchainApiService.getAuditReport();
    setCachedReport(report);
    exportPDF({
      report,
      blocks,
      verifyResult,
      generatedBy: user?.role,
    });
    setExporting(false);
  };

  const handleExportCSV = () => {
    setExportOpen(false);
    exportCSV(blocks);
  };

  const handleExportJSON = async () => {
    setExporting(true);
    setExportOpen(false);
    const report = cachedReport ?? await blockchainApiService.getAuditReport();
    setCachedReport(report);
    exportJSON(report);
    setExporting(false);
  };

  const statCards = [
    { label: "Total Blocks", value: stats.totalBlocks, icon: Link2, color: "text-primary" },
    { label: "Stock Transfers", value: stats.totalTransfers, icon: ArrowRightLeft, color: "text-blue-500" },
    { label: "Fraud Logs", value: stats.fraudLogs, icon: AlertTriangle, color: "text-destructive" },
    { label: "WH → District", value: stats.warehouseToDistrict, icon: Warehouse, color: "text-amber-500" },
    { label: "District → Shop", value: stats.districtToShop, icon: Store, color: "text-green-500" },
    { label: "Inv. Moves", value: stats.inventoryMovements, icon: Activity, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Blockchain Audit Dashboard</h2>
            {apiMode && (
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${apiMode === "real" ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                {apiMode === "real" ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                {apiMode === "real" ? "Live API" : "Mock Mode"}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Permissioned audit chain — immutable PDS stock transfer records
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {submitMsg && (
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1.5 rounded-md">
              {submitMsg}
            </span>
          )}
          <button onClick={handleVerifyChain} disabled={verifying}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border bg-background hover:bg-accent transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${verifying ? "animate-spin" : ""}`} />
            {verifying ? "Verifying..." : "Verify Chain"}
          </button>

          {/* Export Dropdown */}
          <div ref={exportRef} className="relative">
            <button
              onClick={() => setExportOpen(o => !o)}
              disabled={exporting}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Download className="w-3.5 h-3.5" />
              {exporting ? "Exporting..." : "Export Report"}
              <ChevronDown className={`w-3 h-3 transition-transform ${exportOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {exportOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1.5 w-52 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Export Audit Report</p>
                  </div>
                  <div className="p-1">
                    <button onClick={handleExportPDF}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs hover:bg-accent transition-colors text-left group">
                      <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
                        <FileText className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Download PDF</p>
                        <p className="text-[10px] text-muted-foreground">Professional audit report</p>
                      </div>
                    </button>
                    <button onClick={handleExportCSV}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs hover:bg-accent transition-colors text-left group">
                      <div className="w-6 h-6 rounded bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Download CSV</p>
                        <p className="text-[10px] text-muted-foreground">Spreadsheet format</p>
                      </div>
                    </button>
                    <button onClick={handleExportJSON}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs hover:bg-accent transition-colors text-left group">
                      <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                        <FileJson className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Download JSON</p>
                        <p className="text-[10px] text-muted-foreground">Raw data for developers</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Chain Verification Banner */}
      {verifyResult && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={`flex items-start gap-2 px-4 py-2.5 rounded-md text-sm font-medium ${verifyResult.valid ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
          {verifyResult.valid ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />}
          <div>
            {verifyResult.valid
              ? `Chain integrity verified — all ${verifyResult.checkedBlocks} blocks are unmodified and cryptographically linked. Verified at ${formatDate(verifyResult.verifiedAt)}`
              : `Chain integrity check FAILED — ${verifyResult.tamperedBlocks.length} tampered block(s) detected: ${verifyResult.tamperedBlocks.map((t: any) => `#${t.blockNumber}`).join(", ")}`
            }
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }} className="metric-card text-center">
            <c.icon className={`w-4 h-4 mx-auto mb-1.5 ${c.color}`} />
            <p className="text-xl font-bold text-foreground">{loading ? "—" : c.value}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["history", "add"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {tab === "history" ? "Transaction History" : "Add Stock Transfer"}
          </button>
        ))}
      </div>

      {activeTab === "history" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Search + Filter */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input value={searchTx}
                  onChange={e => { setSearchTx(e.target.value); setSearchResult(null); }}
                  onKeyDown={e => e.key === "Enter" && handleSearchTx()}
                  placeholder="Search by Transaction ID..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <button onClick={handleSearchTx}
                className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Search
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="text-xs px-2 py-1.5 rounded-md border border-border bg-background focus:outline-none">
                <option value="ALL">All Types</option>
                {Object.entries(TRANSFER_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Result */}
          {searchResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`p-3 rounded-md border text-xs ${searchResult.found && searchResult.valid ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5"}`}>
              {!searchResult.found
                ? <span className="text-destructive flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Transaction not found in chain.</span>
                : searchResult.valid
                  ? <div className="space-y-1.5">
                      <span className="flex items-center gap-1.5 text-green-700 dark:text-green-400 font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Transaction verified on chain</span>
                      {searchResult.block && (
                        <div className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-0.5">
                          <span>Block #{searchResult.block.index ?? searchResult.block.blockNumber}</span>
                          <span>{formatDate(searchResult.block.timestamp ?? searchResult.block.createdAt)}</span>
                          <span>Type: {TRANSFER_LABELS[searchResult.block.transferType ?? searchResult.block.transactionType] ?? "—"}</span>
                          <span>Node: {searchResult.block.nodeId}</span>
                          <span className="col-span-2 font-mono">Hash: {shortHash(searchResult.block.hash ?? searchResult.block.currentHash)}</span>
                        </div>
                      )}
                    </div>
                  : <span className="text-destructive flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Transaction found but verification failed — possible tampering.</span>
              }
            </motion.div>
          )}

          {/* Transaction Table */}
          <div className="command-panel">
            <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Database className="w-4 h-4 text-muted-foreground" />
                Blockchain Ledger
              </h3>
              <span className="text-[10px] text-muted-foreground">{loading ? "loading..." : `${filtered.filter(b => b.index > 0).length} records`}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Transaction ID</th>
                    <th>Batch ID</th>
                    <th>Commodity</th>
                    <th>Quantity</th>
                    <th>Source</th>
                    <th>Destination</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Tx Hash</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.filter(b => b.index > 0).map((block, idx) => {
                    const summary = getPayloadSummary(block);
                    const Icon = TRANSFER_ICONS[block.transferType] ?? ArrowRightLeft;
                    return (
                      <motion.tr key={block.transactionId}
                        initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(idx * 0.02, 0.4) }}>
                        <td className="text-muted-foreground">{block.index}</td>
                        <td className="font-mono text-[10px] text-primary">{block.transactionId}</td>
                        <td className="font-mono text-[10px]">
                          {summary.batchId || <span className="text-muted-foreground italic">fraud-log</span>}
                        </td>
                        <td>{summary.commodity || <span className="text-muted-foreground">—</span>}</td>
                        <td>{summary.quantity || <span className="text-muted-foreground">—</span>}</td>
                        <td className="text-xs">{summary.source}</td>
                        <td className="text-xs">{summary.destination}</td>
                        <td>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${TRANSFER_COLORS[block.transferType] ?? "bg-muted text-muted-foreground"}`}>
                            <Icon className="w-2.5 h-2.5" />
                            {TRANSFER_LABELS[block.transferType] ?? block.transferType}
                          </span>
                        </td>
                        <td className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDate(block.timestamp)}</td>
                        <td className="font-mono text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Hash className="w-2.5 h-2.5" />
                            {shortHash(block.hash)}
                          </div>
                        </td>
                        <td>
                          {block.verificationStatus === "VERIFIED"
                            ? <span className="inline-flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400"><CheckCircle2 className="w-3 h-3" />Verified</span>
                            : block.verificationStatus === "TAMPERED"
                              ? <span className="inline-flex items-center gap-1 text-[10px] text-destructive"><XCircle className="w-3 h-3" />Tampered</span>
                              : <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="w-3 h-3" />Pending</span>
                          }
                        </td>
                      </motion.tr>
                    );
                  })}
                  {!loading && filtered.filter(b => b.index > 0).length === 0 && (
                    <tr><td colSpan={11} className="text-center text-xs text-muted-foreground py-8">No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "add" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="command-panel max-w-2xl">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Record Stock Transfer on Chain</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              POST /blockchain/stock-transfer — creates an immutable block in the audit chain
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Batch ID *</label>
              <input value={form.batchId} onChange={e => setForm(f => ({ ...f, batchId: e.target.value }))}
                placeholder="BATCH-WD-2026-015"
                className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Transfer Type</label>
              <select value={form.transferType} onChange={e => setForm(f => ({ ...f, transferType: e.target.value as TransferType }))}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none">
                <option value="WAREHOUSE_TO_DISTRICT">Warehouse → District</option>
                <option value="DISTRICT_TO_SHOP">District → Shop</option>
                <option value="INVENTORY_MOVEMENT">Inventory Movement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Commodity</label>
              <select value={form.commodity} onChange={e => setForm(f => ({ ...f, commodity: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none">
                {COMMODITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">Quantity *</label>
                <input type="number" min="1" value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  placeholder="500"
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="w-20">
                <label className="block text-xs text-muted-foreground mb-1">Unit</label>
                <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none">
                  <option>kg</option><option>L</option><option>tons</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Source</label>
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none">
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Destination</label>
              <select value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none">
                {DESTINATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setForm(defaultForm)}
                className="text-xs px-4 py-1.5 rounded-md border border-border bg-background hover:bg-accent transition-colors">
                Reset
              </button>
              <button type="submit" disabled={submitting || !form.batchId.trim() || !form.quantity.trim()}
                className="text-xs px-4 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
                {submitting ? "Recording..." : "Record on Blockchain"}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default BlockchainAuditDashboard;
