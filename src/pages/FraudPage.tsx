import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Shield,
  GitCompare,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Database,
  Link2,
  Sparkles,
  Layers,
  Dna,
  Network,
  ClipboardList,
  Activity,
  Filter,
  BarChart3,
  Bot,
  HelpCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { fraudCases } from "@/data/mockData";
import { fraudComparisonData, FraudComparisonRecord } from "@/data/blockchainData";
import { initialPreDeliveryQueue, fraudAnalyticsSummary } from "@/services/fraudEngine/mockIntelligenceData";
import { ExplainableRiskAssessment } from "@/services/fraudEngine/types";
import { CollusionGraphViewer } from "@/components/fraud/CollusionGraphViewer";
import { RationDnaViewer } from "@/components/fraud/RationDnaViewer";
import { PreDeliveryQueue } from "@/components/fraud/PreDeliveryQueue";
import { RiskDetailModal } from "@/components/fraud/RiskDetailModal";
import { AdminAiAssistant } from "@/components/fraud/AdminAiAssistant";
import { SyntheticDemoController } from "@/components/fraud/SyntheticDemoController";
import { InvestigationAuditTable } from "@/components/fraud/InvestigationAuditTable";
import { FraudAuditService } from "@/services/fraudEngine/auditLogService";

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
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Comparison Row ──
const ComparisonRow = ({ record }: { record: FraudComparisonRecord }) => {
  const [open, setOpen] = useState(false);
  const hasDiscrepancy = record.blockchainRecord.quantity !== record.databaseRecord.reportedQuantity;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-accent/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${severityStyles[record.severity]}`}>
            {record.severity}
          </span>
          <span className="text-xs font-medium text-foreground">{record.caseId}</span>
          <span className="text-xs text-muted-foreground">{record.fraudType}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{record.shop}, {record.district}</span>
          {hasDiscrepancy && (
            <span className="inline-flex items-center gap-1 text-[10px] text-destructive bg-destructive/10 px-2 py-0.5 rounded font-medium">
              <XCircle className="w-3 h-3" /> Mismatch Detected
            </span>
          )}
          {!hasDiscrepancy && (
            <span className="inline-flex items-center gap-1 text-[10px] text-success bg-success/10 px-2 py-0.5 rounded font-medium">
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
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-t border-border">
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
                <span className={`font-semibold ${hasDiscrepancy ? "text-success" : ""}`}>
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
                <span className="text-muted-foreground">Commodity</span>
                <span>{record.databaseRecord.commodity}</span>
                <span className="text-muted-foreground">Reported Qty</span>
                <span className={`font-semibold ${hasDiscrepancy ? "text-destructive" : ""}`}>
                  {record.databaseRecord.reportedQuantity} {record.databaseRecord.unit}
                </span>
                <span className="text-muted-foreground">Recorded At</span>
                <span>{formatDate(record.databaseRecord.recordedAt)}</span>
              </div>
            </div>
          </div>

          {/* Discrepancy Summary */}
          <div className={`px-4 py-3 border-t border-border text-xs ${hasDiscrepancy ? "bg-destructive/5" : "bg-success/5"}`}>
            <div className="flex items-start gap-2">
              {hasDiscrepancy ? (
                <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
              )}
              <div>
                <span className={`font-medium ${hasDiscrepancy ? "text-destructive" : "text-success"}`}>
                  AI Analysis:{" "}
                </span>
                <span className="text-muted-foreground">{record.discrepancy}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ── Main Page Component ──
const FraudPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "overview" | "pre-delivery" | "collusion-graph" | "ration-dna" | "blockchain" | "audit-logs"
  >("overview");

  const [preDeliveryQueue, setPreDeliveryQueue] = useState<ExplainableRiskAssessment[]>(initialPreDeliveryQueue);
  const [selectedAssessment, setSelectedAssessment] = useState<ExplainableRiskAssessment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    user?.role === "DISTRICT_ADMIN" && user.district ? user.district : "All"
  );

  const handleOpenAssessment = (assessmentOrTxId: ExplainableRiskAssessment | string) => {
    if (typeof assessmentOrTxId === "string") {
      const found = preDeliveryQueue.find((q) => q.transactionId === assessmentOrTxId);
      if (found) {
        setSelectedAssessment(found);
        setIsModalOpen(true);
      }
    } else {
      setSelectedAssessment(assessmentOrTxId);
      setIsModalOpen(true);
    }
  };

  const handleAssessmentUpdated = (updated: ExplainableRiskAssessment) => {
    setPreDeliveryQueue((prev) =>
      prev.map((item) => (item.transactionId === updated.transactionId ? updated : item))
    );
  };

  const handleAddSimulatedTx = (newTx: ExplainableRiskAssessment) => {
    setPreDeliveryQueue((prev) => [newTx, ...prev]);
  };

  const totalAuditRecords = FraudAuditService.getAuditLogs({
    district: selectedDistrict,
    role: user?.role,
    shop: user?.shop,
  }).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-foreground">AI-Powered Ration Fraud Intelligence</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 uppercase tracking-wide">
              Level 1/2/3 Decision Support
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ration DNA Profiling · Multi-Signal Behavioral Drift · Collusion Graph & Network Clustering · Pre-Delivery Gatekeeper
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* RBAC District Selector for Super Admin */}
          {user?.role === "SUPER_ADMIN" && (
            <div className="flex items-center gap-1.5 bg-background border border-border px-2.5 py-1.5 rounded-lg text-xs">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground text-[11px]">District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-transparent font-semibold text-foreground focus:outline-none cursor-pointer"
              >
                <option value="All">All Districts</option>
                <option value="Chennai">Chennai</option>
                <option value="Madurai">Madurai</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Salem">Salem</option>
              </select>
            </div>
          )}

          <button
            onClick={() => setShowAiAssistant((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showAiAssistant
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-foreground border-border hover:bg-muted"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask Click2Ration AI</span>
          </button>
        </div>
      </div>

      {/* Interactive Synthetic Demo Controller Banner */}
      <SyntheticDemoController
        onOpenAssessment={(txId) => handleOpenAssessment(txId)}
        onStepChange={(stepIdx) => {
          if (stepIdx === 2 || stepIdx === 3) setActiveTab("pre-delivery");
          else if (stepIdx === 4 || stepIdx === 5) setActiveTab("collusion-graph");
          else if (stepIdx === 6) setActiveTab("audit-logs");
        }}
      />

      {/* AI Assistant Drawer if toggled */}
      {showAiAssistant && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <AdminAiAssistant
            onTriggerAction={(action) => {
              if (action.includes("Collusion")) setActiveTab("collusion-graph");
              else if (action.includes("Pre-Delivery") || action.includes("Review")) setActiveTab("pre-delivery");
              else if (action.includes("District")) setActiveTab("overview");
            }}
          />
        </motion.div>
      )}

      {/* Executive Intelligence Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Transactions Analysed", value: "3,842", desc: "Today", color: "text-foreground" },
          { label: "Behavioural Anomalies", value: "142", desc: "Level 2 Drift", color: "text-info" },
          { label: "High-Risk Alerts", value: "28", desc: "Score >= 70", color: "text-warning" },
          { label: "Network Clusters", value: "2", desc: "Collusion Rings", color: "text-destructive font-black" },
          { label: "Pre-Delivery Holds", value: "6", desc: "Pending Review", color: "text-orange-500 font-bold" },
          { label: "Audit Actions", value: totalAuditRecords, desc: "Committed Logs", color: "text-success" },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="metric-card text-center"
          >
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">{m.label}</p>
            <p className={`text-xl font-extrabold mt-0.5 ${m.color}`}>{m.value}</p>
            <span className="text-[9px] text-muted-foreground block mt-0.5">{m.desc}</span>
          </motion.div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {[
          { id: "overview", label: "Intelligence Overview", icon: Activity },
          { id: "pre-delivery", label: "Pre-Delivery Queue", icon: Shield },
          { id: "collusion-graph", label: "Collusion Graph", icon: Network },
          { id: "ration-dna", label: "Ration DNA Profiles", icon: Dna },
          { id: "blockchain", label: "Blockchain vs DB", icon: GitCompare },
          { id: "audit-logs", label: "Audit Logs", icon: ClipboardList },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: Intelligence Overview & Analytics ── */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Risk Distribution Chart */}
            <div className="border border-border rounded-xl bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Configurable Risk Band Distribution
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">3,842 evaluated</span>
              </div>

              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fraudAnalyticsSummary.riskDistribution} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontSize: "11px" }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {fraudAnalyticsSummary.riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Normal (0-40)</span>
                  <span className="font-bold text-success">85.4% (3,280)</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Critical (85-100)</span>
                  <span className="font-bold text-destructive">0.7% (28)</span>
                </div>
              </div>
            </div>

            {/* Anomaly Timeline */}
            <div className="border border-border rounded-xl bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Hourly Anomaly Volume
                </span>
                <span className="text-[10px] text-muted-foreground">Today</span>
              </div>

              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fraudAnalyticsSummary.anomalyTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontSize: "11px" }} />
                    <Line type="monotone" dataKey="medium" stroke="hsl(var(--info))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="high" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="critical" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground pt-2 border-t border-border">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-info" /> Medium</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" /> High</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Critical</span>
              </div>
            </div>

            {/* Top Anomaly Categories */}
            <div className="border border-border rounded-xl bg-card p-4 space-y-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Top Behavioral Anomaly Triggers
              </span>

              <div className="space-y-2.5">
                {fraudAnalyticsSummary.topAnomalyCategories.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{cat.category}</span>
                      <span className="font-bold text-foreground">{cat.count} ({cat.share})</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${parseInt(cat.share)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shop & Delivery Agent Anomaly Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shop Anomaly Leaderboard */}
            <div className="border border-border rounded-xl bg-card p-4 space-y-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Shop-Level Anomaly Risk Index
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border text-left">
                      <th className="pb-2">Shop Outlet</th>
                      <th className="pb-2">District</th>
                      <th className="pb-2">Risk Index</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {fraudAnalyticsSummary.shopRiskLeaderboard.map((shop, idx) => (
                      <tr key={idx} className="py-2 hover:bg-muted/30">
                        <td className="py-2 font-medium text-foreground">{shop.shop}</td>
                        <td className="py-2 text-muted-foreground">{shop.district}</td>
                        <td className="py-2">
                          <span
                            className={`font-bold ${
                              shop.riskIndex >= 70
                                ? "text-destructive"
                                : shop.riskIndex >= 40
                                ? "text-warning"
                                : "text-success"
                            }`}
                          >
                            {shop.riskIndex}/100
                          </span>
                        </td>
                        <td className="py-2">
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              shop.status.includes("Critical")
                                ? "bg-destructive/15 text-destructive"
                                : shop.status.includes("High")
                                ? "bg-warning/15 text-warning"
                                : "bg-success/15 text-success"
                            }`}
                          >
                            {shop.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delivery Agent Anomaly Matrix */}
            <div className="border border-border rounded-xl bg-card p-4 space-y-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Delivery Agent Anomaly Patterns
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border text-left">
                      <th className="pb-2">Agent Name</th>
                      <th className="pb-2">Assigned FPS</th>
                      <th className="pb-2">Cluster Link</th>
                      <th className="pb-2">Anomaly Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {fraudAnalyticsSummary.agentRiskLeaderboard.map((agent, idx) => (
                      <tr key={idx} className="py-2 hover:bg-muted/30">
                        <td className="py-2 font-medium text-foreground">{agent.agent}</td>
                        <td className="py-2 text-muted-foreground">{agent.shop}</td>
                        <td className="py-2 font-mono text-muted-foreground">{agent.cooccurrences} co-occurrences</td>
                        <td className="py-2">
                          <span
                            className={`font-bold px-2 py-0.5 rounded ${
                              agent.anomalyScore >= 80
                                ? "bg-destructive/15 text-destructive font-black"
                                : agent.anomalyScore >= 60
                                ? "bg-warning/15 text-warning"
                                : "bg-success/15 text-success"
                            }`}
                          >
                            {agent.anomalyScore}/100
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TAB 2: Pre-Delivery Screening Queue ── */}
      {activeTab === "pre-delivery" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <PreDeliveryQueue
            queue={preDeliveryQueue}
            onSelectAssessment={handleOpenAssessment}
            onAddSimulatedTransaction={handleAddSimulatedTx}
          />
        </motion.div>
      )}

      {/* ── TAB 3: Collusion Graph Explorer ── */}
      {activeTab === "collusion-graph" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <CollusionGraphViewer
            districtFilter={selectedDistrict}
            onSelectTransaction={(txId) => handleOpenAssessment(txId)}
          />
        </motion.div>
      )}

      {/* ── TAB 4: Ration DNA Behavioral Profiles ── */}
      {activeTab === "ration-dna" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <RationDnaViewer districtFilter={selectedDistrict} />
        </motion.div>
      )}

      {/* ── TAB 5: Blockchain vs Database Auditing ── */}
      {activeTab === "blockchain" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Cryptographic Blockchain Cross-Verification</p>
              <p className="text-muted-foreground mt-0.5">
                The permissioned blockchain serves as an immutable reference ledger. Discrepancies between authoritative blockchain logs and reported operational database entries represent potential physical stock diversions or false entry inflation.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {fraudComparisonData.map((record, i) => (
              <motion.div key={record.caseId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ComparisonRow record={record} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── TAB 6: Investigation Audit Logs ── */}
      {activeTab === "audit-logs" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <InvestigationAuditTable districtFilter={selectedDistrict} />
        </motion.div>
      )}

      {/* Detail & Action Modal */}
      <RiskDetailModal
        assessment={selectedAssessment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssessmentUpdated={handleAssessmentUpdated}
      />
    </div>
  );
};

export default FraudPage;
