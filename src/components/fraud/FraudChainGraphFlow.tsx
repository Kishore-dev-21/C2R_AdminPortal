import React from "react";
import { motion } from "framer-motion";
import {
  Store,
  Package,
  User,
  Truck,
  ShieldAlert,
  ArrowRight,
  FileSpreadsheet,
  PauseCircle,
  TrendingDown,
  Layers,
} from "lucide-react";
import { FraudChain } from "@/services/fraudEngine/types";

interface FraudChainGraphFlowProps {
  chain: FraudChain;
  onOpenEntity?: (entityId: string, entityType: string) => void;
}

export const FraudChainGraphFlow: React.FC<FraudChainGraphFlowProps> = ({
  chain,
  onOpenEntity,
}) => {
  const steps = [
    {
      id: "node-1",
      icon: Store,
      entityType: "FPS",
      title: "Ration Shop Hub",
      label: chain.shopName,
      sublabel: `District: ${chain.district}`,
      status: "Anomalous Hub",
      severity: "CRITICAL",
    },
    {
      id: "node-2",
      icon: Package,
      entityType: "INVENTORY",
      title: "Inventory Variance",
      label: "Stock Drift Detected",
      sublabel: "42 L deficit on Cooking Oil",
      status: "Discrepancy",
      severity: "HIGH",
    },
    {
      id: "node-3",
      icon: User,
      entityType: "BENEFICIARY",
      title: "Primary Beneficiary",
      label: chain.involvedBeneficiaryIds[0] || "BEN-MDU-842",
      sublabel: "DNA Match: 31% (+160% surge)",
      status: "Behavioral Drift",
      severity: "CRITICAL",
    },
    {
      id: "node-4",
      icon: Truck,
      entityType: "DELIVERY_AGENT",
      title: "Assigned Carrier",
      label: chain.involvedAgentIds[0] || "Agent K. Raman (AGT-17)",
      sublabel: "18 Co-occurrences in Cluster",
      status: "Cluster Node",
      severity: "HIGH",
    },
    {
      id: "node-5",
      icon: ShieldAlert,
      entityType: "VERIFICATION",
      title: "Authentication Gateway",
      label: "Consecutive OTP Retries",
      sublabel: "2 failed attempts before pass",
      status: "Verification Drift",
      severity: "MEDIUM",
    },
    {
      id: "node-6",
      icon: FileSpreadsheet,
      entityType: "TRANSACTION",
      title: "Correlated Transaction",
      label: chain.linkedTransactionIds[1] || "ORD-1006",
      sublabel: "Related Ben: BEN-MDU-843",
      status: "Synchronized",
      severity: "HIGH",
    },
    {
      id: "node-7",
      icon: PauseCircle,
      entityType: "GATEKEEPER",
      title: "Pre-Delivery Action",
      label: "Delivery Hold Applied",
      sublabel: "Awaiting physical field audit",
      status: "Consignment Held",
      severity: "CRITICAL",
    },
  ];

  return (
    <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Reconstructed Causal Flow & Entity Association
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Sequential progression from inventory anomaly to order batching, carrier bottleneck, and pre-delivery gate
          </p>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
          {chain.chainId} Sequence
        </span>
      </div>

      {/* Horizontal / Grid Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 pt-3">
        {steps.map((st, i) => {
          const Icon = st.icon;
          return (
            <div key={st.id} className="relative flex flex-col justify-between">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onOpenEntity && onOpenEntity(st.label, st.entityType)}
                className={`p-3 rounded-lg border transition-all cursor-pointer h-full flex flex-col justify-between ${
                  st.severity === "CRITICAL"
                    ? "bg-destructive/5 border-destructive/30 hover:border-destructive"
                    : st.severity === "HIGH"
                    ? "bg-warning/5 border-warning/30 hover:border-warning"
                    : "bg-muted/30 border-border hover:border-primary"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono text-muted-foreground">0{i + 1}</span>
                    <div
                      className={`p-1 rounded ${
                        st.severity === "CRITICAL"
                          ? "bg-destructive/15 text-destructive"
                          : st.severity === "HIGH"
                          ? "bg-warning/15 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                    {st.title}
                  </span>
                  <h6 className="text-xs font-bold text-foreground mt-0.5 line-clamp-2">
                    {st.label}
                  </h6>
                </div>

                <div className="mt-2 pt-2 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground block line-clamp-1">
                    {st.sublabel}
                  </span>
                  <span
                    className={`text-[9px] font-semibold mt-1 inline-block px-1.5 py-0.2 rounded ${
                      st.severity === "CRITICAL"
                        ? "bg-destructive/10 text-destructive"
                        : st.severity === "HIGH"
                        ? "bg-warning/10 text-warning"
                        : "bg-info/10 text-info"
                    }`}
                  >
                    {st.status}
                  </span>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
