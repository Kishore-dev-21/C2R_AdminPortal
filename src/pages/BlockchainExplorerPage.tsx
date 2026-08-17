import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Blocks, Hash, ChevronDown, ChevronUp, CheckCircle2, XCircle,
  Clock, AlertTriangle, Shield, Cpu, ArrowRight, Search, Wifi, WifiOff
} from "lucide-react";
import { blockchainApiService } from "@/services/blockchainApiService";
import { Block } from "@/services/blockchainService";

// ── AI Fraud Risk Scoring (client-side, mirrors backend logic) ─────────────

type FraudSeverity = "Critical" | "High" | "Medium" | "Low";

function computeRiskScore(block: Block): { score: number; level: FraudSeverity; factors: string[] } | null {
  if (block.transferType !== "FRAUD_LOG") return null;
  const p = block.payload as any;
  let score = 0;
  const factors: string[] = [];
  const sev = p.severity ?? "Low";
  const weights: Record<string, number> = { Critical: 80, High: 60, Medium: 40, Low: 20 };
  score += weights[sev] ?? 20;
  factors.push(`Severity: ${sev}`);
  if (p.detectedBy === "AI") { score += 10; factors.push("AI-detected anomaly"); }
  const kws: [string, number, string][] = [
    ["diversion", 15, "Stock diversion pattern"],
    ["duplicate", 12, "Duplicate entry detected"],
    ["unaccounted", 10, "Unaccounted quantity"],
    ["inflat", 8, "Inflated DB entry"],
    ["mismatch", 8, "Quantity mismatch"],
  ];
  const evidence = (p.evidence ?? "").toLowerCase();
  const fraudType = (p.fraudType ?? "").toLowerCase();
  for (const [kw, w, label] of kws) {
    if (evidence.includes(kw) || fraudType.includes(kw)) {
      score = Math.min(100, score + w);
      factors.push(label);
    }
  }
  const clamped = Math.min(100, score);
  const level: FraudSeverity = clamped >= 80 ? "Critical" : clamped >= 60 ? "High" : clamped >= 40 ? "Medium" : "Low";
  return { score: clamped, level, factors };
}

// ── Helpers ────────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<FraudSeverity, string> = {
  Critical: "bg-destructive/20 text-destructive",
  High: "bg-warning/20 text-warning",
  Medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Low: "bg-muted text-muted-foreground",
};

const RISK_BAR_COLORS: Record<FraudSeverity, string> = {
  Critical: "bg-destructive",
  High: "bg-warning",
  Medium: "bg-amber-500",
  Low: "bg-blue-500",
};

const TX_COLORS: Record<string, string> = {
  WAREHOUSE_TO_DISTRICT: "text-blue-500",
  DISTRICT_TO_SHOP: "text-green-500",
  INVENTORY_MOVEMENT: "text-amber-500",
  FRAUD_LOG: "text-destructive",
  DELIVERY_PROOF: "text-purple-500",
};

const TX_LABELS: Record<string, string> = {
  WAREHOUSE_TO_DISTRICT: "Warehouse → District",
  DISTRICT_TO_SHOP: "District → Shop",
  INVENTORY_MOVEMENT: "Inventory Movement",
  FRAUD_LOG: "Fraud Log",
  DELIVERY_PROOF: "Delivery Proof",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function shortHash(h: string) {
  if (!h || h.length < 14) return h ?? "—";
  return `${h.slice(0, 12)}...${h.slice(-8)}`;
}

// ── Block Detail Card ──────────────────────────────────────────────────────

const BlockCard = ({ block, idx }: { block: Block; idx: number }) => {
  const [open, setOpen] = useState(false);
  const risk = computeRiskScore(block);
  const p = block.payload as any;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.03, 0.5) }}
      className="border border-border rounded-lg overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-background hover:bg-accent/40 transition-colors text-left gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
          {/* Block number badge */}
          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0">
            <Blocks className="w-2.5 h-2.5" /> #{block.index}
          </span>

          {/* Transfer type */}
          <span className={`text-xs font-medium ${TX_COLORS[block.transferType] ?? "text-foreground"}`}>
            {TX_LABELS[block.transferType] ?? block.transferType}
          </span>

          {/* Commodity or case */}
          {block.transferType !== "FRAUD_LOG"
            ? <span className="text-xs text-muted-foreground">{p.commodity} · {p.quantity} {p.unit}</span>
            : <span className="text-xs text-muted-foreground">{p.fraudType} · {p.shop}</span>
          }

          {/* AI Risk Score badge (fraud blocks only) */}
          {risk && (
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${SEVERITY_STYLES[risk.level]}`}>
              AI Risk: {risk.level} ({risk.score})
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:block">
            {formatDate(block.timestamp)}
          </span>
          {block.verificationStatus === "VERIFIED"
            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            : block.verificationStatus === "TAMPERED"
              ? <XCircle className="w-3.5 h-3.5 text-destructive" />
              : <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          }
          {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="border-t border-border bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left: Block metadata */}
            <div className="p-4 space-y-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Block Metadata</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Block Number</span>
                  <span className="font-mono font-bold">{block.index}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-[10px] text-primary">{block.transactionId}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Timestamp</span>
                  <span>{formatDate(block.timestamp)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Node</span>
                  <span className="font-mono text-[10px]">{block.nodeId}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Status</span>
                  <span className={block.verificationStatus === "VERIFIED" ? "text-green-600 dark:text-green-400 font-semibold" : "text-destructive font-semibold"}>
                    {block.verificationStatus}
                  </span>
                </div>
              </div>

              {/* Hash chain visualization */}
              <div className="mt-3 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Hash Chain</p>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Hash className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Prev:</span>
                  <span className="font-mono text-muted-foreground">{shortHash(block.previousHash)}</span>
                </div>
                <div className="ml-3 border-l border-dashed border-border pl-2">
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Hash className="w-3 h-3 text-primary shrink-0" />
                  <span className="text-muted-foreground">Current:</span>
                  <span className="font-mono text-foreground">{shortHash(block.hash)}</span>
                </div>
              </div>
            </div>

            {/* Right: Payload + AI score */}
            <div className="p-4 space-y-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {block.transferType === "FRAUD_LOG" ? "Fraud Log Payload" : "Transfer Payload"}
              </p>

              {block.transferType !== "FRAUD_LOG" ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Batch ID</span><span className="font-mono text-[10px]">{p.batchId}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Commodity</span><span>{p.commodity}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span className="font-semibold">{p.quantity} {p.unit}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span>{p.source}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Destination</span><span>{p.destination}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Authorized By</span><span>{p.authorizedBy}</span></div>
                  {p.orderId && <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-mono text-[10px]">{p.orderId}</span></div>}
                </div>
              ) : (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Case ID</span><span className="font-mono text-[10px]">{p.caseId}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Fraud Type</span><span>{p.fraudType}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">District</span><span>{p.district}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shop</span><span>{p.shop}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Detected By</span><span>{p.detectedBy}</span></div>
                  <p className="text-muted-foreground pt-1 leading-relaxed">{p.evidence}</p>
                </div>
              )}

              {/* AI Fraud Risk Score */}
              {risk && (
                <div className="mt-3 p-2.5 rounded-md bg-background border border-border">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Cpu className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">AI Fraud Risk Score</span>
                  </div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${RISK_BAR_COLORS[risk.level]}`} style={{ width: `${risk.score}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${SEVERITY_STYLES[risk.level].split(" ")[1]}`}>{risk.score}/100</span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${SEVERITY_STYLES[risk.level]}`}>{risk.level}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {risk.factors.map(f => (
                      <span key={f} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────

const BlockchainExplorerPage = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [apiMode, setApiMode] = useState<"real" | "mock" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await blockchainApiService.getHistory(100);
    setBlocks(data);
    setApiMode(blockchainApiService.mode);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = blocks.filter(b => {
    if (b.index === 0) return false;
    if (filterType !== "ALL" && b.transferType !== filterType) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      const p = b.payload as any;
      return (
        b.transactionId.toLowerCase().includes(s) ||
        (p.batchId ?? "").toLowerCase().includes(s) ||
        (p.commodity ?? "").toLowerCase().includes(s) ||
        (p.caseId ?? "").toLowerCase().includes(s) ||
        (p.source ?? "").toLowerCase().includes(s) ||
        (p.destination ?? "").toLowerCase().includes(s)
      );
    }
    return true;
  });

  const fraudBlocks = filtered.filter(b => b.transferType === "FRAUD_LOG");
  const transferBlocks = filtered.filter(b => b.transferType !== "FRAUD_LOG");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Blocks className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Blockchain Explorer</h2>
            {apiMode && (
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${apiMode === "real" ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                {apiMode === "real" ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                {apiMode === "real" ? "Live API" : "Mock Mode"}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Block-by-block inspection of the PDS audit chain — hashes, payloads, and AI fraud risk scores
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search batch, commodity, TX ID..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-md border border-border bg-background focus:outline-none">
          <option value="ALL">All Types</option>
          {Object.entries(TX_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="text-xs text-muted-foreground self-center">{loading ? "loading..." : `${filtered.length} blocks`}</span>
      </div>

      {/* AI Fraud Risk Summary (fraud blocks only) */}
      {fraudBlocks.length > 0 && (filterType === "ALL" || filterType === "FRAUD_LOG") && (
        <div className="command-panel">
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <h3 className="text-sm font-semibold">AI Fraud Risk Summary</h3>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {(["Critical", "High", "Medium", "Low"] as FraudSeverity[]).map(level => {
              const count = fraudBlocks.filter(b => {
                const r = computeRiskScore(b);
                return r?.level === level;
              }).length;
              return (
                <div key={level} className={`p-3 rounded-md border ${SEVERITY_STYLES[level].replace("text-", "border-").split(" ")[0]}/30 bg-background text-center`}>
                  <p className={`text-lg font-bold ${SEVERITY_STYLES[level].split(" ")[1]}`}>{count}</p>
                  <p className="text-[10px] text-muted-foreground">{level} Risk</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Block list */}
      <div className="space-y-2">
        {loading && (
          <div className="text-center py-12 text-xs text-muted-foreground">
            <Shield className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40 animate-pulse" />
            Loading blockchain...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-xs text-muted-foreground">No blocks found.</div>
        )}
        {!loading && filtered.map((block, idx) => (
          <BlockCard key={block.transactionId} block={block} idx={idx} />
        ))}
      </div>
    </div>
  );
};

export default BlockchainExplorerPage;
