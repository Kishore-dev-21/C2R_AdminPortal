import { RationDnaProfile } from "./types";

/**
 * Ration DNA Service
 * Constructs and retrieves behavioral baselines for beneficiaries.
 * If insufficient history exists (< 3 transactions), explicitly flags 'hasSufficientHistory = false'
 * to avoid fabricating historical data.
 */

// Baseline database of representative beneficiary Ration DNA profiles
const rationDnaStore: Map<string, RationDnaProfile> = new Map([
  [
    "BEN-TN-CHE-00101",
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
      preferredDeliveryAgentIds: ["AGT-CHE-01", "AGT-CHE-02"],
      historicalVerificationSuccessRate: 0.99,
      avgFailedAttemptsBeforeSuccess: 0.1,
      trustScore: 95,
      trustScoreStatus: "EXCELLENT",
      lastActiveDate: "2026-02-04",
    },
  ],
  [
    "BEN-TN-CHE-00102",
    {
      beneficiaryId: "BEN-TN-CHE-00102",
      anonymizedCardId: "RC-CHE-***4401",
      district: "Chennai",
      primaryShopId: "s1",
      primaryShopName: "Anna Nagar FPS",
      hasSufficientHistory: true,
      totalHistoricalTransactions: 14,
      averageMonthlyQuantityKg: 18,
      typicalCommodityMix: { Rice: 12, Sugar: 2, CookingOil: 2, Salt: 2 },
      typicalOrderDayOfMonth: [3, 4, 5, 6],
      typicalOrderHourWindow: [10, 14],
      typicalDeliveryRadiusKm: 2.1,
      preferredDeliveryAgentIds: ["AGT-CHE-01"],
      historicalVerificationSuccessRate: 0.96,
      avgFailedAttemptsBeforeSuccess: 0.2,
      trustScore: 92,
      trustScoreStatus: "EXCELLENT",
      lastActiveDate: "2026-02-05",
    },
  ],
  [
    "BEN-TN-CHE-00103",
    {
      beneficiaryId: "BEN-TN-CHE-00103",
      anonymizedCardId: "RC-CHE-***7712",
      district: "Chennai",
      primaryShopId: "s1",
      primaryShopName: "Anna Nagar FPS",
      hasSufficientHistory: true,
      totalHistoricalTransactions: 12,
      averageMonthlyQuantityKg: 22,
      typicalCommodityMix: { Rice: 16, Sugar: 3, Wheat: 3 },
      typicalOrderDayOfMonth: [2, 3, 4],
      typicalOrderHourWindow: [9, 11],
      typicalDeliveryRadiusKm: 1.8,
      preferredDeliveryAgentIds: ["AGT-CHE-01"],
      historicalVerificationSuccessRate: 0.98,
      avgFailedAttemptsBeforeSuccess: 0.1,
      trustScore: 89,
      trustScoreStatus: "STABLE",
      lastActiveDate: "2026-02-03",
    },
  ],
  [
    // Beneficiary exhibiting behavioral drift in the demo
    "BEN-TN-MDU-00842",
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
      avgFailedAttemptsBeforeSuccess: 0.1,
      trustScore: 78,
      trustScoreStatus: "DEGRADING",
      lastActiveDate: "2026-01-28",
    },
  ],
  [
    // Beneficiary in collusion ring
    "BEN-TN-MDU-00843",
    {
      beneficiaryId: "BEN-TN-MDU-00843",
      anonymizedCardId: "RC-MDU-***8821",
      district: "Madurai",
      primaryShopId: "s4",
      primaryShopName: "Madurai Main FPS",
      hasSufficientHistory: true,
      totalHistoricalTransactions: 9,
      averageMonthlyQuantityKg: 14,
      typicalCommodityMix: { Rice: 10, Sugar: 2, CookingOil: 2 },
      typicalOrderDayOfMonth: [2, 3, 4],
      typicalOrderHourWindow: [9, 12],
      typicalDeliveryRadiusKm: 1.6,
      preferredDeliveryAgentIds: ["AGT-MDU-01"],
      historicalVerificationSuccessRate: 0.94,
      avgFailedAttemptsBeforeSuccess: 0.2,
      trustScore: 74,
      trustScoreStatus: "DEGRADING",
      lastActiveDate: "2026-02-02",
    },
  ],
  [
    // Beneficiary in collusion ring
    "BEN-TN-MDU-00844",
    {
      beneficiaryId: "BEN-TN-MDU-00844",
      anonymizedCardId: "RC-MDU-***3190",
      district: "Madurai",
      primaryShopId: "s4",
      primaryShopName: "Madurai Main FPS",
      hasSufficientHistory: true,
      totalHistoricalTransactions: 11,
      averageMonthlyQuantityKg: 16,
      typicalCommodityMix: { Rice: 12, Sugar: 2, Wheat: 2 },
      typicalOrderDayOfMonth: [1, 2, 4],
      typicalOrderHourWindow: [10, 13],
      typicalDeliveryRadiusKm: 1.4,
      preferredDeliveryAgentIds: ["AGT-MDU-01"],
      historicalVerificationSuccessRate: 0.97,
      avgFailedAttemptsBeforeSuccess: 0.1,
      trustScore: 76,
      trustScoreStatus: "DEGRADING",
      lastActiveDate: "2026-02-01",
    },
  ],
  [
    // New card / Migrant: Insufficient history
    "BEN-TN-SLM-00999",
    {
      beneficiaryId: "BEN-TN-SLM-00999",
      anonymizedCardId: "RC-SLM-***0012",
      district: "Salem",
      primaryShopId: "s6",
      primaryShopName: "Salem Market FPS",
      hasSufficientHistory: false, // Insufficient data!
      totalHistoricalTransactions: 1,
      averageMonthlyQuantityKg: 0,
      typicalCommodityMix: {},
      typicalOrderDayOfMonth: [],
      typicalOrderHourWindow: [0, 0],
      typicalDeliveryRadiusKm: 0,
      preferredDeliveryAgentIds: [],
      historicalVerificationSuccessRate: 1.0,
      avgFailedAttemptsBeforeSuccess: 0,
      trustScore: 60,
      trustScoreStatus: "PROBATIONARY",
      lastActiveDate: "2026-03-01",
    },
  ],
  [
    // Normal Coimbatore beneficiary
    "BEN-TN-CBE-00401",
    {
      beneficiaryId: "BEN-TN-CBE-00401",
      anonymizedCardId: "RC-CBE-***5120",
      district: "Coimbatore",
      primaryShopId: "s5",
      primaryShopName: "Coimbatore Central FPS",
      hasSufficientHistory: true,
      totalHistoricalTransactions: 24,
      averageMonthlyQuantityKg: 25,
      typicalCommodityMix: { Rice: 18, Wheat: 5, Sugar: 2 },
      typicalOrderDayOfMonth: [1, 2, 3, 4],
      typicalOrderHourWindow: [8, 11],
      typicalDeliveryRadiusKm: 1.9,
      preferredDeliveryAgentIds: ["AGT-CBE-01"],
      historicalVerificationSuccessRate: 0.99,
      avgFailedAttemptsBeforeSuccess: 0.05,
      trustScore: 98,
      trustScoreStatus: "EXCELLENT",
      lastActiveDate: "2026-02-08",
    },
  ],
]);

export class RationDnaService {
  /**
   * Retrieves behavioral DNA for a given beneficiary ID.
   */
  public static getProfile(beneficiaryId: string): RationDnaProfile {
    const existing = rationDnaStore.get(beneficiaryId);
    if (existing) return existing;

    // Default fallback for unknown beneficiary with insufficient history
    return {
      beneficiaryId,
      anonymizedCardId: `RC-NEW-***${beneficiaryId.slice(-4)}`,
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
      avgFailedAttemptsBeforeSuccess: 0,
      trustScore: 60,
      trustScoreStatus: "PROBATIONARY",
      lastActiveDate: new Date().toISOString().split("T")[0],
    };
  }

  /**
   * Lists all stored Ration DNA profiles.
   */
  public static getAllProfiles(): RationDnaProfile[] {
    return Array.from(rationDnaStore.values());
  }

  /**
   * Dynamically adjusts trust score based on verified transactions or confirmed anomalies.
   */
  public static updateTrustScore(
    beneficiaryId: string,
    delta: number,
    reason: string
  ): RationDnaProfile {
    const profile = this.getProfile(beneficiaryId);
    const newScore = Math.max(0, Math.min(100, profile.trustScore + delta));
    
    let trustScoreStatus: RationDnaProfile["trustScoreStatus"] = "STABLE";
    if (newScore >= 90) trustScoreStatus = "EXCELLENT";
    else if (newScore >= 75) trustScoreStatus = "STABLE";
    else if (newScore >= 50) trustScoreStatus = "DEGRADING";
    else trustScoreStatus = "PROBATIONARY";

    const updated: RationDnaProfile = {
      ...profile,
      trustScore: newScore,
      trustScoreStatus,
    };

    rationDnaStore.set(beneficiaryId, updated);
    return updated;
  }
}
