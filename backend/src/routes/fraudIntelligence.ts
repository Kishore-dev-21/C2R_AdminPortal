import { Router, Request, Response } from "express";
import { FraudIntelligenceService } from "../services/fraudIntelligenceService";
import { PreDeliveryCheckRequest, AdminInvestigationActionPayload } from "../types/fraudIntelligence";

const router = Router();

// In-memory backend audit action store
const auditActionStore: (AdminInvestigationActionPayload & { id: string; timestamp: string })[] = [];

/**
 * POST /fraud/pre-delivery-check
 * Evaluates an incoming order against Ration DNA and collusion graph
 */
router.post("/pre-delivery-check", (req: Request, res: Response) => {
  try {
    const payload: PreDeliveryCheckRequest = req.body;
    if (!payload.beneficiaryId || !payload.transactionId) {
      return res.status(400).json({ error: "Missing required beneficiaryId or transactionId" });
    }

    const result = FraudIntelligenceService.evaluatePreDelivery(payload);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to evaluate transaction" });
  }
});

/**
 * GET /fraud/ration-dna/:beneficiaryId
 * Retrieves behavioral baseline
 */
router.get("/ration-dna/:beneficiaryId", (req: Request, res: Response) => {
  try {
    const { beneficiaryId } = req.params;
    const profile = FraudIntelligenceService.getRationDna(beneficiaryId);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /fraud/investigate-action
 * Records an immutable administrative decision
 */
router.post("/investigate-action", (req: Request, res: Response) => {
  try {
    const payload: AdminInvestigationActionPayload = req.body;
    if (!payload.transactionId || !payload.action || !payload.adminEmail) {
      return res.status(400).json({ error: "Missing required audit action parameters" });
    }

    const entry = {
      ...payload,
      id: `AUD-ACT-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
    };

    auditActionStore.unshift(entry);
    res.json({ success: true, data: entry });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /fraud/audit-trail
 * Retrieves recorded audit actions scoped by district
 */
router.get("/audit-trail", (req: Request, res: Response) => {
  try {
    const { district } = req.query;
    let records = auditActionStore;
    if (district && district !== "All") {
      records = records.filter(r => r.district === district);
    }
    res.json({ success: true, count: records.length, data: records });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── NEW: Fraud Chain Intelligence Endpoints ──

interface BackendFraudChain {
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
  status: string;
  riskScore: number;
  confidenceScore: number;
  hypothesis: {
    title: string;
    summary: string;
    confidence: number;
    evidenceBulletPoints: string[];
  };
  evidenceContributions: any[];
  timelineEvents: any[];
  counterfactualAnalysis: any;
  recommendations: any[];
  resolution?: any;
  createdAt: string;
  updatedAt: string;
}

let backendChains: BackendFraudChain[] = [
  {
    id: "FC-MDU-001",
    chainId: "FC-MDU-001",
    title: "Synchronized Stock Diversion & Off-Peak Carrier Ring",
    district: "Madurai",
    shopId: "s4",
    shopName: "Madurai Main FPS",
    primaryTransactionId: "ORD-1003",
    linkedTransactionIds: ["ORD-1003", "ORD-1006", "ORD-1007"],
    involvedBeneficiaryIds: ["BEN-TN-MDU-00842", "BEN-TN-MDU-00843", "BEN-TN-MDU-00844"],
    involvedAgentIds: ["AGT-MDU-01"],
    status: "CRITICAL",
    riskScore: 88,
    confidenceScore: 88,
    createdAt: "2026-03-09 10:03:00",
    updatedAt: "2026-03-09 11:35:00",
    hypothesis: {
      title: "Possible Coordinated Stock Diversion & Carrier Bottleneck",
      summary: "3 beneficiaries exhibited simultaneous quantity surges (Cooking Oil +160%) routed exclusively through Madurai Main FPS and assigned to Agent AGT-17 within a 48-hour window, coinciding with a 42kg physical-vs-digital inventory discrepancy.",
      confidence: 88,
      evidenceBulletPoints: [
        "3 distinct beneficiaries exhibited simultaneous behavioral drift (>150% volume surge).",
        "All related transactions funnel through the same shop and delivery agent (AGT-17).",
        "Physical-to-digital inventory mismatch of 42 L identified at Madurai Main FPS.",
        "Repeated OTP authentication failures (2 to 3 retries) occurred prior to authorization.",
      ],
    },
    evidenceContributions: [
      { id: "EVD-01", factorName: "Behavioral Drift (Ration DNA)", category: "BEHAVIORAL_DRIFT", points: 22, baseline: "15 kg/L monthly", observed: "80L Cooking Oil", delta: "+160%", description: "Drastically exceeds historical baseline." },
      { id: "EVD-02", factorName: "Physical vs Digital Inventory Discrepancy", category: "INVENTORY_DISCREPANCY", points: 20, baseline: "500 L recorded", observed: "458 L physical", delta: "42 L deficit", description: "Warehouse dispatch logs do not match receipts." },
      { id: "EVD-03", factorName: "Collusion Network Association", category: "NETWORK_ASSOCIATION", points: 18, baseline: "Independent distribution", observed: "CLUSTER-MDU-01", delta: "18 co-occurrences", description: "Funnelled through Agent AGT-17." },
      { id: "EVD-04", factorName: "Commodity Quantity Surge", category: "QUANTITY_DEVIATION", points: 12, baseline: "Standard quota", observed: "80L allocation", delta: "+79x typical tier", description: "Exceeds domestic family tier." },
      { id: "EVD-05", factorName: "Authentication & OTP Anomaly", category: "VERIFICATION_ANOMALY", points: 9, baseline: "95% first-pass", observed: "2 failed retries", delta: "Multiple retries", description: "Successive OTP retries before authorization." },
      { id: "EVD-06", factorName: "Temporal Synchronicity", category: "TEMPORAL_CORRELATION", points: 7, baseline: "Distributed monthly", observed: "3 orders in 3h", delta: "Off-peak batching", description: "Non-standard operational window." },
    ],
    timelineEvents: [
      { id: "EVT-01", timestamp: "2026-03-09 10:03:00", timeLabel: "10:03 AM", eventType: "STOCK_RECEIVED", entityType: "FPS", entityId: "s4", entityName: "Madurai Main FPS", title: "Bulk Stock Inflow Registered", description: "2,000L Cooking Oil dispatched.", evidenceImpact: 0, sourceRecordId: "BATCH-002", severity: "LOW" },
      { id: "EVT-02", timestamp: "2026-03-09 10:17:00", timeLabel: "10:17 AM", eventType: "INVENTORY_DRIFT", entityType: "INVENTORY", entityId: "s4-inv", entityName: "Madurai Storage Hub", title: "Initial Inventory Variance Flagged", description: "42L physical variance identified.", evidenceImpact: 20, sourceRecordId: "DISC-002", severity: "HIGH" },
      { id: "EVT-03", timestamp: "2026-03-09 10:21:00", timeLabel: "10:21 AM", eventType: "BENEFICIARY_ORDER", entityType: "BENEFICIARY", entityId: "BEN-TN-MDU-00842", entityName: "Beneficiary BEN-MDU-842", title: "Anomalous Order Placed (ORD-1003)", description: "80L Cooking Oil order placed.", evidenceImpact: 22, sourceRecordId: "ORD-1003", severity: "HIGH" },
      { id: "EVT-04", timestamp: "2026-03-09 10:24:00", timeLabel: "10:24 AM", eventType: "AGENT_ASSIGNED", entityType: "DELIVERY_AGENT", entityId: "AGT-MDU-01", entityName: "Agent K. Raman (AGT-17)", title: "Carrier Assigned to High-Volume Order", description: "Assigned to Agent AGT-17.", evidenceImpact: 18, sourceRecordId: "ASG-1003", severity: "MEDIUM" },
      { id: "EVT-05", timestamp: "2026-03-09 10:28:00", timeLabel: "10:28 AM", eventType: "VERIFICATION_ANOMALY", entityType: "VERIFICATION", entityId: "VERIF-918", entityName: "Authentication Gateway", title: "Multiple Failed OTP Retries", description: "2 failed OTP attempts.", evidenceImpact: 9, sourceRecordId: "OTP-FAIL", severity: "MEDIUM" },
      { id: "EVT-06", timestamp: "2026-03-09 10:31:00", timeLabel: "10:31 AM", eventType: "RELATED_ORDER", entityType: "TRANSACTION", entityId: "ORD-1006", entityName: "Beneficiary BEN-MDU-843", title: "Secondary Correlated Order (ORD-1006)", description: "Second beneficiary requests 150kg Sugar.", evidenceImpact: 12, sourceRecordId: "ORD-1006", severity: "HIGH" },
      { id: "EVT-07", timestamp: "2026-03-09 10:35:00", timeLabel: "10:35 AM", eventType: "INVESTIGATION_HELD", entityType: "TRANSACTION", entityId: "ORD-1003", entityName: "Pre-Delivery Gatekeeper", title: "Pre-Delivery Hold Applied", description: "Consignment held pending supervisor audit.", evidenceImpact: 0, sourceRecordId: "HOLD-1003", severity: "CRITICAL" },
    ],
    counterfactualAnalysis: {
      currentRiskScore: 88,
      strongestDriversSummary: "Removing Behavioral Drift and Physical Inventory Discrepancy reduces risk score from 88 to 46.",
      simulations: [
        { factorName: "Behavioral Drift (Ration DNA)", category: "BEHAVIORAL_DRIFT", riskScoreWithoutFactor: 66, reductionPoints: 22, significance: "PRIMARY_DRIVER" },
        { factorName: "Physical vs Digital Inventory Discrepancy", category: "INVENTORY_DISCREPANCY", riskScoreWithoutFactor: 68, reductionPoints: 20, significance: "PRIMARY_DRIVER" },
        { factorName: "Collusion Network Association", category: "NETWORK_ASSOCIATION", riskScoreWithoutFactor: 70, reductionPoints: 18, significance: "SECONDARY_DRIVER" },
      ],
    },
    recommendations: [
      { priority: 1, title: "Perform On-Site Physical Stock Verification at Madurai Main FPS", targetEntity: "Madurai Main FPS", actionType: "PHYSICAL_STOCK_CHECK", rationale: "Reconcile 42L Cooking Oil deficit.", status: "PENDING" },
      { priority: 2, title: "Inspect Delivery Agent AGT-17 Route Telemetry", targetEntity: "Agent AGT-17", actionType: "AGENT_REVIEW", rationale: "Investigate carrier route timestamps.", status: "PENDING" },
      { priority: 3, title: "Require In-Person Biometric Verification", targetEntity: "Beneficiaries", actionType: "BENEFICIARY_VERIFY", rationale: "Verify physical ration card ownership.", status: "PENDING" },
    ],
  },
];

/**
 * GET /fraud/chains
 * Retrieves all Fraud Chains filtered by district
 */
router.get("/chains", (req: Request, res: Response) => {
  try {
    const { district } = req.query;
    let chains = backendChains;
    if (district && district !== "All") {
      chains = chains.filter(c => c.district === district);
    }
    res.json({ success: true, count: chains.length, data: chains });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /fraud/chains/:chainId
 */
router.get("/chains/:chainId", (req: Request, res: Response) => {
  try {
    const { chainId } = req.params;
    const chain = backendChains.find(c => c.id === chainId || c.chainId === chainId);
    if (!chain) {
      return res.status(404).json({ error: "Fraud chain not found" });
    }
    res.json({ success: true, data: chain });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /fraud/chains/:chainId/counterfactual
 */
router.post("/chains/:chainId/counterfactual", (req: Request, res: Response) => {
  try {
    const { chainId } = req.params;
    const { disabledFactors = [] } = req.body;
    const chain = backendChains.find(c => c.id === chainId || c.chainId === chainId);
    if (!chain) {
      return res.status(404).json({ error: "Fraud chain not found" });
    }

    const disabledSet = new Set(disabledFactors);
    let simulatedScore = 0;
    chain.evidenceContributions.forEach(ev => {
      if (!disabledSet.has(ev.factorName)) {
        simulatedScore += ev.points;
      }
    });

    const finalSimulated = Math.min(100, Math.max(0, simulatedScore));
    res.json({
      success: true,
      data: {
        originalRiskScore: chain.riskScore,
        simulatedRiskScore: finalSimulated,
        disabledFactors,
        simulations: chain.counterfactualAnalysis.simulations,
        strongestDriversSummary: chain.counterfactualAnalysis.strongestDriversSummary,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /fraud/chains/:chainId/status
 */
router.patch("/chains/:chainId/status", (req: Request, res: Response) => {
  try {
    const { chainId } = req.params;
    const { status, adminEmail, adminName, adminRole, notes } = req.body;
    const chain = backendChains.find(c => c.id === chainId || c.chainId === chainId);
    if (!chain) {
      return res.status(404).json({ error: "Fraud chain not found" });
    }

    chain.status = status;
    chain.updatedAt = new Date().toISOString();

    const auditEntry = {
      id: `AUD-CHAIN-${Date.now().toString().slice(-6)}`,
      transactionId: chain.primaryTransactionId,
      beneficiaryId: chain.involvedBeneficiaryIds[0] || "MULTIPLE",
      adminEmail: adminEmail || "admin@click2ration.gov",
      adminName: adminName || "Administrator",
      adminRole: adminRole || "SUPER_ADMIN",
      action: "FRAUD_CHAIN_STATUS_CHANGE" as any,
      notes: notes || `Fraud Chain ${chainId} transitioned to ${status}`,
      previousRiskScore: chain.riskScore,
      resultingDecision: (status === "CRITICAL" ? "INVESTIGATION" : status === "RESOLVED" ? "NORMAL" : "ADMIN_REVIEW") as any,
      district: chain.district,
      shop: chain.shopName,
      timestamp: new Date().toISOString(),
    };
    auditActionStore.unshift(auditEntry);

    res.json({ success: true, data: chain });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /fraud/chains/:chainId/resolve
 */
router.post("/chains/:chainId/resolve", (req: Request, res: Response) => {
  try {
    const { chainId } = req.params;
    const { finding, resolutionReason, resolvedBy, trustScoreAdjustment = 0 } = req.body;
    const chain = backendChains.find(c => c.id === chainId || c.chainId === chainId);
    if (!chain) {
      return res.status(404).json({ error: "Fraud chain not found" });
    }

    chain.status = "RESOLVED";
    chain.resolution = {
      finding,
      resolutionReason,
      resolvedBy: resolvedBy || "Administrator",
      resolvedAt: new Date().toISOString(),
      trustScoreAdjustment,
    };
    chain.updatedAt = new Date().toISOString();

    const auditEntry = {
      id: `AUD-RESOLVE-${Date.now().toString().slice(-6)}`,
      transactionId: chain.primaryTransactionId,
      beneficiaryId: chain.involvedBeneficiaryIds.join(", "),
      adminEmail: "admin@click2ration.gov",
      adminName: resolvedBy || "Administrator",
      adminRole: "SUPER_ADMIN",
      action: "FRAUD_CHAIN_RESOLVED" as any,
      notes: `Fraud Chain ${chainId} resolved: ${finding} (${resolutionReason})`,
      previousRiskScore: chain.riskScore,
      resultingDecision: "NORMAL" as any,
      district: chain.district,
      shop: chain.shopName,
      timestamp: new Date().toISOString(),
    };
    auditActionStore.unshift(auditEntry);

    res.json({ success: true, data: chain });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
