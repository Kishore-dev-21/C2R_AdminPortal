import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Dna,
  Shield,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  CheckCircle,
} from "lucide-react";
import { RationDnaProfile } from "@/services/fraudEngine/types";
import { RationDnaService } from "@/services/fraudEngine/rationDnaService";

interface RationDnaViewerProps {
  districtFilter?: string;
  onSelectBeneficiary?: (beneficiaryId: string) => void;
}

export const RationDnaViewer: React.FC<RationDnaViewerProps> = ({
  districtFilter,
  onSelectBeneficiary,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<RationDnaProfile | null>(null);

  const allProfiles = RationDnaService.getAllProfiles();

  const filteredProfiles = allProfiles.filter((p) => {
    if (districtFilter && districtFilter !== "All" && p.district !== districtFilter) return false;
    if (searchQuery) {
      return (
        p.beneficiaryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.anonymizedCardId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.primaryShopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.district.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const activeProfile = selectedProfile || filteredProfiles[0] || null;

  return (
    <div className="space-y-4">
      {/* Top Search Filter */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-muted/40 rounded-lg border border-border">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Beneficiary ID or Ration Card..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary w-64"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredProfiles.length}</span> Ration DNA profiles
        </div>
      </div>

      {/* Split View: Profile List + Detail Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile Master List */}
        <div className="md:col-span-1 border border-border rounded-xl bg-card overflow-hidden h-[500px] flex flex-col">
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Beneficiary Directory
            </span>
            <Dna className="w-4 h-4 text-primary" />
          </div>
          <div className="overflow-y-auto p-2 space-y-1.5 flex-1">
            {filteredProfiles.map((p) => {
              const isSelected = activeProfile?.beneficiaryId === p.beneficiaryId;
              return (
                <div
                  key={p.beneficiaryId}
                  onClick={() => setSelectedProfile(p)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? "bg-primary/10 border-primary text-foreground font-medium"
                      : "bg-background border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-foreground font-semibold">{p.beneficiaryId}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        p.trustScoreStatus === "EXCELLENT"
                          ? "bg-success/15 text-success"
                          : p.trustScoreStatus === "STABLE"
                          ? "bg-info/15 text-info"
                          : p.trustScoreStatus === "DEGRADING"
                          ? "bg-warning/15 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      Trust: {p.trustScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span>{p.primaryShopName}</span>
                    <span>{p.district}</span>
                  </div>
                  {!p.hasSufficientHistory && (
                    <span className="inline-block mt-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded font-medium">
                      Insufficient historical data
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Detail Deep Dive */}
        <div className="md:col-span-2 border border-border rounded-xl bg-card p-5 overflow-y-auto h-[500px]">
          {activeProfile ? (
            <div className="space-y-5">
              {/* Profile Header */}
              <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">
                      {activeProfile.beneficiaryId}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {activeProfile.anonymizedCardId}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Assigned Hub: <strong className="text-foreground">{activeProfile.primaryShopName}</strong> ({activeProfile.district} District)
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Dynamic Trust Score
                  </span>
                  <div className="flex items-baseline justify-end gap-1">
                    <span
                      className={`text-2xl font-black ${
                        activeProfile.trustScore >= 80
                          ? "text-success"
                          : activeProfile.trustScore >= 60
                          ? "text-info"
                          : "text-warning"
                      }`}
                    >
                      {activeProfile.trustScore}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Status: {activeProfile.trustScoreStatus}
                  </span>
                </div>
              </div>

              {/* Insufficient Data Banner if applicable */}
              {!activeProfile.hasSufficientHistory && (
                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Insufficient Historical Data</strong>
                    <p className="mt-0.5 text-muted-foreground">
                      This ration card has fewer than 3 verified historical distribution events. Behavioral drift algorithms are bypassed to avoid synthetic scoring bias. First-tier physical biometric authentication applies.
                    </p>
                  </div>
                </div>
              )}

              {/* Behavioral Baseline Attributes */}
              {activeProfile.hasSufficientHistory && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Ration DNA Behavioral Fingerprint
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                        Monthly Average Volume
                      </span>
                      <span className="text-sm font-bold text-foreground mt-1 block">
                        {activeProfile.averageMonthlyQuantityKg} kg / month
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {activeProfile.totalHistoricalTransactions} verified distributions
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                        Preferred Time Window
                      </span>
                      <span className="text-sm font-bold text-foreground mt-1 block">
                        {activeProfile.typicalOrderHourWindow[0]}:00 - {activeProfile.typicalOrderHourWindow[1]}:00
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Days {activeProfile.typicalOrderDayOfMonth.join(", ")} of month
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                        Verification Reliability
                      </span>
                      <span className="text-sm font-bold text-foreground mt-1 block">
                        {(activeProfile.historicalVerificationSuccessRate * 100).toFixed(0)}% First-Pass
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {activeProfile.avgFailedAttemptsBeforeSuccess} avg retries
                      </span>
                    </div>
                  </div>

                  {/* Typical Commodity Mix Breakdown */}
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                      Typical Commodity Mix Allocation
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(activeProfile.typicalCommodityMix).map(([commodity, qty]) => (
                        <div key={commodity} className="p-2.5 rounded bg-muted/20 border border-border text-xs">
                          <span className="text-muted-foreground text-[10px] block">{commodity}</span>
                          <span className="font-bold text-foreground">{qty} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-muted-foreground">
              Select a beneficiary to inspect their behavioral Ration DNA baseline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
