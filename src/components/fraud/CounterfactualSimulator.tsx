import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sliders,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { FraudChain } from "@/services/fraudEngine/types";
import { FraudChainService } from "@/services/fraudEngine/fraudChainService";

interface CounterfactualSimulatorProps {
  chain: FraudChain;
}

export const CounterfactualSimulator: React.FC<CounterfactualSimulatorProps> = ({
  chain,
}) => {
  // Set of factor names that the administrator has temporarily disabled in simulation
  const [disabledFactors, setDisabledFactors] = useState<string[]>([]);

  const simulationResult = FraudChainService.simulateCounterfactual(
    chain.id,
    disabledFactors
  );

  const toggleFactor = (factorName: string) => {
    setDisabledFactors((prev) =>
      prev.includes(factorName)
        ? prev.filter((f) => f !== factorName)
        : [...prev, factorName]
    );
  };

  const handleReset = () => {
    setDisabledFactors([]);
  };

  const riskReduction = chain.riskScore - simulationResult.simulatedRiskScore;

  return (
    <div className="space-y-4 p-5 rounded-xl border border-primary/20 bg-card">
      {/* Header & Disclaimer */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Sliders className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-foreground">
              What Drives This Risk? (Counterfactual Investigation Simulation)
            </h4>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Analytically simulate the removal of individual evidence signals to identify primary drivers and test hypothesis sensitivity.
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={disabledFactors.length === 0}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-muted hover:bg-muted/80 text-muted-foreground transition-colors disabled:opacity-40"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Simulation</span>
        </button>
      </div>

      {/* Analytical Disclaimer Notice */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-info/10 border border-info/20 text-xs text-info">
        <HelpCircle className="w-4 h-4 shrink-0" />
        <span className="font-medium">
          Counterfactual simulation — does not modify actual risk, database records, or trust scores.
        </span>
      </div>

      {/* Comparison Score Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-muted/30 border border-border text-center">
        <div>
          <span className="text-[10px] uppercase font-semibold text-muted-foreground">
            Actual Chain Risk
          </span>
          <div className="text-2xl font-black text-destructive mt-0.5">
            {chain.riskScore} <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Baseline with all evidence</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-muted-foreground">
            Simulated Counterfactual Risk
          </span>
          <div className="text-2xl font-black text-primary mt-0.5 flex items-center justify-center gap-1.5">
            <span>{simulationResult.simulatedRiskScore}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
            {riskReduction > 0 && (
              <span className="text-xs font-bold text-success flex items-center">
                (-{riskReduction})
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {disabledFactors.length} factor(s) excluded
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-muted-foreground">
            Simulated Risk Band
          </span>
          <div className="text-sm font-bold text-foreground mt-2 uppercase tracking-wide">
            {simulationResult.simulatedRiskScore >= 85
              ? "CRITICAL (HOLD)"
              : simulationResult.simulatedRiskScore >= 70
              ? "HIGH (ADMIN REVIEW)"
              : simulationResult.simulatedRiskScore >= 40
              ? "MEDIUM (EXTRA OTP)"
              : "LOW RISK (NORMAL PASS)"}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {simulationResult.simulatedRiskScore < 70
              ? "Pre-delivery hold would be lifted"
              : "Pre-delivery hold remains active"}
          </span>
        </div>
      </div>

      {/* Evidence Factor Toggles */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
          Toggle Evidence Signals to Simulate Sensitivity:
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {chain.evidenceContributions.map((ev) => {
            const isExcluded = disabledFactors.includes(ev.factorName);
            const simInfo = simulationResult.simulations.find((s) => s.factorName === ev.factorName);

            return (
              <div
                key={ev.id}
                onClick={() => toggleFactor(ev.factorName)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isExcluded
                    ? "bg-muted/10 border-border opacity-50 line-through"
                    : "bg-card border-border hover:border-primary"
                }`}
              >
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!isExcluded}
                      onChange={() => {}}
                      className="rounded border-border text-primary focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">{ev.factorName}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground pl-5">{ev.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-destructive">+{ev.points} pts</span>
                  {simInfo && (
                    <span className="text-[9px] uppercase font-bold block text-muted-foreground mt-0.5">
                      {simInfo.significance.replace("_", " ")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Insight */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-foreground flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-primary">Analytical Driver Conclusion: </span>
          <span className="text-muted-foreground">{simulationResult.strongestDriversSummary}</span>
        </div>
      </div>
    </div>
  );
};
