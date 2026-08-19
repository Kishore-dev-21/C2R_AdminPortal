import {
  RationDnaProfile,
  PreDeliveryCheckRequest,
  PreDeliveryCheckResponse,
  FeatureContribution,
  RiskLevel,
  PreDeliveryDecision,
  AdminInvestigationActionPayload,
} from "../types/fraudIntelligence";

const initialProfiles: RationDnaProfile[] = [
  {
    beneficiaryId: "BEN-TN-CHE-00101",
    anonymizedCardId: "RC-CHE-***9182",
    district: "Chennai",
    primaryShopId: "s1",
    primaryShopName: "Anna Nagar FPS",
    hasSufficientHistory: true,
    totalHistoricalTransactions: 18,
    averageMonthlyQuantityKg: 20,
    typicalCommodityMix: { Rice: 15, Sugar: 2, Wheat: 3 },
    typicalOrderDayOfMonth: [1, 2, 3, 4, 5],
    typicalOrderHourWindow: [9, 12],
    typicalDeliveryRadiusKm: 1.5,
    preferredDeliveryAgentIds: ["AGT-CHE-01"],
    historicalVerificationSuccessRate: 0.99,
    trustScore: 95,
    lastActiveDate: "2026-02-04",
  },
  {
    beneficiaryId: "BEN-TN-MDU-00842",
    anonymizedCardId: "RC-MDU-***6129",
    district: "Madurai",
    primaryShopId: "s4",
    primaryShopName: "Madurai Main FPS",
    hasSufficientHistory: true,
    totalHistoricalTransactions: 16,
    averageMonthlyQuantityKg: 15,
    typicalCommodityMix: { Rice: 10, Sugar: 2, CookingOil: 1, Wheat: 2 },
    typicalOrderDayOfMonth: [1, 2, 3],
    typicalOrderHourWindow: [8, 11],
    typicalDeliveryRadiusKm: 1.2,
    preferredDeliveryAgentIds: ["AGT-MDU-01"],
    historicalVerificationSuccessRate: 0.95,
    trustScore: 78,
    lastActiveDate: "2026-01-28",
  },
  {
    beneficiaryId: "BEN-TN-SLM-00999",
    anonymizedCardId: "RC-SLM-***0012",
    district: "Salem",
    primaryShopId: "s6",
    primaryShopName: "Salem Market FPS",
    hasSufficientHistory: false,
    totalHistoricalTransactions: 1,
    averageMonthlyQuantityKg: 0,
    typicalCommodityMix: {},
    typicalOrderDayOfMonth: [],
    typicalOrderHourWindow: [0, 0],
    typicalDeliveryRadiusKm: 0,
    preferredDeliveryAgentIds: [],
    historicalVerificationSuccessRate: 1.0,
    trustScore: 60,
    lastActiveDate: "2026-03-01",
  },
];

const rationDnaStore: Map<string, RationDnaProfile> = new Map(
  initialProfiles.map((p) => [p.beneficiaryId, p])
);

export class FraudIntelligenceService {
  /**
   * Retrieves Ration DNA profile
   */
  public static getRationDna(beneficiaryId: string): RationDnaProfile {
    const existing = rationDnaStore.get(beneficiaryId);
    if (existing) return existing;

    return {
      beneficiaryId,
      anonymizedCardId: `RC-***${beneficiaryId.slice(-4)}`,
      district: "Unknown",
      primaryShopId: "s1",
      primaryShopName: "Unassigned FPS",
      hasSufficientHistory: false,
      totalHistoricalTransactions: 0,
      averageMonthlyQuantityKg: 0,
      typicalCommodityMix: {},
      typicalOrderDayOfMonth: [],
      typicalOrderHourWindow: [0, 0],
      typicalDeliveryRadiusKm: 0,
      preferredDeliveryAgentIds: [],
      historicalVerificationSuccessRate: 1.0,
      trustScore: 60,
      lastActiveDate: new Date().toISOString().split("T")[0],
    };
  }

  /**
   * Pre-delivery multi-signal scoring
   */
  public static evaluatePreDelivery(req: PreDeliveryCheckRequest): PreDeliveryCheckResponse {
    const profile = this.getRationDna(req.beneficiaryId);
    const featureContributions: FeatureContribution[] = [];
    let score = 0;
    let level1 = 0;
    let level2 = 0;
    let level3 = 0;

    if (!profile.hasSufficientHistory) {
      featureContributions.push({
        featureName: "Insufficient Historical Baseline",
        points: 25,
        category: "HISTORICAL",
        detail: "Beneficiary has fewer than 3 historical transactions. Initial baseline probation.",
      });
      score = 25;
    } else {
      // 1. Quantity drift
      const baselineQty = profile.typicalCommodityMix[req.commodity] || 10;
      const qtyDevPct = Math.round(((req.quantity - baselineQty) / baselineQty) * 100);
      if (qtyDevPct > 100) {
        const pts = 26;
        level2 += pts;
        featureContributions.push({
          featureName: "Commodity Quantity Surge",
          points: pts,
          category: "QUANTITY",
          detail: `Requested quantity is ${qtyDevPct}% higher than baseline of ${baselineQty} ${req.unit}.`,
        });
      }

      // 2. Timing drift
      const txHour = new Date(req.timestamp).getHours();
      const [startH, endH] = profile.typicalOrderHourWindow;
      if (txHour < startH - 2 || txHour > endH + 2) {
        const pts = 21;
        level2 += pts;
        featureContributions.push({
          featureName: "Transaction Timing Anomaly",
          points: pts,
          category: "TIMING",
          detail: `Transaction initiated at ${txHour}:00, outside historical active window (${startH}:00-${endH}:00).`,
        });
      }

      // 3. Location / Shop jump
      if (req.shopId !== profile.primaryShopId) {
        const pts = 28;
        level2 += pts;
        featureContributions.push({
          featureName: "Unusual Shop Location",
          points: pts,
          category: "LOCATION",
          detail: `Order routed via ${req.shopName} instead of designated primary FPS (${profile.primaryShopName}).`,
        });
      }

      // 4. Verification retries
      if ((req.failedVerificationAttempts || 0) >= 2) {
        const pts = 17;
        level1 += pts;
        featureContributions.push({
          featureName: "Multiple Verification Failures",
          points: pts,
          category: "VERIFICATION",
          detail: `${req.failedVerificationAttempts} failed authentication attempts recorded before authorization.`,
        });
      }

      // 5. Collusion / Network Link
      if (req.shopId === "s4" && (req.beneficiaryId.includes("MDU") || req.deliveryAgentId.includes("MDU"))) {
        const pts = 24;
        level3 += pts;
        featureContributions.push({
          featureName: "Collusion Cluster Association",
          points: pts,
          category: "NETWORK",
          detail: "High co-occurrence link with suspicious cluster CLUSTER-MDU-01 (Agent AGT-17).",
        });
      }

      score = Math.min(100, level1 + level2 + level3);
    }

    let riskLevel: RiskLevel = "LOW";
    let preDeliveryDecision: PreDeliveryDecision = "NORMAL";

    if (score >= 85) {
      riskLevel = "CRITICAL";
      preDeliveryDecision = "INVESTIGATION";
    } else if (score >= 70) {
      riskLevel = "HIGH";
      preDeliveryDecision = "ADMIN_REVIEW";
    } else if (score >= 40) {
      riskLevel = "MEDIUM";
      preDeliveryDecision = "ADDITIONAL_VERIFICATION";
    }

    const plainLanguageExplanation =
      !profile.hasSufficientHistory
        ? "Insufficient historical data to compute a full behavioral baseline. Standard biometric verification recommended."
        : riskLevel === "CRITICAL" || riskLevel === "HIGH"
        ? "This transaction significantly differs from the beneficiary's historical behavioral pattern. Automated hold placed pending administrative verification."
        : riskLevel === "MEDIUM"
        ? "Minor deviations detected. Additional verification OTP required before delivery dispatch."
        : "Transaction is fully consistent with beneficiary historical Ration DNA.";

    return {
      transactionId: req.transactionId,
      beneficiaryId: req.beneficiaryId,
      anonymizedCardId: profile.anonymizedCardId,
      overallRiskScore: score,
      riskLevel,
      preDeliveryDecision,
      level1Score: level1,
      level2Score: level2,
      level3Score: level3,
      featureContributions,
      plainLanguageExplanation,
      hasSufficientHistory: profile.hasSufficientHistory,
      currentTrustScore: profile.trustScore,
      projectedTrustScore: riskLevel === "CRITICAL" ? profile.trustScore - 20 : profile.trustScore + 2,
      timestamp: new Date().toISOString(),
    };
  }
}
