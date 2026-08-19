import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { FraudChain, FraudChainResolution } from "@/services/fraudEngine/types";
import { FraudChainService } from "@/services/fraudEngine/fraudChainService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface FraudChainResolveModalProps {
  chain: FraudChain | null;
  isOpen: boolean;
  onClose: () => void;
  onResolved?: (updatedChain: FraudChain) => void;
}

export const FraudChainResolveModal: React.FC<FraudChainResolveModalProps> = ({
  chain,
  isOpen,
  onClose,
  onResolved,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [finding, setFinding] = useState<FraudChainResolution["finding"]>(
    "LEGITIMATE_DISCREPANCY"
  );
  const [resolutionReason, setResolutionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !chain) return null;

  const trustAdjustment =
    finding === "LEGITIMATE_DISCREPANCY"
      ? 4
      : finding === "FALSE_POSITIVE_CLEARED"
      ? 6
      : -15;

  const handleSubmit = () => {
    if (!resolutionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please enter detailed investigation findings before closing the chain.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const resolved = FraudChainService.resolveChain(
        chain.id,
        {
          finding,
          resolutionReason,
          resolvedBy: user?.name || "Administrator",
          resolvedAt: new Date().toISOString(),
          trustScoreAdjustment: trustAdjustment,
        },
        {
          email: user?.email || "admin@click2ration.gov",
          name: user?.name || "Administrator",
          role: user?.role || "SUPER_ADMIN",
        }
      );

      if (resolved && onResolved) {
        onResolved(resolved);
      }

      toast({
        title: "Fraud Chain Resolved",
        description: `Chain ${chain.chainId} committed to audit ledger with status: ${finding}.`,
      });

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      toast({
        title: "Resolution Failed",
        description: "Could not commit resolution to audit record.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Resolve Investigation: {chain.chainId}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {chain.title} · {chain.district}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-5 space-y-4 text-xs">
            {/* Finding Type */}
            <div>
              <label className="font-semibold text-foreground block mb-1.5">
                Official Investigation Finding:
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: "LEGITIMATE_DISCREPANCY",
                    label: "Legitimate Discrepancy (Delayed clerical entry / Verified quota bump)",
                    desc: "Inventory or timing variance was reconciled with physical supervisor records. Trust score recovers (+4 pts).",
                  },
                  {
                    id: "FALSE_POSITIVE_CLEARED",
                    label: "False Positive Cleared (Algorithmic Noise)",
                    desc: "Transaction conforms to offline physical coupon issuance. Beneficiary trust fully restored (+6 pts).",
                  },
                  {
                    id: "CONFIRMED_ANOMALY_ESCALATED",
                    label: "Confirmed Anomaly / Escalated for Field Enforcement",
                    desc: "Suspected physical diversion confirmed by inspector. Escalated to State Vigilance (-15 pts).",
                  },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setFinding(opt.id as any)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      finding === opt.id
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-background border-border text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <input
                        type="radio"
                        checked={finding === opt.id}
                        onChange={() => {}}
                        className="text-primary"
                      />
                      <span>{opt.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 pl-5">
                      {opt.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Trust Impact Preview */}
            <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Beneficiary Dynamic Trust Impact
                </span>
                <span className="text-xs text-muted-foreground">
                  Applies to {chain.involvedBeneficiaryIds.length} linked beneficiaries
                </span>
              </div>
              <div
                className={`text-sm font-bold flex items-center gap-1 ${
                  trustAdjustment > 0 ? "text-success" : "text-destructive"
                }`}
              >
                {trustAdjustment > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{trustAdjustment > 0 ? `+${trustAdjustment}` : trustAdjustment} pts</span>
              </div>
            </div>

            {/* Resolution Reason */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground block">
                Investigation Findings & Action Rationale:
              </label>
              <textarea
                value={resolutionReason}
                onChange={(e) => setResolutionReason(e.target.value)}
                placeholder="Detail the physical stock reconciliation, inspector interview, or supervisor sign-off..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Commit Resolution to Audit Log</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
