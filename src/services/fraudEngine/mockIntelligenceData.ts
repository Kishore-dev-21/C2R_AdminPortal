import { ExplainableRiskAssessment } from "./types";
import { ExplainableRiskEngine } from "./explainableRiskEngine";

// Initial set of real-time transactions processed through the ExplainableRiskEngine
export const initialPreDeliveryQueue: ExplainableRiskAssessment[] = [
  // 1. Critical Risk: Madurai collusion transaction (High quantity, off-window, suspicious cluster)
  ExplainableRiskEngine.evaluateTransaction({
    transactionId: "ORD-1003",
    beneficiaryId: "BEN-TN-MDU-00842",
    shopId: "s4",
    shopName: "Madurai Main FPS",
    district: "Madurai",
    deliveryAgentId: "AGT-MDU-01",
    deliveryAgentName: "Agent K. Raman (AGT-17)",
    commodity: "Cooking Oil",
    quantity: 80,
    unit: "L",
    timestamp: "2026-03-09T10:30:00Z",
    failedVerificationAttempts: 2,
    recentOrdersLast7Days: 2,
  }),

  // 2. High Risk: Salem duplicate / migrant card with insufficient history
  ExplainableRiskEngine.evaluateTransaction({
    transactionId: "ORD-1004",
    beneficiaryId: "BEN-TN-SLM-00999",
    shopId: "s6",
    shopName: "Salem Market FPS",
    district: "Salem",
    deliveryAgentId: "AGT-SLM-01",
    deliveryAgentName: "Agent P. Velu (AGT-12)",
    commodity: "Rice",
    quantity: 150,
    unit: "kg",
    timestamp: "2026-03-09T11:15:00Z",
    failedVerificationAttempts: 3,
    recentOrdersLast7Days: 1,
  }),

  // 3. Medium Risk: KK Nagar slight quantity bump + 1 OTP retry
  ExplainableRiskEngine.evaluateTransaction({
    transactionId: "ORD-1002",
    beneficiaryId: "BEN-TN-CHE-00102",
    shopId: "s2",
    shopName: "KK Nagar FPS",
    district: "Chennai",
    deliveryAgentId: "AGT-CHE-01",
    deliveryAgentName: "Agent Murugan (AGT-01)",
    commodity: "Sugar",
    quantity: 50,
    unit: "kg",
    timestamp: "2026-03-09T09:45:00Z",
    failedVerificationAttempts: 1,
    recentOrdersLast7Days: 1,
  }),

  // 4. Normal Low Risk: Anna Nagar standard monthly rice allocation
  ExplainableRiskEngine.evaluateTransaction({
    transactionId: "ORD-1001",
    beneficiaryId: "BEN-TN-CHE-00101",
    shopId: "s1",
    shopName: "Anna Nagar FPS",
    district: "Chennai",
    deliveryAgentId: "AGT-CHE-01",
    deliveryAgentName: "Agent Murugan (AGT-01)",
    commodity: "Rice",
    quantity: 20,
    unit: "kg",
    timestamp: "2026-03-09T08:12:00Z",
    failedVerificationAttempts: 0,
    recentOrdersLast7Days: 1,
  }),

  // 5. Normal Low Risk: Coimbatore Central standard wheat distribution
  ExplainableRiskEngine.evaluateTransaction({
    transactionId: "ORD-1008",
    beneficiaryId: "BEN-TN-CBE-00401",
    shopId: "s5",
    shopName: "Coimbatore Central FPS",
    district: "Coimbatore",
    deliveryAgentId: "AGT-CBE-01",
    deliveryAgentName: "Agent S. Kumar (AGT-08)",
    commodity: "Wheat",
    quantity: 25,
    unit: "kg",
    timestamp: "2026-03-09T14:00:00Z",
    failedVerificationAttempts: 0,
    recentOrdersLast7Days: 1,
  }),

  // 6. High Risk: Madurai Second beneficiary in the collusion ring
  ExplainableRiskEngine.evaluateTransaction({
    transactionId: "ORD-1006",
    beneficiaryId: "BEN-TN-MDU-00843",
    shopId: "s4",
    shopName: "Madurai Main FPS",
    district: "Madurai",
    deliveryAgentId: "AGT-MDU-01",
    deliveryAgentName: "Agent K. Raman (AGT-17)",
    commodity: "Sugar",
    quantity: 150,
    unit: "kg",
    timestamp: "2026-03-09T12:00:00Z",
    failedVerificationAttempts: 2,
    recentOrdersLast7Days: 3,
  }),
];

// ── Aggregated Statistics ──
export const fraudAnalyticsSummary = {
  totalAnalyzed: 3842,
  behavioralAnomaliesDetected: 142,
  highRiskTransactions: 28,
  potentialNetworkClusters: 2,
  pendingInvestigations: 6,
  verificationRequiredOrders: 19,
  
  riskDistribution: [
    { name: "Low Risk (0-40)", count: 3280, pct: 85.4, fill: "hsl(var(--success))" },
    { name: "Medium Risk (40-70)", count: 416, pct: 10.8, fill: "hsl(var(--info))" },
    { name: "High Risk (70-85)", count: 118, pct: 3.1, fill: "hsl(var(--warning))" },
    { name: "Critical Risk (85-100)", count: 28, pct: 0.7, fill: "hsl(var(--destructive))" },
  ],

  topAnomalyCategories: [
    { category: "Quantity Surge Deviation", count: 74, share: "35%" },
    { category: "Unusual Shop / Location", count: 48, share: "23%" },
    { category: "Multiple Verification Failures", count: 39, share: "18%" },
    { category: "Network / Collusion Link", count: 31, share: "15%" },
    { category: "Off-Window Timing Anomaly", count: 19, share: "9%" },
  ],

  anomalyTimeline: [
    { time: "08:00", low: 180, medium: 12, high: 2, critical: 0 },
    { time: "09:00", low: 340, medium: 28, high: 4, critical: 1 },
    { time: "10:00", low: 520, medium: 45, high: 11, critical: 4 },
    { time: "11:00", low: 680, medium: 52, high: 14, critical: 5 },
    { time: "12:00", low: 590, medium: 41, high: 8, critical: 2 },
    { time: "13:00", low: 480, medium: 33, high: 6, critical: 1 },
    { time: "14:00", low: 490, medium: 38, high: 9, critical: 2 },
  ],

  shopRiskLeaderboard: [
    { shop: "Madurai Main FPS", district: "Madurai", riskIndex: 82, activeAlerts: 7, status: "Critical Audit" },
    { shop: "Salem Market FPS", district: "Salem", riskIndex: 68, activeAlerts: 4, status: "High Priority" },
    { shop: "KK Nagar FPS", district: "Chennai", riskIndex: 38, activeAlerts: 2, status: "Normal Review" },
    { shop: "Anna Nagar FPS", district: "Chennai", riskIndex: 12, activeAlerts: 0, status: "Compliant" },
    { shop: "Coimbatore Central FPS", district: "Coimbatore", riskIndex: 8, activeAlerts: 0, status: "Compliant" },
    { shop: "T Nagar FPS", district: "Chennai", riskIndex: 14, activeAlerts: 1, status: "Compliant" },
  ],

  agentRiskLeaderboard: [
    { agent: "Agent K. Raman (AGT-17)", shop: "Madurai Main FPS", district: "Madurai", anomalyScore: 88, cooccurrences: 18, status: "Flagged" },
    { agent: "Agent P. Velu (AGT-12)", shop: "Salem Market FPS", district: "Salem", anomalyScore: 68, cooccurrences: 5, status: "Under Watch" },
    { agent: "Agent Murugan (AGT-01)", shop: "Anna Nagar FPS", district: "Chennai", anomalyScore: 14, cooccurrences: 0, status: "Verified" },
    { agent: "Agent S. Kumar (AGT-08)", shop: "Coimbatore Central", district: "Coimbatore", anomalyScore: 9, cooccurrences: 0, status: "Verified" },
  ],
};
