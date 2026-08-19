import { RationDnaProfile, BehavioralDriftResult, DriftSignal } from "./types";

export interface TransactionEvaluationInput {
  beneficiaryId: string;
  shopId: string;
  shopName: string;
  district: string;
  commodity: string;
  quantity: number;
  unit: string;
  timestamp: string; // ISO string
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  failedVerificationAttempts?: number;
  recentOrdersLast7Days?: number;
}

export class BehavioralDriftService {
  /**
   * Evaluates a current transaction against the beneficiary's historical Ration DNA.
   * Multi-signal statistical deviation model.
   */
  public static evaluateDrift(
    input: TransactionEvaluationInput,
    profile: RationDnaProfile
  ): BehavioralDriftResult {
    // 1. Check if sufficient baseline exists
    if (!profile.hasSufficientHistory || profile.totalHistoricalTransactions < 3) {
      return {
        hasSufficientHistory: false,
        driftSignals: [],
        quantityDeviationPct: 0,
        timingDeviationScore: 0,
        locationJumpKm: 0,
        shopDivergence: false,
        verificationFailureCount: input.failedVerificationAttempts || 0,
        velocityAnomaly: false,
        level1TransactionScore: 10, // Minimal baseline uncertainty
        level2DriftScore: 0,
      };
    }

    const driftSignals: DriftSignal[] = [];
    const txDate = new Date(input.timestamp);
    const txHour = txDate.getHours();
    const txDay = txDate.getDate();

    let level1Points = 0;
    let level2Points = 0;

    // ── Signal 1: Commodity Quantity Deviation ──
    const baselineCommodityQty = profile.typicalCommodityMix[input.commodity] || (profile.averageMonthlyQuantityKg / 2);
    const quantityDeviationPct = baselineCommodityQty > 0
      ? Math.round(((input.quantity - baselineCommodityQty) / baselineCommodityQty) * 100)
      : 0;

    if (quantityDeviationPct > 100) {
      // More than double expected
      const pts = 26;
      level2Points += pts;
      driftSignals.push({
        feature: "Commodity Quantity Surge",
        baselineValue: `${baselineCommodityQty} ${input.unit}`,
        currentValue: `${input.quantity} ${input.unit}`,
        deviationPercentage: quantityDeviationPct,
        riskPoints: pts,
        description: `Order quantity is ${quantityDeviationPct}% higher than historical baseline of ${baselineCommodityQty} ${input.unit}.`,
      });
    } else if (quantityDeviationPct > 50) {
      const pts = 16;
      level2Points += pts;
      driftSignals.push({
        feature: "Moderate Quantity Deviation",
        baselineValue: `${baselineCommodityQty} ${input.unit}`,
        currentValue: `${input.quantity} ${input.unit}`,
        deviationPercentage: quantityDeviationPct,
        riskPoints: pts,
        description: `Order quantity exceeds historical norm by ${quantityDeviationPct}%.`,
      });
    }

    // ── Signal 2: Temporal Anomaly (Hour & Day of Month) ──
    const [startHour, endHour] = profile.typicalOrderHourWindow;
    const isOffHour = txHour < startHour - 2 || txHour > endHour + 2;
    const isOffDay = profile.typicalOrderDayOfMonth.length > 0 && !profile.typicalOrderDayOfMonth.includes(txDay);

    let timingDeviationScore = 0;
    if (isOffHour && isOffDay) {
      const pts = 21;
      timingDeviationScore = 80;
      level2Points += pts;
      driftSignals.push({
        feature: "Transaction Timing Anomaly",
        baselineValue: `Days ${profile.typicalOrderDayOfMonth.join(",")} between ${startHour}:00-${endHour}:00`,
        currentValue: `Day ${txDay} at ${txHour}:00`,
        deviationPercentage: 75,
        riskPoints: pts,
        description: `Transaction initiated outside usual active temporal window (${startHour}:00-${endHour}:00) on unusual day of month.`,
      });
    } else if (isOffHour) {
      const pts = 12;
      timingDeviationScore = 45;
      level2Points += pts;
      driftSignals.push({
        feature: "Off-Peak Timing Drift",
        baselineValue: `${startHour}:00 - ${endHour}:00`,
        currentValue: `${txHour}:00`,
        deviationPercentage: 40,
        riskPoints: pts,
        description: `Transaction placed outside standard historical time window.`,
      });
    }

    // ── Signal 3: Shop & Geo Divergence ──
    const shopDivergence = input.shopId !== profile.primaryShopId;
    let locationJumpKm = 0;
    if (shopDivergence) {
      locationJumpKm = 8.5; // Estimated distance from primary shop cluster
      const pts = 28;
      level2Points += pts;
      driftSignals.push({
        feature: "Unusual Shop Location",
        baselineValue: profile.primaryShopName,
        currentValue: input.shopName,
        deviationPercentage: 100,
        riskPoints: pts,
        description: `Transaction routed through ${input.shopName} instead of designated primary shop (${profile.primaryShopName}).`,
      });
    }

    // ── Signal 4: Repeated Verification Failures ──
    const failedVerifs = input.failedVerificationAttempts || 0;
    if (failedVerifs >= 3) {
      const pts = 22;
      level1Points += pts;
      driftSignals.push({
        feature: "Multiple Verification Failures",
        baselineValue: `${(profile.historicalVerificationSuccessRate * 100).toFixed(0)}% success rate`,
        currentValue: `${failedVerifs} failed attempts`,
        deviationPercentage: failedVerifs * 25,
        riskPoints: pts,
        description: `Beneficiary encountered ${failedVerifs} consecutive OTP / biometric authentication failures before success.`,
      });
    } else if (failedVerifs > 0) {
      const pts = 8;
      level1Points += pts;
      driftSignals.push({
        feature: "Minor Verification Retries",
        baselineValue: `${(profile.historicalVerificationSuccessRate * 100).toFixed(0)}% success rate`,
        currentValue: `${failedVerifs} retry attempt`,
        deviationPercentage: 20,
        riskPoints: pts,
        description: `Recorded ${failedVerifs} authentication retry prior to authorization.`,
      });
    }

    // ── Signal 5: Velocity & Frequency Anomaly ──
    const recentOrders = input.recentOrdersLast7Days || 1;
    const velocityAnomaly = recentOrders >= 3;
    if (velocityAnomaly) {
      const pts = 18;
      level1Points += pts;
      driftSignals.push({
        feature: "High Order Velocity",
        baselineValue: "1 order / month",
        currentValue: `${recentOrders} orders in 7 days`,
        deviationPercentage: recentOrders * 100,
        riskPoints: pts,
        description: `Unusual transaction frequency: ${recentOrders} orders registered within the last 7 days.`,
      });
    }

    return {
      hasSufficientHistory: true,
      driftSignals,
      quantityDeviationPct,
      timingDeviationScore,
      locationJumpKm,
      shopDivergence,
      verificationFailureCount: failedVerifs,
      velocityAnomaly,
      level1TransactionScore: Math.min(level1Points, 40),
      level2DriftScore: Math.min(level2Points, 50),
    };
  }
}
