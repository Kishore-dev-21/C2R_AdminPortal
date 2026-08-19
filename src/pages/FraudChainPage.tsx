import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ShieldAlert,
  Clock,
  Layers,
  Network,
  Dna,
  Package,
  Truck,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  CheckSquare,
  Square,
  FileCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  FraudChain,
  FraudChainStatus,
  InvestigationRecommendation,
} from "@/services/fraudEngine/types";
import { FraudChainService } from "@/services/fraudEngine/fraudChainService";
import { FraudChainTimeline } from "@/components/fraud/FraudChainTimeline";
import { FraudChainGraphFlow } from "@/components/fraud/FraudChainGraphFlow";
import { CounterfactualSimulator } from "@/components/fraud/CounterfactualSimulator";
import { FraudChainResolveModal } from "@/components/fraud/FraudChainResolveModal";

const statusStyles: Record<
  FraudChainStatus,
  { bg: string; text: string; label: string; dot: string }
> = {
  MONITORING: {
    bg: "bg-success/15 border-success/30",
    text: "text-success",
    label: "MONITORING",
    dot: "bg-success",
  },
  UNDER_REVIEW: {
    bg: "bg-info/15 border-info/30",
    text: "text-info",
    label: "UNDER REVIEW",
    dot: "bg-info",
  },
  INVESTIGATION_REQUIRED: {
    bg: "bg-warning/15 border-warning/30",
    text: "text-warning",
    label: "INVESTIGATION REQUIRED",
    dot: "bg-warning",
  },
  CRITICAL: {
    bg: "bg-destructive/15 border-destructive/30",
    text: "text-destructive font-black",
    label: "CRITICAL ALERT",
    dot: "bg-destructive animate-pulse",
  },
  RESOLVED: {
    bg: "bg-muted border-border",
    text: "text-muted-foreground",
    label: "RESOLVED & CLOSED",
    dot: "bg-muted-foreground",
  },
  ESCALATED: {
    bg: "bg-orange-500/15 border-orange-500/30",
    text: "text-orange-600 dark:text-orange-400 font-bold",
    label: "ESCALATED TO VIGILANCE",
    dot: "bg-orange-500",
  },
};

const FraudChainPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    user?.role === "DISTRICT_ADMIN" && user.district ? user.district : "All"
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChainId, setSelectedChainId] = useState<string>("FC-MDU-001");
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  // Recommendations state for local check-off
  const [completedRecs, setCompletedRecs] = useState<Record<string, boolean>>({});

  const allChains = useMemo(() => {
    return FraudChainService.getAllChains({
      district: selectedDistrict,
      role: user?.role,
      shop: user?.shop,
    });
  }, [selectedDistrict, user]);

  const filteredChains = useMemo(() => {
    return allChains.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (searchQuery) {
        return (
          c.chainId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.district.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return true;
    });
  }, [allChains, statusFilter, searchQuery]);

  const activeChain = useMemo(() => {
    return (
      filteredChains.find((c) => c.id === selectedChainId || c.chainId === selectedChainId) ||
      filteredChains[0] ||
      null
    );
  }, [filteredChains, selectedChainId]);

  const handleStatusChange = (newStatus: FraudChainStatus) => {
    if (!activeChain) return;
    FraudChainService.updateChainStatus(activeChain.id, newStatus, {
      email: user?.email || "admin@click2ration.gov",
      name: user?.name || "Administrator",
      role: user?.role || "SUPER_ADMIN",
      notes: `Administrator updated status of chain ${activeChain.chainId} to ${newStatus}`,
    });
    toast({
      title: "Chain Status Updated",
      description: `Fraud Chain ${activeChain.chainId} transitioned to ${newStatus}.`,
    });
  };

  const toggleRec = (recTitle: string) => {
    setCompletedRecs((prev) => ({
      ...prev,
      [recTitle]: !prev[recTitle],
    }));
  };

  // Executive Metrics
  const activeCount = allChains.filter((c) => c.status !== "RESOLVED").length;
  const criticalCount = allChains.filter((c) => c.status === "CRITICAL").length;
  const totalEntities = 7;
  const totalLinkedTxs = allChains.reduce((acc, c) => acc + c.linkedTransactionIds.length, 0);
  const avgRisk = Math.round(
    allChains.reduce((acc, c) => acc + c.riskScore, 0) / (allChains.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-foreground">Fraud Chain Intelligence</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 uppercase tracking-wide">
              Story & Sequence Reconstruction
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reconstructing suspicious event chains across beneficiaries, ration shops, inventory, delivery agents and transactions.
          </p>
        </div>

        {/* RBAC District Filter for Super Admin */}
        <div className="flex items-center gap-2 flex-wrap">
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
                <option value="Salem">Salem</option>
                <option value="Coimbatore">Coimbatore</option>
              </select>
            </div>
          )}

          <button
            onClick={() => navigate("/fraud")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-primary" />
            <span>Fraud Overview</span>
          </button>
        </div>
      </div>

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Active Fraud Chains", value: activeCount, desc: "Monitored", color: "text-foreground font-bold" },
          { label: "Critical Priority", value: criticalCount, desc: "Immediate Action", color: "text-destructive font-black" },
          { label: "Entities Involved", value: totalEntities, desc: "Cross-correlated", color: "text-info font-bold" },
          { label: "Transactions Linked", value: totalLinkedTxs, desc: "Sequenced", color: "text-purple-600 dark:text-purple-400 font-bold" },
          { label: "Average Chain Risk", value: `${avgRisk}/100`, desc: "Multi-factor", color: "text-warning font-bold" },
          { label: "Under Investigation", value: "1", desc: "Assigned", color: "text-orange-500 font-bold" },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
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

      {/* Master - Detail Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Sidebar: Chains List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-3 bg-card border border-border rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Fraud Chains Directory
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {filteredChains.length} chains
              </span>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search chains, shops, IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary w-full"
              />
            </div>

            {/* Status filters */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {["ALL", "CRITICAL", "INVESTIGATION_REQUIRED", "RESOLVED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase whitespace-nowrap transition-colors ${
                    statusFilter === st
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st === "INVESTIGATION_REQUIRED" ? "Investigating" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Chains Master Cards */}
          <div className="space-y-2">
            {filteredChains.map((c) => {
              const isSelected = activeChain?.id === c.id;
              const sStyle = statusStyles[c.status] || statusStyles.MONITORING;

              return (
                <motion.div
                  key={c.id}
                  onClick={() => setSelectedChainId(c.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "bg-card border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${sStyle.dot}`} />
                      <span className="font-mono text-xs font-bold text-foreground">
                        {c.chainId}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${sStyle.bg} ${sStyle.text}`}
                    >
                      {c.riskScore}/100 Risk
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-foreground mt-1.5 line-clamp-1">
                    {c.title}
                  </h5>

                  <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                    <span>{c.shopName}</span>
                    <span className="font-medium text-foreground">{c.district}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                    <span>{c.involvedBeneficiaryIds.length} Beneficiaries · {c.linkedTransactionIds.length} Tx</span>
                    <span className="text-primary font-semibold flex items-center gap-0.5">
                      Inspect Chain <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {activeChain ? (
            <>
              {/* Chain Header Banner */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-muted text-foreground">
                        {activeChain.chainId}
                      </span>
                      <h3 className="text-base font-bold text-foreground">{activeChain.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hub: <strong className="text-foreground">{activeChain.shopName}</strong> ({activeChain.district} District) · Created: {activeChain.createdAt}
                    </p>
                  </div>

                  {/* Actions & Status Selector */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={activeChain.status}
                      onChange={(e) => handleStatusChange(e.target.value as any)}
                      className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="MONITORING">Status: Monitoring</option>
                      <option value="UNDER_REVIEW">Status: Under Review</option>
                      <option value="INVESTIGATION_REQUIRED">Status: Investigation Required</option>
                      <option value="CRITICAL">Status: Critical Alert</option>
                      <option value="ESCALATED">Status: Escalated</option>
                      <option value="RESOLVED">Status: Resolved & Closed</option>
                    </select>

                    <button
                      onClick={() => setIsResolveModalOpen(true)}
                      className="px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Resolve Chain</span>
                    </button>
                  </div>
                </div>

                {/* Score & Confidence Overview Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Chain Risk Score
                    </span>
                    <span className="text-lg font-black text-destructive">
                      {activeChain.riskScore} <span className="text-[10px] text-muted-foreground">/ 100</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      AI Hypothesis Confidence
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      {activeChain.confidenceScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Linked Commodities
                    </span>
                    <span className="font-semibold text-foreground block truncate">
                      {activeChain.involvedCommodities.join(", ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Primary Transaction
                    </span>
                    <span className="font-mono font-bold text-primary block">
                      {activeChain.primaryTransactionId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resolution Banner if resolved */}
              {activeChain.resolution && (
                <div className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-xs text-success space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Investigation Finding: {activeChain.resolution.finding}
                    </span>
                    <span>Resolved by {activeChain.resolution.resolvedBy}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    {activeChain.resolution.resolutionReason}
                  </p>
                </div>
              )}

              {/* ── Section 1: Generated Fraud Hypothesis ── */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Explainable Fraud Hypothesis</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    Confidence: {activeChain.hypothesis.confidence}%
                  </span>
                </div>

                <h4 className="text-sm font-bold text-foreground">
                  {activeChain.hypothesis.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeChain.hypothesis.summary}
                </p>

                <div className="space-y-1 pt-2 border-t border-border">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                    Synthesized Supporting Evidence Signals:
                  </span>
                  <ul className="space-y-1 text-xs text-foreground">
                    {activeChain.hypothesis.evidenceBulletPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-primary font-bold">·</span>
                        <span className="text-muted-foreground">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ── Section 2: Explainable Evidence Contributions ── */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Explainable Evidence Risk Contributions
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Total Weighted Risk: {activeChain.riskScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeChain.evidenceContributions.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-lg bg-muted/20 border border-border text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{ev.factorName}</span>
                        <span className="font-mono font-bold text-destructive bg-destructive/10 px-1.5 py-0.2 rounded">
                          +{ev.points} pts
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground space-y-0.5">
                        <div className="flex justify-between">
                          <span>Baseline:</span>
                          <span className="text-foreground">{ev.baseline}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Observed:</span>
                          <span className="text-destructive font-medium">{ev.observed}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                        {ev.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Section 3: Reconstructed Causal Graph Flow ── */}
              <FraudChainGraphFlow
                chain={activeChain}
                onOpenEntity={(entityId, entityType) => {
                  if (entityType === "FPS") navigate("/shops");
                  else if (entityType === "DELIVERY_AGENT") navigate("/shop-delivery-dashboard");
                  else if (entityType === "TRANSACTION") navigate("/orders");
                }}
              />

              {/* ── Section 4: Chronological Event Timeline ── */}
              <div className="p-4 rounded-xl bg-card border border-border">
                <FraudChainTimeline events={activeChain.timelineEvents} />
              </div>

              {/* ── Section 5: Counterfactual Investigation Simulation ── */}
              <CounterfactualSimulator chain={activeChain} />

              {/* ── Section 6: Prioritized Investigation Recommendations ── */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Evidence-Driven Investigation Recommendations
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Prioritized investigative checklist derived from specific anomaly triggers
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground font-mono">
                    {Object.values(completedRecs).filter(Boolean).length} / {activeChain.recommendations.length} completed
                  </span>
                </div>

                <div className="space-y-2">
                  {activeChain.recommendations.map((rec) => {
                    const isDone = completedRecs[rec.title] || rec.status === "COMPLETED";

                    return (
                      <div
                        key={rec.priority}
                        onClick={() => toggleRec(rec.title)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                          isDone
                            ? "bg-success/5 border-success/30 line-through opacity-70"
                            : "bg-muted/30 border-border hover:border-primary"
                        }`}
                      >
                        <div className="mt-0.5 text-primary shrink-0">
                          {isDone ? (
                            <CheckSquare className="w-4 h-4 text-success" />
                          ) : (
                            <Square className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>

                        <div className="space-y-0.5 flex-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
                              Priority {rec.priority}: {rec.title}
                            </span>
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                              {rec.targetEntity}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{rec.rationale}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Section 7: Connected Modules Context Links ── */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Connected Intelligence Modules
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    onClick={() => navigate("/fraud")}
                    className="p-2.5 rounded-lg bg-card border border-border hover:border-primary text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-foreground block">Ration DNA</span>
                      <span className="text-[10px] text-muted-foreground">Baseline profiles</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => navigate("/fraud")}
                    className="p-2.5 rounded-lg bg-card border border-border hover:border-primary text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-foreground block">Collusion Graph</span>
                      <span className="text-[10px] text-muted-foreground">Network clusters</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => navigate("/inventory")}
                    className="p-2.5 rounded-lg bg-card border border-border hover:border-primary text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-foreground block">Inventory Stock</span>
                      <span className="text-[10px] text-muted-foreground">Reconciliation</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => navigate("/blockchain-audit")}
                    className="p-2.5 rounded-lg bg-card border border-border hover:border-primary text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-foreground block">Audit Trail</span>
                      <span className="text-[10px] text-muted-foreground">Ledger records</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-32 text-center text-xs text-muted-foreground bg-card border border-border rounded-xl">
              No Fraud Chain matching criteria. Select a chain from the directory.
            </div>
          )}
        </div>
      </div>

      {/* Resolution Modal */}
      <FraudChainResolveModal
        chain={activeChain}
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onResolved={(updated) => {
          setSelectedChainId(updated.id);
        }}
      />
    </div>
  );
};

export default FraudChainPage;
