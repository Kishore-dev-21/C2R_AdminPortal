export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type PreDeliveryDecision =
  | "NORMAL"
  | "ADDITIONAL_VERIFICATION"
  | "ADMIN_REVIEW"
  | "INVESTIGATION";

export type NodeType =
  | "BENEFICIARY"
  | "RATION_CARD"
  | "SHOP"
  | "DISTRICT"
  | "DELIVERY_AGENT"
  | "TRANSACTION"
  | "LOCATION";

export type EdgeType =
  | "ORDERED_FROM"
  | "DELIVERED_BY"
  | "VERIFIED_AT"
  | "ASSIGNED_TO"
  | "OCCURRED_AT"
  | "REPEATED_INTERACTION";

export interface RiskThresholds {
  lowMax: number;       // e.g. 40
  mediumMax: number;    // e.g. 70
  highMax: number;      // e.g. 85
  criticalMin: number;  // e.g. 85+
}

export const DEFAULT_THRESHOLDS: RiskThresholds = {
  lowMax: 40,
  mediumMax: 70,
  highMax: 85,
  criticalMin: 85,
};

// ── Ration DNA: Behavioral Baseline ──
export interface RationDnaProfile {
  beneficiaryId: string;
  anonymizedCardId: string;
  district: string;
  primaryShopId: string;
  primaryShopName: string;
  hasSufficientHistory: boolean;
  totalHistoricalTransactions: number;
  averageMonthlyQuantityKg: number;
  typicalCommodityMix: Record<string, number>; // Commodity -> avg kg
  typicalOrderDayOfMonth: number[];            // e.g. [1, 2, 3, 4, 5] (usually first week)
  typicalOrderHourWindow: [number, number];     // e.g. [9, 13] (9 AM to 1 PM)
  typicalDeliveryRadiusKm: number;
  preferredDeliveryAgentIds: string[];
  historicalVerificationSuccessRate: number;   // e.g. 0.98 (98%)
  avgFailedAttemptsBeforeSuccess: number;
  trustScore: number;                          // 0 - 100 dynamic trust
  trustScoreStatus: "EXCELLENT" | "STABLE" | "DEGRADING" | "PROBATIONARY";
  lastActiveDate: string;
}

// ── Level 1 & 2: Behavioral Drift Vectors ──
export interface DriftSignal {
  feature: string;
  baselineValue: string | number;
  currentValue: string | number;
  deviationPercentage: number;
  riskPoints: number;
  description: string;
}

export interface BehavioralDriftResult {
  hasSufficientHistory: boolean;
  driftSignals: DriftSignal[];
  quantityDeviationPct: number;
  timingDeviationScore: number;
  locationJumpKm: number;
  shopDivergence: boolean;
  verificationFailureCount: number;
  velocityAnomaly: boolean;
  level1TransactionScore: number;
  level2DriftScore: number;
}

// ── Level 3: Graph & Collusion Vectors ──
export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  district?: string;
  isSuspicious?: boolean;
  riskScore?: number;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  weight?: number;
  isSuspicious?: boolean;
  metadata?: Record<string, any>;
}

export interface CollusionCluster {
  clusterId: string;
  shopId: string;
  shopName: string;
  agentId: string;
  agentName: string;
  district: string;
  involvedBeneficiaryIds: string[];
  suspiciousTransactionIds: string[];
  clusterRiskScore: number;
  cooccurrenceCount: number;
  reason: string;
  detectedAt: string;
}

export interface GraphCollusionResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  detectedClusters: CollusionCluster[];
  level3NetworkScore: number;
  networkTriggers: string[];
}

// ── Unified Explainable Risk Result ──
export interface FeatureContribution {
  featureName: string;
  points: number; // e.g. +32
  category: "QUANTITY" | "TIMING" | "LOCATION" | "VERIFICATION" | "NETWORK" | "HISTORICAL" | "FRAUD_CHAIN";
  detail: string;
}

export interface ExplainableRiskAssessment {
  transactionId: string;
  beneficiaryId: string;
  anonymizedCardId: string;
  shopId: string;
  shopName: string;
  district: string;
  deliveryAgentId: string;
  deliveryAgentName: string;
  commodity: string;
  quantity: number;
  unit: string;
  timestamp: string;
  
  // Scoring
  overallRiskScore: number;       // 0-100
  riskLevel: RiskLevel;
  preDeliveryDecision: PreDeliveryDecision;
  
  // Breakdown
  level1Score: number;           // Transaction-level
  level2Score: number;           // Behavioral drift
  level3Score: number;           // Network/collusion
  fraudChainScore?: number;      // Fraud chain evidence contribution
  activeChainId?: string;        // Active fraud chain reference
  
  // Explainability
  featureContributions: FeatureContribution[];
  plainLanguageExplanation: string;
  hasSufficientHistory: boolean;
  
  // Trust Impact
  currentTrustScore: number;
  projectedTrustScore: number;
  
  // Human Review State
  investigationStatus: "PENDING_REVIEW" | "ADDITIONAL_VERIFICATION_REQUESTED" | "HELD" | "APPROVED" | "REJECTED" | "INVESTIGATED";
  assignedInvestigator?: string;
  investigationNotes?: string[];
  reviewedAt?: string;
  isSyntheticDemo?: boolean;
}

// ── Admin Audit Action ──
export interface AdminInvestigationAction {
  id: string;
  transactionId: string;
  beneficiaryId: string;
  adminEmail: string;
  adminName: string;
  adminRole: string;
  action: "REQUEST_VERIFICATION" | "APPROVE_DELIVERY" | "HOLD_DELIVERY" | "REJECT_DELIVERY" | "MARK_INVESTIGATED" | "ADD_NOTE" | "ESCALATE" | "FRAUD_CHAIN_STATUS_CHANGE" | "FRAUD_CHAIN_RESOLVED";
  notes: string;
  timestamp: string;
  previousRiskScore: number;
  resultingDecision: PreDeliveryDecision;
  district: string;
  shop?: string;
  chainId?: string;
}

// ── NEW: Fraud Chain Intelligence Core Data Models ──

export type FraudChainStatus =
  | "MONITORING"
  | "UNDER_REVIEW"
  | "INVESTIGATION_REQUIRED"
  | "CRITICAL"
  | "RESOLVED"
  | "ESCALATED";

export type FraudChainEventType =
  | "STOCK_RECEIVED"
  | "INVENTORY_DRIFT"
  | "BENEFICIARY_ORDER"
  | "AGENT_ASSIGNED"
  | "VERIFICATION_ANOMALY"
  | "RELATED_ORDER"
  | "STOCK_DISCREPANCY"
  | "INVESTIGATION_HELD";

export interface FraudChainEvent {
  id: string;
  timestamp: string;
  timeLabel: string;
  eventType: FraudChainEventType;
  entityType: "FPS" | "INVENTORY" | "BENEFICIARY" | "DELIVERY_AGENT" | "VERIFICATION" | "TRANSACTION";
  entityId: string;
  entityName: string;
  title: string;
  description: string;
  evidenceImpact: number;
  sourceRecordId: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface FraudChainEvidenceItem {
  id: string;
  factorName: string;
  category: "BEHAVIORAL_DRIFT" | "INVENTORY_DISCREPANCY" | "NETWORK_ASSOCIATION" | "QUANTITY_DEVIATION" | "VERIFICATION_ANOMALY" | "TEMPORAL_CORRELATION";
  points: number;
  baseline: string;
  observed: string;
  delta: string;
  description: string;
  sourceModule: string;
  sourceRecordId: string;
}

export interface CounterfactualSimulationItem {
  factorName: string;
  category: string;
  riskScoreWithoutFactor: number;
  reductionPoints: number;
  significance: "PRIMARY_DRIVER" | "SECONDARY_DRIVER" | "CONTRIBUTING_FACTOR";
}

export interface InvestigationRecommendation {
  priority: number;
  title: string;
  targetEntity: string;
  actionType: "INVENTORY_AUDIT" | "AGENT_REVIEW" | "BENEFICIARY_VERIFY" | "OTP_LOG_INSPECT" | "PHYSICAL_STOCK_CHECK" | "HOLD_DISPATCH";
  rationale: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

export interface FraudChainResolution {
  finding: "LEGITIMATE_DISCREPANCY" | "CONFIRMED_ANOMALY_ESCALATED" | "SYSTEM_GLITCH_RESOLVED" | "FALSE_POSITIVE_CLEARED";
  resolutionReason: string;
  resolvedBy: string;
  resolvedAt: string;
  trustScoreAdjustment: number;
}

export interface FraudChain {
  id: string;
  chainId: string;
  title: string;
  district: string;
  shopId: string;
  shopName: string;
  primaryTransactionId: string;
  linkedTransactionIds: string[];
  involvedBeneficiaryIds: string[];
  involvedAgentIds: string[];
  involvedCommodities: string[];
  status: FraudChainStatus;
  riskScore: number;
  confidenceScore: number;
  hypothesis: {
    title: string;
    summary: string;
    confidence: number;
    evidenceBulletPoints: string[];
  };
  evidenceContributions: FraudChainEvidenceItem[];
  timelineEvents: FraudChainEvent[];
  counterfactualAnalysis: {
    currentRiskScore: number;
    simulations: CounterfactualSimulationItem[];
    strongestDriversSummary: string;
  };
  recommendations: InvestigationRecommendation[];
  resolution?: FraudChainResolution;
  createdAt: string;
  updatedAt: string;
  isSyntheticDemo?: boolean;
}
