import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldAlert,
  FileCheck,
} from "lucide-react";
import { ExplainableRiskAssessment } from "@/services/fraudEngine/types";

interface SyntheticDemoControllerProps {
  onStepChange?: (stepIndex: number) => void;
  onOpenAssessment?: (assessmentId: string) => void;
}

export const demoSteps = [
  {
    step: 1,
    title: "1. Baseline Established (Ration DNA)",
    desc: "Multiple normal beneficiaries have verified historical Ration DNA fingerprints (average ~15-20 kg/month, 9-11 AM window, 99% OTP success rate).",
    badge: "Normal State",
  },
  {
    step: 2,
    title: "2. Normal Pre-Delivery Authorization",
    desc: "Beneficiary BEN-CHE-101 places a 20kg Rice order. Engine verifies against historical Ration DNA: 0 drift detected, Risk Score: 12/100 -> NORMAL Pass.",
    badge: "Level 1/2 Pass",
  },
  {
    step: 3,
    title: "3. Behavioral Drift Occurs",
    desc: "Beneficiary BEN-MDU-842 suddenly orders 80L Cooking Oil (160% surge) at an off-peak hour with 2 consecutive failed OTP authentication attempts.",
    badge: "Behavioral Drift",
  },
  {
    step: 4,
    title: "4. Multi-Transaction Convergence",
    desc: "Two additional beneficiaries (BEN-MDU-843 and BEN-MDU-844) initiate high-quantity allocations within the same 48-hour window.",
    badge: "Co-Occurrence",
  },
  {
    step: 5,
    title: "5. Collusion Graph Detection",
    desc: "Level 3 Graph Engine discovers all 3 anomalous orders are funneled through the same shop (Madurai Main FPS) and same delivery agent (Agent AGT-17).",
    badge: "Cluster Detected",
  },
  {
    step: 6,
    title: "6. Explainable AI Assessment Generated",
    desc: "Risk Engine outputs an Explainable Score of 88/100 (+26 Qty, +21 Timing, +28 Location, +24 Network). Pre-delivery decision: HOLD & INVESTIGATE.",
    badge: "Critical Alert",
  },
  {
    step: 7,
    title: "7. Human Review & Audit Logging",
    desc: "District Administrator reviews the explainable breakdown, puts the consignment on hold, logs investigation note, and trust score drops dynamically.",
    badge: "Action Logged",
  },
];

export const SyntheticDemoController: React.FC<SyntheticDemoControllerProps> = ({
  onStepChange,
  onOpenAssessment,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    const next = Math.min(demoSteps.length - 1, currentStep + 1);
    setCurrentStep(next);
    if (onStepChange) onStepChange(next);
  };

  const handleReset = () => {
    setCurrentStep(0);
    if (onStepChange) onStepChange(0);
  };

  const activeStep = demoSteps[currentStep];

  return (
    <div className="border border-amber-500/30 rounded-xl bg-amber-500/5 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            SYNTHETIC DEMO SCENARIO
          </span>
          <span className="text-xs font-bold text-foreground">
            End-to-End Fraud Intelligence Walkthrough
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-mono">
            Step {currentStep + 1} of {demoSteps.length}
          </span>
          <button
            onClick={handleReset}
            className="p-1 rounded hover:bg-muted text-muted-foreground"
            title="Reset Walkthrough"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="grid grid-cols-7 gap-1.5">
        {demoSteps.map((step, idx) => (
          <button
            key={step.step}
            onClick={() => {
              setCurrentStep(idx);
              if (onStepChange) onStepChange(idx);
            }}
            className={`h-1.5 rounded-full transition-all ${
              idx === currentStep
                ? "bg-primary"
                : idx < currentStep
                ? "bg-primary/50"
                : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Active Step Content */}
      <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap p-3 rounded-lg bg-card border border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-foreground">{activeStep.title}</h4>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
              {activeStep.badge}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{activeStep.desc}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {currentStep === 5 && onOpenAssessment && (
            <button
              onClick={() => onOpenAssessment("ORD-1003")}
              className="px-3 py-1.5 text-xs font-semibold bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
            >
              Inspect ORD-1003 Alert
            </button>
          )}

          {currentStep < demoSteps.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-semibold bg-success text-success-foreground rounded-md hover:bg-success/90 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Scenario Complete (Restart)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
