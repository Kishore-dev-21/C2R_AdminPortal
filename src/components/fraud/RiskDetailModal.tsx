import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  PauseCircle,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Shield,
  Layers,
} from "lucide-react";
import { ExplainableRiskAssessment, FeatureContribution, RiskLevel } from "@/services/fraudEngine/types";
import { FraudAuditService } from "@/services/fraudEngine/auditLogService";
import { RationDnaService } from "@/services/fraudEngine/rationDnaService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface RiskDetailModalProps {
  assessment: ExplainableRiskAssessment | null;
  isOpen: boolean;
  onClose: () => void;
  onAssessmentUpdated?: (updated: ExplainableRiskAssessment) => void;
}

const riskLevelBadges: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  LOW: { bg: "bg-success/15 border-success/30", text: "text-success", label: "LOW RISK (0-40)" },
  MEDIUM: { bg: "bg-info/15 border-info/30", text: "text-info", label: "MEDIUM RISK (40-70)" },
  HIGH: { bg: "bg-warning/15 border-warning/30", text: "text-warning", label: "HIGH RISK (70-85)" },
  CRITICAL: { bg: "bg-destructive/15 border-destructive/30", text: "text-destructive", label: "CRITICAL RISK (85-100)" },
};

export const RiskDetailModal: React.FC<RiskDetailModalProps> = ({
  assessment,
  isOpen,
  onClose,
  onAssessmentUpdated,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [investigationNotes, setInvestigationNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !assessment) return null;

  const badge = riskLevelBadges[assessment.riskLevel] || riskLevelBadges.LOW;

  const handleAction = (
    actionType: "REQUEST_VERIFICATION" | "APPROVE_DELIVERY" | "HOLD_DELIVERY" | "REJECT_DELIVERY" | "MARK_INVESTIGATED" | "ESCALATE",
    resultingStatus: ExplainableRiskAssessment["investigationStatus"]
  ) => {
    setIsSubmitting(true);

    try {
      // 1. Append immutable audit action
      const loggedAction = FraudAuditService.logAction({
        transactionId: assessment.transactionId,
        beneficiaryId: assessment.beneficiaryId,
        adminEmail: user?.email || "admin@click2ration.gov",
        adminName: user?.name || "Administrator",
        adminRole: user?.role || "SUPER_ADMIN",
        action: actionType,
        notes: investigationNotes || `Administrative decision executed: ${actionType.replace("_", " ")}`,
        previousRiskScore: assessment.overallRiskScore,
        resultingDecision:
          actionType === "APPROVE_DELIVERY"
            ? "NORMAL"
            : actionType === "HOLD_DELIVERY"
            ? "INVESTIGATION"
            : actionType === "REQUEST_VERIFICATION"
            ? "ADDITIONAL_VERIFICATION"
            : "ADMIN_REVIEW",
        district: assessment.district,
        shop: assessment.shopName,
      });

      // 2. Adjust dynamic trust score if approved or confirmed held
      if (actionType === "APPROVE_DELIVERY") {
        RationDnaService.updateTrustScore(assessment.beneficiaryId, 4, "Verified and approved by admin");
      } else if (actionType === "HOLD_DELIVERY" || actionType === "REJECT_DELIVERY") {
        RationDnaService.updateTrustScore(assessment.beneficiaryId, -15, "Confirmed behavioral anomaly on hold");
      }

      // 3. Update local assessment
      const updated: ExplainableRiskAssessment = {
        ...assessment,
        investigationStatus: resultingStatus,
        investigationNotes: [
          ...(assessment.investigationNotes || []),
          investigationNotes || `Action executed: ${actionType}`,
        ],
        reviewedAt: new Date().toISOString(),
        assignedInvestigator: user?.name,
      };

      if (onAssessmentUpdated) {
        onAssessmentUpdated(updated);
      }

      toast({
        title: "Action Recorded",
        description: `Audit Log #${loggedAction.id} committed successfully.`,
      });

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      toast({
        title: "Action Failed",
        description: "Could not commit audit record to local ledger.",
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
          className="w-full max-w-3xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${badge.bg}`}>
                <ShieldAlert className={`w-5 h-5 ${badge.text}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">
                    Pre-Delivery Risk Assessment: {assessment.transactionId}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Beneficiary: <span className="font-mono text-foreground font-medium">{assessment.beneficiaryId}</span> ({assessment.anonymizedCardId}) · {assessment.shopName}, {assessment.district}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {/* False Positive Protection Notice */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">AI Decision Support Notice: </span>
                <span>
                  This risk score is an algorithmic decision-support signal. An anomaly does not constitute legal proof of fraud. Human administrative verification is required prior to enforcement.
                </span>
              </div>
            </div>

            {/* Score & Pre-Delivery Gatekeeper Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-center">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                  Calculated Risk Score
                </span>
                <div className="flex items-baseline justify-center gap-1 mt-1">
                  <span className={`text-3xl font-extrabold ${badge.text}`}>
                    {assessment.overallRiskScore}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Level 1 ({assessment.level1Score}) + Level 2 ({assessment.level2Score}) + Level 3 ({assessment.level3Score})
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-center">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                  Pre-Delivery Recommendation
                </span>
                <p className="text-sm font-bold text-foreground mt-2 uppercase tracking-wide">
                  {assessment.preDeliveryDecision.replace("_", " ")}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {assessment.preDeliveryDecision === "INVESTIGATION"
                    ? "Hold delivery consignment immediately"
                    : assessment.preDeliveryDecision === "ADDITIONAL_VERIFICATION"
                    ? "Dispatch conditional on secondary OTP"
                    : "Authorize standard consignment"}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-center">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                  Beneficiary Trust Score
                </span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-xl font-bold text-foreground">
                    {assessment.currentTrustScore}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  <span
                    className={`text-xl font-bold flex items-center ${
                      assessment.projectedTrustScore < assessment.currentTrustScore
                        ? "text-destructive"
                        : "text-success"
                    }`}
                  >
                    {assessment.projectedTrustScore}
                    {assessment.projectedTrustScore < assessment.currentTrustScore ? (
                      <TrendingDown className="w-3.5 h-3.5 ml-0.5" />
                    ) : (
                      <TrendingUp className="w-3.5 h-3.5 ml-0.5" />
                    )}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Trust score adjusts dynamically post-review
                </p>
              </div>
            </div>

            {/* Natural Language Explanation */}
            <div className="p-3.5 rounded-lg bg-muted/20 border border-border">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Explainable Risk Summary
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {assessment.plainLanguageExplanation}
              </p>
            </div>

            {/* Why was this flagged? Feature Contributions Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2.5">
                Why was this flagged? (Feature Risk Contributions)
              </h4>
              <div className="space-y-2">
                {assessment.featureContributions.length > 0 ? (
                  assessment.featureContributions.map((fc, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/80 text-xs"
                    >
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{fc.featureName}</span>
                          <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                            {fc.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{fc.detail}</p>
                      </div>
                      <div className="px-2 py-1 rounded bg-destructive/10 text-destructive font-mono font-bold shrink-0">
                        +{fc.points} pts
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20 text-xs text-success flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>No statistical anomalies detected. Transaction is within historical variance.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-3 rounded-lg bg-muted/20 border border-border">
              <div>
                <span className="text-muted-foreground text-[10px] block">Commodity</span>
                <span className="font-semibold text-foreground">{assessment.commodity}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block">Quantity</span>
                <span className="font-semibold text-foreground">
                  {assessment.quantity} {assessment.unit}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block">Delivery Agent</span>
                <span className="font-medium text-foreground">{assessment.deliveryAgentName}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block">Timestamp</span>
                <span className="font-mono text-muted-foreground">
                  {new Date(assessment.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            {/* Investigation Notes Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Administrative Investigation Notes</span>
                <span className="text-[10px] text-muted-foreground">Committed to immutable audit log</span>
              </label>
              <textarea
                value={investigationNotes}
                onChange={(e) => setInvestigationNotes(e.target.value)}
                placeholder="Enter field audit observations, beneficiary verification notes, or reason for hold..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between flex-wrap gap-2">
            <div className="text-[11px] text-muted-foreground">
              Current Status:{" "}
              <span className="font-semibold text-foreground uppercase">
                {assessment.investigationStatus.replace("_", " ")}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                disabled={isSubmitting}
                onClick={() => handleAction("REQUEST_VERIFICATION", "ADDITIONAL_VERIFICATION_REQUESTED")}
                className="px-3 py-1.5 text-xs font-medium bg-info/10 text-info border border-info/30 rounded-md hover:bg-info/20 transition-colors flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Require Extra OTP
              </button>

              <button
                disabled={isSubmitting}
                onClick={() => handleAction("HOLD_DELIVERY", "HELD")}
                className="px-3 py-1.5 text-xs font-medium bg-destructive/10 text-destructive border border-destructive/30 rounded-md hover:bg-destructive/20 transition-colors flex items-center gap-1.5"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                Hold Delivery
              </button>

              <button
                disabled={isSubmitting}
                onClick={() => handleAction("APPROVE_DELIVERY", "APPROVED")}
                className="px-3 py-1.5 text-xs font-medium bg-success text-success-foreground rounded-md hover:bg-success/90 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Authorize Dispatch
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
