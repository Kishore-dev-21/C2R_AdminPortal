export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type PreDeliveryDecision =
  | "NORMAL"
  | "ADDITIONAL_VERIFICATION"
  | "ADMIN_REVIEW"
  | "INVESTIGATION";

export interface RationDnaProfile {
  beneficiaryId: string;
  anonymizedCardId: string;
  district: string;
  primaryShopId: string;
  primaryShopName: string;
  hasSufficientHistory: boolean;
  totalHistoricalTransactions: number;
  averageMonthlyQuantityKg: number;
  typicalCommodityMix: Record<string, number>;
  typicalOrderDayOfMonth: number[];
  typicalOrderHourWindow: [number, number];
  typicalDeliveryRadiusKm: number;
  preferredDeliveryAgentIds: string[];
  historicalVerificationSuccessRate: number;
  trustScore: number;
  lastActiveDate: string;
}

export interface FeatureContribution {
  featureName: string;
  points: number;
  category: "QUANTITY" | "TIMING" | "LOCATION" | "VERIFICATION" | "NETWORK" | "HISTORICAL";
  detail: string;
}

export interface PreDeliveryCheckRequest {
  transactionId: string;
  beneficiaryId: string;
  shopId: string;
  shopName: string;
  district: string;
  deliveryAgentId: string;
  deliveryAgentName: string;
  commodity: string;
  quantity: number;
  unit: string;
  timestamp: string;
  failedVerificationAttempts?: number;
  recentOrdersLast7Days?: number;
}

export interface PreDeliveryCheckResponse {
  transactionId: string;
  beneficiaryId: string;
  anonymizedCardId: string;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  preDeliveryDecision: PreDeliveryDecision;
  level1Score: number;
  level2Score: number;
  level3Score: number;
  featureContributions: FeatureContribution[];
  plainLanguageExplanation: string;
  hasSufficientHistory: boolean;
  currentTrustScore: number;
  projectedTrustScore: number;
  timestamp: string;
}

export interface AdminInvestigationActionPayload {
  transactionId: string;
  beneficiaryId: string;
  adminEmail: string;
  adminName: string;
  adminRole: string;
  action: "REQUEST_VERIFICATION" | "APPROVE_DELIVERY" | "HOLD_DELIVERY" | "REJECT_DELIVERY" | "MARK_INVESTIGATED" | "ADD_NOTE" | "ESCALATE";
  notes: string;
  previousRiskScore: number;
  resultingDecision: PreDeliveryDecision;
  district: string;
  shop?: string;
}
