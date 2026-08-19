import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Play,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ExplainableRiskAssessment, RiskLevel, PreDeliveryDecision } from "@/services/fraudEngine/types";
import { ExplainableRiskEngine } from "@/services/fraudEngine/explainableRiskEngine";

interface PreDeliveryQueueProps {
  queue: ExplainableRiskAssessment[];
  onSelectAssessment: (assessment: ExplainableRiskAssessment) => void;
  onAddSimulatedTransaction?: (assessment: ExplainableRiskAssessment) => void;
}

const statusBadgeStyles: Record<PreDeliveryDecision, { bg: string; text: string; label: string }> = {
  NORMAL: { bg: "bg-success/15 border-success/30", text: "text-success", label: "NORMAL (PASS)" },
  ADDITIONAL_VERIFICATION: { bg: "bg-info/15 border-info/30", text: "text-info", label: "REQUIRE EXTRA OTP" },
  ADMIN_REVIEW: { bg: "bg-warning/15 border-warning/30", text: "text-warning", label: "ADMIN REVIEW" },
  INVESTIGATION: { bg: "bg-destructive/15 border-destructive/30", text: "text-destructive", label: "HOLD & INVESTIGATE" },
};

export const PreDeliveryQueue: React.FC<PreDeliveryQueueProps> = ({
  queue,
  onSelectAssessment,
  onAddSimulatedTransaction,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [isSimulating, setIsSimulating] = useState(false);

  // Quick Simulation Form state
  const [simBeneficiary, setSimBeneficiary] = useState("BEN-TN-MDU-00842");
  const [simCommodity, setSimCommodity] = useState("Cooking Oil");
  const [simQty, setSimQty] = useState(75);
  const [simFailedAttempts, setSimFailedAttempts] = useState(2);

  const filteredQueue = queue.filter((item) => {
    if (filterLevel === "ALL") return true;
    return item.riskLevel === filterLevel;
  });

  const handleRunSimulation = () => {
    const simTx = ExplainableRiskEngine.evaluateTransaction({
      transactionId: `SIM-ORD-${Date.now().toString().slice(-4)}`,
      beneficiaryId: simBeneficiary,
      shopId: simBeneficiary.includes("MDU") ? "s4" : "s1",
      shopName: simBeneficiary.includes("MDU") ? "Madurai Main FPS" : "Anna Nagar FPS",
      district: simBeneficiary.includes("MDU") ? "Madurai" : "Chennai",
      deliveryAgentId: simBeneficiary.includes("MDU") ? "AGT-MDU-01" : "AGT-CHE-01",
      deliveryAgentName: simBeneficiary.includes("MDU") ? "Agent K. Raman (AGT-17)" : "Agent Murugan (AGT-01)",
      commodity: simCommodity,
      quantity: Number(simQty),
      unit: simCommodity === "Cooking Oil" || simCommodity === "Kerosene" ? "L" : "kg",
      timestamp: new Date().toISOString(),
      failedVerificationAttempts: Number(simFailedAttempts),
      recentOrdersLast7Days: 2,
    });

    if (onAddSimulatedTransaction) {
      onAddSimulatedTransaction(simTx);
    }
    onSelectAssessment(simTx);
    setIsSimulating(false);
  };

  return (
    <div className="space-y-4">
      {/* Pipeline Explanation Banner */}
      <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Pre-Delivery Gatekeeper Engine</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Order Placed → Eligibility Check → Inventory Check → Ration DNA Baseline → Behavioral Drift → Collusion Graph → Risk Engine → Gatekeeper Decision
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSimulating((s) => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          {isSimulating ? "Close Simulator" : "Test Transaction Simulation"}
        </button>
      </div>

      {/* Real-Time Simulation Panel */}
      {isSimulating && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-4 rounded-xl bg-muted/40 border border-primary/30 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Inject Test Transaction Into Pre-Delivery Pipeline
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase">
              SYNTHETIC TEST SIMULATOR
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-muted-foreground block mb-1">Beneficiary ID</label>
              <select
                value={simBeneficiary}
                onChange={(e) => setSimBeneficiary(e.target.value)}
                className="w-full p-2 rounded bg-background border border-border"
              >
                <option value="BEN-TN-MDU-00842">BEN-TN-MDU-00842 (Madurai Drift & Collusion)</option>
                <option value="BEN-TN-SLM-00999">BEN-TN-SLM-00999 (Salem Insufficient History)</option>
                <option value="BEN-TN-CHE-00101">BEN-TN-CHE-00101 (Chennai Normal Baseline)</option>
              </select>
            </div>

            <div>
              <label className="text-muted-foreground block mb-1">Commodity</label>
              <select
                value={simCommodity}
                onChange={(e) => setSimCommodity(e.target.value)}
                className="w-full p-2 rounded bg-background border border-border"
              >
                <option value="Cooking Oil">Cooking Oil</option>
                <option value="Rice">Rice</option>
                <option value="Sugar">Sugar</option>
                <option value="Wheat">Wheat</option>
              </select>
            </div>

            <div>
              <label className="text-muted-foreground block mb-1">Requested Qty</label>
              <input
                type="number"
                value={simQty}
                onChange={(e) => setSimQty(Number(e.target.value))}
                className="w-full p-2 rounded bg-background border border-border"
              />
            </div>

            <div>
              <label className="text-muted-foreground block mb-1">Failed OTP Retries</label>
              <input
                type="number"
                value={simFailedAttempts}
                onChange={(e) => setSimFailedAttempts(Number(e.target.value))}
                className="w-full p-2 rounded bg-background border border-border"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRunSimulation}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Evaluate & Score Transaction
            </button>
          </div>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-2">
        {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilterLevel(lvl)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filterLevel === lvl
                ? "bg-primary text-primary-foreground"
                : "bg-muted/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {lvl === "ALL" ? "All Queue Items" : `${lvl} Risk`}
          </button>
        ))}
      </div>

      {/* Queue Table */}
      <div className="command-panel overflow-hidden border border-border rounded-xl">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Beneficiary (Anonymized)</th>
                <th>Shop & District</th>
                <th>Commodity & Qty</th>
                <th>Calculated Risk</th>
                <th>Pre-Delivery Gate</th>
                <th>Investigation State</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.map((item) => {
                const badge = statusBadgeStyles[item.preDeliveryDecision] || statusBadgeStyles.NORMAL;
                return (
                  <tr key={item.transactionId} className="hover:bg-muted/30 transition-colors">
                    <td className="font-mono text-xs font-semibold text-foreground">
                      {item.transactionId}
                    </td>
                    <td className="text-xs">
                      <div>
                        <span className="font-mono font-medium text-foreground">{item.beneficiaryId}</span>
                        <span className="text-[10px] text-muted-foreground block">{item.anonymizedCardId}</span>
                      </div>
                    </td>
                    <td className="text-xs">
                      <div>
                        <span>{item.shopName}</span>
                        <span className="text-[10px] text-muted-foreground block">{item.district}</span>
                      </div>
                    </td>
                    <td className="text-xs">
                      <span className="font-semibold text-foreground">
                        {item.quantity} {item.unit}
                      </span>{" "}
                      <span className="text-muted-foreground">({item.commodity})</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            item.riskLevel === "CRITICAL"
                              ? "bg-destructive/20 text-destructive font-black"
                              : item.riskLevel === "HIGH"
                              ? "bg-warning/20 text-warning"
                              : item.riskLevel === "MEDIUM"
                              ? "bg-info/20 text-info"
                              : "bg-success/20 text-success"
                          }`}
                        >
                          {item.overallRiskScore}/100
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {item.investigationStatus.replace("_", " ")}
                    </td>
                    <td>
                      <button
                        onClick={() => onSelectAssessment(item)}
                        className="px-2.5 py-1 bg-muted hover:bg-primary hover:text-primary-foreground rounded text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
