import {
  FraudChain,
  FraudChainStatus,
  FraudChainResolution,
  CounterfactualSimulationItem,
  InvestigationRecommendation,
} from "./types";
import { RationDnaService } from "./rationDnaService";
import { FraudAuditService } from "./auditLogService";

const FRAUD_CHAINS_STORAGE_KEY = "c2r_fraud_chains_store";

// Initial realistic dataset of Fraud Chains connecting existing systems
const initialFraudChains: FraudChain[] = [
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
    involvedCommodities: ["Cooking Oil", "Rice", "Sugar"],
    status: "CRITICAL",
    riskScore: 88,
    confidenceScore: 88,
    isSyntheticDemo: true,
    createdAt: "2026-03-09 10:03:00",
    updatedAt: "2026-03-09 11:35:00",
    hypothesis: {
      title: "Possible Coordinated Stock Diversion & Carrier Bottleneck",
      summary:
        "A sequence of 7 associated events indicates an emerging high-risk pattern: 3 beneficiaries exhibited simultaneous quantity surges (Cooking Oil +160%) routed exclusively through Madurai Main FPS and assigned to Agent AGT-17 within a 48-hour window, coinciding with a 42kg physical-vs-digital inventory discrepancy.",
      confidence: 88,
      evidenceBulletPoints: [
        "3 distinct beneficiaries exhibited simultaneous behavioral drift (>150% volume surge above historical Ration DNA).",
        "All related transactions funnel through the same shop (Madurai Main FPS) and same delivery agent (Agent K. Raman / AGT-17).",
        "Physical-to-digital inventory mismatch of 42 kg/L identified at Madurai Main FPS.",
        "Repeated OTP authentication failures (2 to 3 retries) occurred immediately prior to authorization.",
        "Transactions cluster within an unusual 48-hour temporal window.",
      ],
    },
    evidenceContributions: [
      {
        id: "EVD-01",
        factorName: "Behavioral Drift (Ration DNA)",
        category: "BEHAVIORAL_DRIFT",
        points: 22,
        baseline: "15 kg/L monthly average (Cooking Oil 1L)",
        observed: "80L Cooking Oil requested",
        delta: "+160% volume deviation",
        description: "Transaction quantity drastically exceeds beneficiary's verified historical baseline.",
        sourceModule: "Ration DNA & Drift Engine",
        sourceRecordId: "BEN-TN-MDU-00842",
      },
      {
        id: "EVD-02",
        factorName: "Physical vs Digital Inventory Discrepancy",
        category: "INVENTORY_DISCREPANCY",
        points: 20,
        baseline: "500 L recorded stock",
        observed: "458 L verified in storage",
        delta: "42 L unaccounted deficit",
        description: "Warehouse dispatch logs do not match shop inventory receipts for Cooking Oil batch.",
        sourceModule: "Inventory & Blockchain Cross-Check",
        sourceRecordId: "s4-CookingOil",
      },
      {
        id: "EVD-03",
        factorName: "Collusion Network Association",
        category: "NETWORK_ASSOCIATION",
        points: 18,
        baseline: "Independent random beneficiary distribution",
        observed: "Linked to CLUSTER-MDU-01 (18 co-occurrences)",
        delta: "Tight 3-beneficiary + 1-agent cluster",
        description: "All 3 anomalous orders are funnelled through Agent AGT-17 at Madurai Main FPS.",
        sourceModule: "Collusion Graph Engine",
        sourceRecordId: "CLUSTER-MDU-01",
      },
      {
        id: "EVD-04",
        factorName: "Commodity Quantity Surge",
        category: "QUANTITY_DEVIATION",
        points: 12,
        baseline: "Single-family standard quota",
        observed: "80L single order allocation",
        delta: "+79x typical single-ration allocation",
        description: "Requested bulk quantity is inconsistent with domestic family consumption tier.",
        sourceModule: "Transaction Profiler",
        sourceRecordId: "ORD-1003",
      },
      {
        id: "EVD-05",
        factorName: "Authentication & OTP Anomaly",
        category: "VERIFICATION_ANOMALY",
        points: 9,
        baseline: "95% first-pass biometric/OTP success",
        observed: "2 consecutive OTP timeout/failure attempts",
        delta: "Multiple verification retries",
        description: "Beneficiary encountered successive OTP retries before authorization was forced.",
        sourceModule: "Verification Telemetry",
        sourceRecordId: "VERIF-MDU-918",
      },
      {
        id: "EVD-06",
        factorName: "Temporal Synchronicity",
        category: "TEMPORAL_CORRELATION",
        points: 7,
        baseline: "Distributed across month (Days 1-5)",
        observed: "3 high-volume orders placed within 3h",
        delta: "Off-peak concentrated batching",
        description: "Concentrated transaction velocity during non-standard shop operational hours.",
        sourceModule: "Temporal Velocity Service",
        sourceRecordId: "TIME-MDU-04",
      },
    ],
    timelineEvents: [
      {
        id: "EVT-01",
        timestamp: "2026-03-09 10:03:00",
        timeLabel: "10:03 AM",
        eventType: "STOCK_RECEIVED",
        entityType: "FPS",
        entityId: "s4",
        entityName: "Madurai Main FPS",
        title: "Bulk Stock Inflow Registered",
        description: "Madurai Storage Hub dispatched 2,000L Cooking Oil batch to Madurai Main FPS.",
        evidenceImpact: 0,
        sourceRecordId: "BATCH-WD-2026-002",
        severity: "LOW",
      },
      {
        id: "EVT-02",
        timestamp: "2026-03-09 10:17:00",
        timeLabel: "10:17 AM",
        eventType: "INVENTORY_DRIFT",
        entityType: "INVENTORY",
        entityId: "s4-inv",
        entityName: "Madurai Storage Hub",
        title: "Initial Inventory Variance Flagged",
        description: "Blockchain ledger reports 2,000L dispatched; operational DB logged 1,958L acknowledged.",
        evidenceImpact: 20,
        sourceRecordId: "DISC-MDU-002",
        severity: "HIGH",
      },
      {
        id: "EVT-03",
        timestamp: "2026-03-09 10:21:00",
        timeLabel: "10:21 AM",
        eventType: "BENEFICIARY_ORDER",
        entityType: "BENEFICIARY",
        entityId: "BEN-TN-MDU-00842",
        entityName: "Beneficiary BEN-MDU-842",
        title: "First Anomalous Order Placed (ORD-1003)",
        description: "Order placed for 80L Cooking Oil, representing +160% surge over historical baseline.",
        evidenceImpact: 22,
        sourceRecordId: "ORD-1003",
        severity: "HIGH",
      },
      {
        id: "EVT-04",
        timestamp: "2026-03-09 10:24:00",
        timeLabel: "10:24 AM",
        eventType: "AGENT_ASSIGNED",
        entityType: "DELIVERY_AGENT",
        entityId: "AGT-MDU-01",
        entityName: "Agent K. Raman (AGT-17)",
        title: "Carrier Assigned to High-Volume Order",
        description: "Consignment assigned to Agent AGT-17; carrier anomaly score is 88/100 across 18 co-occurrences.",
        evidenceImpact: 18,
        sourceRecordId: "ASG-1003",
        severity: "MEDIUM",
      },
      {
        id: "EVT-05",
        timestamp: "2026-03-09 10:28:00",
        timeLabel: "10:28 AM",
        eventType: "VERIFICATION_ANOMALY",
        entityType: "VERIFICATION",
        entityId: "VERIF-MDU-918",
        entityName: "Authentication Gateway",
        title: "Multiple Failed OTP Verification Retries",
        description: "2 consecutive OTP verification failures recorded before transaction authorization.",
        evidenceImpact: 9,
        sourceRecordId: "OTP-FAIL-842",
        severity: "MEDIUM",
      },
      {
        id: "EVT-06",
        timestamp: "2026-03-09 10:31:00",
        timeLabel: "10:31 AM",
        eventType: "RELATED_ORDER",
        entityType: "TRANSACTION",
        entityId: "ORD-1006",
        entityName: "Beneficiary BEN-MDU-843",
        title: "Secondary Correlated Order Initiated (ORD-1006)",
        description: "Second beneficiary in CLUSTER-MDU-01 requests 150kg Sugar/Salt mix via same shop and carrier.",
        evidenceImpact: 12,
        sourceRecordId: "ORD-1006",
        severity: "HIGH",
      },
      {
        id: "EVT-07",
        timestamp: "2026-03-09 10:35:00",
        timeLabel: "10:35 AM",
        eventType: "INVESTIGATION_HELD",
        entityType: "TRANSACTION",
        entityId: "ORD-1003",
        entityName: "Pre-Delivery Gatekeeper",
        title: "Pre-Delivery Hold Applied Automatically",
        description: "Consignments held pending on-site physical stock count and district administrator review.",
        evidenceImpact: 0,
        sourceRecordId: "HOLD-1003",
        severity: "CRITICAL",
      },
    ],
    counterfactualAnalysis: {
      currentRiskScore: 88,
      strongestDriversSummary:
        "Removing Behavioral Drift and Physical Inventory Discrepancy would reduce overall chain risk from 88 to 46, dropping the classification below the critical threshold.",
      simulations: [
        {
          factorName: "Behavioral Drift (Ration DNA)",
          category: "BEHAVIORAL_DRIFT",
          riskScoreWithoutFactor: 66,
          reductionPoints: 22,
          significance: "PRIMARY_DRIVER",
        },
        {
          factorName: "Physical vs Digital Inventory Discrepancy",
          category: "INVENTORY_DISCREPANCY",
          riskScoreWithoutFactor: 68,
          reductionPoints: 20,
          significance: "PRIMARY_DRIVER",
        },
        {
          factorName: "Collusion Network Association",
          category: "NETWORK_ASSOCIATION",
          riskScoreWithoutFactor: 70,
          reductionPoints: 18,
          significance: "SECONDARY_DRIVER",
        },
        {
          factorName: "Commodity Quantity Surge",
          category: "QUANTITY_DEVIATION",
          riskScoreWithoutFactor: 76,
          reductionPoints: 12,
          significance: "SECONDARY_DRIVER",
        },
        {
          factorName: "Authentication & OTP Anomaly",
          category: "VERIFICATION_ANOMALY",
          riskScoreWithoutFactor: 79,
          reductionPoints: 9,
          significance: "CONTRIBUTING_FACTOR",
        },
        {
          factorName: "Temporal Synchronicity",
          category: "TEMPORAL_CORRELATION",
          riskScoreWithoutFactor: 81,
          reductionPoints: 7,
          significance: "CONTRIBUTING_FACTOR",
        },
      ],
    },
    recommendations: [
      {
        priority: 1,
        title: "Perform On-Site Physical Stock Verification at Madurai Main FPS",
        targetEntity: "Madurai Main FPS (s4)",
        actionType: "PHYSICAL_STOCK_CHECK",
        rationale: "Reconcile the 42L Cooking Oil deficit against physical warehouse storage tanks.",
        status: "PENDING",
      },
      {
        priority: 2,
        title: "Inspect Delivery Agent AGT-17 Route Telemetry & Logs",
        targetEntity: "Agent K. Raman (AGT-17)",
        actionType: "AGENT_REVIEW",
        rationale: "Investigate carrier route timestamps for 18 co-occurring deliveries over last 14 days.",
        status: "PENDING",
      },
      {
        priority: 3,
        title: "Require In-Person Biometric Verification for Beneficiaries",
        targetEntity: "BEN-MDU-842, BEN-MDU-843, BEN-MDU-844",
        actionType: "BENEFICIARY_VERIFY",
        rationale: "Verify physical ration card ownership and presence of primary cardholder.",
        status: "PENDING",
      },
      {
        priority: 4,
        title: "Maintain Pre-Delivery Hold on Consignments ORD-1003 & ORD-1006",
        targetEntity: "Orders ORD-1003, ORD-1006",
        actionType: "HOLD_DISPATCH",
        rationale: "Prevent physical commodity diversion prior to completion of supervisor audit.",
        status: "IN_PROGRESS",
      },
      {
        priority: 5,
        title: "Inspect OTP Gateway Authentication Logs",
        targetEntity: "Authentication Gateway",
        actionType: "OTP_LOG_INSPECT",
        rationale: "Check IP origin and device fingerprints for consecutive OTP failures.",
        status: "PENDING",
      },
    ],
  },
  {
    id: "FC-SLM-002",
    chainId: "FC-SLM-002",
    title: "Probationary Migrant Card Verification & Duplicate Request Anomaly",
    district: "Salem",
    shopId: "s6",
    shopName: "Salem Market FPS",
    primaryTransactionId: "ORD-1004",
    linkedTransactionIds: ["ORD-1004"],
    involvedBeneficiaryIds: ["BEN-TN-SLM-00999"],
    involvedAgentIds: ["AGT-SLM-01"],
    involvedCommodities: ["Rice"],
    status: "INVESTIGATION_REQUIRED",
    riskScore: 71,
    confidenceScore: 75,
    isSyntheticDemo: true,
    createdAt: "2026-03-09 11:15:00",
    updatedAt: "2026-03-09 11:45:00",
    hypothesis: {
      title: "Potential Duplicate Registration / Insufficient Baseline Anomaly",
      summary:
        "A newly registered migrant ration card with fewer than 3 historical transactions requested a bulk allocation (150kg Rice) accompanied by 3 consecutive authentication retries. Initial baseline probation applies.",
      confidence: 75,
      evidenceBulletPoints: [
        "Ration card has fewer than 3 historical distribution transactions (Insufficient historical data).",
        "Order quantity (150kg Rice) significantly exceeds standard single-card entitlement tier.",
        "3 consecutive biometric/OTP failures recorded at Salem Market FPS before authorization.",
        "No prior carrier relationship established with Agent AGT-12.",
      ],
    },
    evidenceContributions: [
      {
        id: "EVD-SLM-01",
        factorName: "Insufficient Historical Baseline (Probation)",
        category: "BEHAVIORAL_DRIFT",
        points: 25,
        baseline: "Insufficient data (<3 transactions)",
        observed: "New ration card initialization",
        delta: "Baseline uncertain",
        description: "New card with no verified historical consumption fingerprint.",
        sourceModule: "Ration DNA Engine",
        sourceRecordId: "BEN-TN-SLM-00999",
      },
      {
        id: "EVD-SLM-02",
        factorName: "Multiple Verification Retries",
        category: "VERIFICATION_ANOMALY",
        points: 22,
        baseline: "100% first-pass benchmark",
        observed: "3 consecutive authentication retries",
        delta: "High failure rate",
        description: "Consecutive authentication failures before final transaction dispatch attempt.",
        sourceModule: "Verification Telemetry",
        sourceRecordId: "VERIF-SLM-401",
      },
      {
        id: "EVD-SLM-03",
        factorName: "Quantity Entitlement Surge",
        category: "QUANTITY_DEVIATION",
        points: 16,
        baseline: "20 kg standard monthly tier",
        observed: "150 kg requested",
        delta: "+130 kg above entitlement",
        description: "Requested volume exceeds domestic monthly ration card limits.",
        sourceModule: "Quota Policy Validator",
        sourceRecordId: "ORD-1004",
      },
      {
        id: "EVD-SLM-04",
        factorName: "Carrier Divergence",
        category: "NETWORK_ASSOCIATION",
        points: 8,
        baseline: "Standard FPS counter collection",
        observed: "Assigned to Agent AGT-12",
        delta: "New carrier interaction",
        description: "Carrier interaction without prior established delivery history.",
        sourceModule: "Delivery Intelligence",
        sourceRecordId: "AGT-SLM-01",
      },
    ],
    timelineEvents: [
      {
        id: "EVT-SLM-01",
        timestamp: "2026-03-09 11:10:00",
        timeLabel: "11:10 AM",
        eventType: "BENEFICIARY_ORDER",
        entityType: "BENEFICIARY",
        entityId: "BEN-TN-SLM-00999",
        entityName: "Beneficiary BEN-SLM-999",
        title: "Order Initiated by New Migrant Card",
        description: "Order ORD-1004 submitted for 150kg Rice at Salem Market FPS.",
        evidenceImpact: 25,
        sourceRecordId: "ORD-1004",
        severity: "MEDIUM",
      },
      {
        id: "EVT-SLM-02",
        timestamp: "2026-03-09 11:12:00",
        timeLabel: "11:12 AM",
        eventType: "VERIFICATION_ANOMALY",
        entityType: "VERIFICATION",
        entityId: "VERIF-SLM-401",
        entityName: "Salem Biometric Terminal",
        title: "3 Consecutive Biometric Authentication Failures",
        description: "Fingerprint scanner reported 3 mismatches before switching to OTP fallback.",
        evidenceImpact: 22,
        sourceRecordId: "VERIF-FAIL-SLM",
        severity: "HIGH",
      },
      {
        id: "EVT-SLM-03",
        timestamp: "2026-03-09 11:15:00",
        timeLabel: "11:15 AM",
        eventType: "INVESTIGATION_HELD",
        entityType: "TRANSACTION",
        entityId: "ORD-1004",
        entityName: "Pre-Delivery Gatekeeper",
        title: "Secondary Identity Verification Mandate",
        description: "Transaction flagged for physical Aadhaar/Ration Card cross-check by Shop Admin.",
        evidenceImpact: 0,
        sourceRecordId: "HOLD-1004",
        severity: "HIGH",
      },
    ],
    counterfactualAnalysis: {
      currentRiskScore: 71,
      strongestDriversSummary:
        "Resolving Authentication Failures and verifying Beneficiary Entitlement drops risk score to 33 (Low Risk).",
      simulations: [
        {
          factorName: "Insufficient Historical Baseline (Probation)",
          category: "BEHAVIORAL_DRIFT",
          riskScoreWithoutFactor: 46,
          reductionPoints: 25,
          significance: "PRIMARY_DRIVER",
        },
        {
          factorName: "Multiple Verification Retries",
          category: "VERIFICATION_ANOMALY",
          riskScoreWithoutFactor: 49,
          reductionPoints: 22,
          significance: "PRIMARY_DRIVER",
        },
        {
          factorName: "Quantity Entitlement Surge",
          category: "QUANTITY_DEVIATION",
          riskScoreWithoutFactor: 55,
          reductionPoints: 16,
          significance: "SECONDARY_DRIVER",
        },
        {
          factorName: "Carrier Divergence",
          category: "NETWORK_ASSOCIATION",
          riskScoreWithoutFactor: 63,
          reductionPoints: 8,
          significance: "CONTRIBUTING_FACTOR",
        },
      ],
    },
    recommendations: [
      {
        priority: 1,
        title: "Perform In-Person Aadhaar Biometric Re-Authentication",
        targetEntity: "Beneficiary BEN-SLM-999",
        actionType: "BENEFICIARY_VERIFY",
        rationale: "Resolve authentication failures using secondary official government ID check.",
        status: "PENDING",
      },
      {
        priority: 2,
        title: "Verify Migrant Family Quota Allocation Tier",
        targetEntity: "Salem Market FPS (s6)",
        actionType: "INVENTORY_AUDIT",
        rationale: "Confirm if 150kg request was a clerical data-entry error or legitimate multi-month quota.",
        status: "PENDING",
      },
      {
        priority: 3,
        title: "Supervise Delivery Dispatch with Physical Receipt",
        targetEntity: "Agent P. Velu (AGT-12)",
        actionType: "HOLD_DISPATCH",
        rationale: "Ensure physical delivery is handed directly to verified family member.",
        status: "PENDING",
      },
    ],
  },
];

export class FraudChainService {
  /**
   * Retrieves all Fraud Chains, filtered by district or shop scope.
   */
  public static getAllChains(params?: {
    district?: string;
    shop?: string;
    role?: string;
  }): FraudChain[] {
    const raw = localStorage.getItem(FRAUD_CHAINS_STORAGE_KEY);
    let chains: FraudChain[] = raw ? JSON.parse(raw) : initialFraudChains;

    if (!raw) {
      localStorage.setItem(FRAUD_CHAINS_STORAGE_KEY, JSON.stringify(initialFraudChains));
    }

    if (!params) return chains;

    if (params.role === "DISTRICT_ADMIN" && params.district && params.district !== "All") {
      chains = chains.filter((c) => c.district === params.district);
    } else if (params.role === "SHOP_ADMIN" && params.shop) {
      chains = chains.filter((c) => c.shopName === params.shop);
    }

    return chains;
  }

  /**
   * Retrieves a single Fraud Chain by ID.
   */
  public static getChainById(chainId: string): FraudChain | null {
    const all = this.getAllChains();
    return all.find((c) => c.id === chainId || c.chainId === chainId) || null;
  }

  /**
   * Evaluates counterfactual simulation without modifying actual database records.
   * Simulates the removal of specific evidence factors to demonstrate what drives the risk.
   */
  public static simulateCounterfactual(
    chainId: string,
    disabledFactorNames: string[]
  ): {
    originalRiskScore: number;
    simulatedRiskScore: number;
    disabledFactors: string[];
    simulations: CounterfactualSimulationItem[];
    strongestDriversSummary: string;
  } {
    const chain = this.getChainById(chainId);
    if (!chain) {
      return {
        originalRiskScore: 0,
        simulatedRiskScore: 0,
        disabledFactors: [],
        simulations: [],
        strongestDriversSummary: "Chain not found.",
      };
    }

    const disabledSet = new Set(disabledFactorNames);
    let simulatedScore = 0;

    chain.evidenceContributions.forEach((ev) => {
      if (!disabledSet.has(ev.factorName)) {
        simulatedScore += ev.points;
      }
    });

    const finalSimulatedScore = Math.min(100, Math.max(0, simulatedScore));

    return {
      originalRiskScore: chain.riskScore,
      simulatedRiskScore: finalSimulatedScore,
      disabledFactors: disabledFactorNames,
      simulations: chain.counterfactualAnalysis.simulations,
      strongestDriversSummary: chain.counterfactualAnalysis.strongestDriversSummary,
    };
  }

  /**
   * Updates Fraud Chain status (e.g. from CRITICAL to UNDER_REVIEW or RESOLVED)
   */
  public static updateChainStatus(
    chainId: string,
    newStatus: FraudChainStatus,
    adminInfo: { email: string; name: string; role: string; notes?: string }
  ): FraudChain | null {
    const all = this.getAllChains();
    const idx = all.findIndex((c) => c.id === chainId || c.chainId === chainId);
    if (idx === -1) return null;

    const previous = all[idx];
    const updated: FraudChain = {
      ...previous,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    all[idx] = updated;
    localStorage.setItem(FRAUD_CHAINS_STORAGE_KEY, JSON.stringify(all));

    // Commit to immutable audit trail
    FraudAuditService.logAction({
      transactionId: updated.primaryTransactionId,
      beneficiaryId: updated.involvedBeneficiaryIds[0] || "MULTIPLE",
      adminEmail: adminInfo.email,
      adminName: adminInfo.name,
      adminRole: adminInfo.role,
      action: "FRAUD_CHAIN_STATUS_CHANGE",
      notes: adminInfo.notes || `Fraud Chain ${chainId} status transition from ${previous.status} to ${newStatus}`,
      previousRiskScore: previous.riskScore,
      resultingDecision: newStatus === "CRITICAL" ? "INVESTIGATION" : newStatus === "RESOLVED" ? "NORMAL" : "ADMIN_REVIEW",
      district: updated.district,
      shop: updated.shopName,
      chainId: updated.id,
    });

    return updated;
  }

  /**
   * Resolves a Fraud Chain with human findings and adjusts beneficiary dynamic trust.
   */
  public static resolveChain(
    chainId: string,
    resolution: FraudChainResolution,
    adminInfo: { email: string; name: string; role: string }
  ): FraudChain | null {
    const all = this.getAllChains();
    const idx = all.findIndex((c) => c.id === chainId || c.chainId === chainId);
    if (idx === -1) return null;

    const previous = all[idx];
    const updated: FraudChain = {
      ...previous,
      status: "RESOLVED",
      resolution,
      updatedAt: new Date().toISOString(),
    };

    all[idx] = updated;
    localStorage.setItem(FRAUD_CHAINS_STORAGE_KEY, JSON.stringify(all));

    // Dynamic Trust Adjustment for involved beneficiaries
    if (resolution.trustScoreAdjustment !== 0) {
      previous.involvedBeneficiaryIds.forEach((benId) => {
        RationDnaService.updateTrustScore(
          benId,
          resolution.trustScoreAdjustment,
          `Fraud Chain ${chainId} resolved: ${resolution.finding} (${resolution.resolutionReason})`
        );
      });
    }

    // Commit resolution to immutable audit log
    FraudAuditService.logAction({
      transactionId: updated.primaryTransactionId,
      beneficiaryId: updated.involvedBeneficiaryIds.join(", "),
      adminEmail: adminInfo.email,
      adminName: adminInfo.name,
      adminRole: adminInfo.role,
      action: "FRAUD_CHAIN_RESOLVED",
      notes: `Fraud Chain ${chainId} resolved as ${resolution.finding}: ${resolution.resolutionReason}. Trust adjustment: +${resolution.trustScoreAdjustment}`,
      previousRiskScore: previous.riskScore,
      resultingDecision: "NORMAL",
      district: updated.district,
      shop: updated.shopName,
      chainId: updated.id,
    });

    return updated;
  }

  /**
   * Checks if a transaction is associated with any active Fraud Chain.
   */
  public static getActiveChainForTransaction(transactionId: string): FraudChain | null {
    const all = this.getAllChains();
    return (
      all.find(
        (c) =>
          c.status !== "RESOLVED" &&
          (c.primaryTransactionId === transactionId || c.linkedTransactionIds.includes(transactionId))
      ) || null
    );
  }
}
