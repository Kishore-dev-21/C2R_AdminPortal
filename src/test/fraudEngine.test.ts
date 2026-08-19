import { describe, it, expect, beforeEach } from "vitest";
import { ExplainableRiskEngine } from "@/services/fraudEngine/explainableRiskEngine";
import { RationDnaService } from "@/services/fraudEngine/rationDnaService";
import { CollusionGraphService } from "@/services/fraudEngine/collusionGraphService";
import { FraudAuditService } from "@/services/fraudEngine/auditLogService";
import { AiAssistantService } from "@/services/fraudEngine/aiAssistantService";
import { FraudChainService } from "@/services/fraudEngine/fraudChainService";

describe("Click2Ration AI Fraud Intelligence Engine", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("1. Ration DNA & Behavioral Baseline", () => {
    it("should retrieve established baseline for known beneficiary", () => {
      const profile = RationDnaService.getProfile("BEN-TN-CHE-00101");
      expect(profile.hasSufficientHistory).toBe(true);
      expect(profile.totalHistoricalTransactions).toBeGreaterThanOrEqual(3);
      expect(profile.trustScore).toBeGreaterThanOrEqual(90);
    });

    it("should explicitly handle insufficient historical data without fabricating scores", () => {
      const profile = RationDnaService.getProfile("BEN-TN-SLM-00999");
      expect(profile.hasSufficientHistory).toBe(false);
      expect(profile.totalHistoricalTransactions).toBeLessThan(3);
    });

    it("should dynamically adjust trust scores on verified feedback", () => {
      const updated = RationDnaService.updateTrustScore("BEN-TN-CHE-00101", -15, "Test anomaly");
      expect(updated.trustScore).toBe(80);
      expect(updated.trustScoreStatus).toBe("STABLE");
    });
  });

  describe("2. Multi-Signal Pre-Delivery Fraud Evaluation", () => {
    it("should evaluate normal transaction within baseline as LOW RISK (NORMAL pass)", () => {
      const result = ExplainableRiskEngine.evaluateTransaction({
        transactionId: "ORD-TEST-001",
        beneficiaryId: "BEN-TN-CHE-00101",
        shopId: "s1",
        shopName: "Anna Nagar FPS",
        district: "Chennai",
        deliveryAgentId: "AGT-CHE-01",
        deliveryAgentName: "Agent Murugan",
        commodity: "Rice",
        quantity: 15,
        unit: "kg",
        timestamp: "2026-03-09T10:00:00Z",
        failedVerificationAttempts: 0,
      });

      expect(result.riskLevel).toBe("LOW");
      expect(result.preDeliveryDecision).toBe("NORMAL");
      expect(result.overallRiskScore).toBeLessThanOrEqual(40);
    });

    it("should detect behavioral drift + collusion and flag as CRITICAL RISK (INVESTIGATION)", () => {
      const result = ExplainableRiskEngine.evaluateTransaction({
        transactionId: "ORD-TEST-002",
        beneficiaryId: "BEN-TN-MDU-00842",
        shopId: "s6",
        shopName: "Salem Market FPS",
        district: "Salem",
        deliveryAgentId: "AGT-MDU-01",
        deliveryAgentName: "Agent K. Raman (AGT-17)",
        commodity: "Cooking Oil",
        quantity: 80, // High surge
        unit: "L",
        timestamp: "2026-03-09T23:45:00", // Midnight off-peak
        failedVerificationAttempts: 3,     // Repeated failures
      });

      expect(result.riskLevel).toBe("CRITICAL");
      expect(result.preDeliveryDecision).toBe("INVESTIGATION");
      expect(result.overallRiskScore).toBeGreaterThanOrEqual(85);
      expect(result.featureContributions.length).toBeGreaterThan(0);
      expect(result.plainLanguageExplanation).toContain("deviates from the beneficiary's historical baseline");
    });

    it("should handle insufficient historical data safely with probationary baseline", () => {
      const result = ExplainableRiskEngine.evaluateTransaction({
        transactionId: "ORD-TEST-003",
        beneficiaryId: "BEN-TN-SLM-00999",
        shopId: "s6",
        shopName: "Salem Market FPS",
        district: "Salem",
        deliveryAgentId: "AGT-SLM-01",
        deliveryAgentName: "Agent P. Velu",
        commodity: "Rice",
        quantity: 20,
        unit: "kg",
        timestamp: "2026-03-09T11:00:00Z",
      });

      expect(result.hasSufficientHistory).toBe(false);
      expect(result.plainLanguageExplanation).toContain("Insufficient historical data");
    });
  });

  describe("3. Collusion Graph & Network Clustering", () => {
    it("should detect network cluster CLUSTER-MDU-01 linking multiple beneficiaries", () => {
      const graph = CollusionGraphService.buildGraphAndAnalyze();
      expect(graph.detectedClusters.length).toBeGreaterThan(0);
      const mduCluster = graph.detectedClusters.find(c => c.clusterId === "CLUSTER-MDU-01");
      expect(mduCluster).toBeDefined();
      expect(mduCluster?.involvedBeneficiaryIds.length).toBe(3);
    });

    it("should filter graph nodes and edges by district RBAC scope", () => {
      const graphChennai = CollusionGraphService.buildGraphAndAnalyze("Chennai");
      expect(graphChennai.nodes.every(n => !n.district || n.district === "Chennai")).toBe(true);
    });
  });

  describe("4. Administrative Audit Logging", () => {
    it("should append immutable action logs and retrieve them", () => {
      const action = FraudAuditService.logAction({
        transactionId: "ORD-TEST-100",
        beneficiaryId: "BEN-TN-CHE-00101",
        adminEmail: "superadmin@click2ration.gov",
        adminName: "Super Admin",
        adminRole: "SUPER_ADMIN",
        action: "APPROVE_DELIVERY",
        notes: "Test manual verification completed",
        previousRiskScore: 30,
        resultingDecision: "NORMAL",
        district: "Chennai",
        shop: "Anna Nagar FPS",
      });

      expect(action.id).toBeDefined();
      const logs = FraudAuditService.getAuditLogs();
      expect(logs.some(l => l.transactionId === "ORD-TEST-100")).toBe(true);
    });
  });

  describe("5. AI Assistant RBAC Scoping", () => {
    it("should restrict District Admin from accessing other jurisdictions", () => {
      const response = AiAssistantService.processQuery({
        query: "Show anomaly rates for Chennai",
        role: "DISTRICT_ADMIN",
        district: "Madurai",
      });

      expect(response.restrictedByRbac).toBe(true);
      expect(response.responseMarkdown).toContain("RBAC Access Restriction");
    });

    it("should allow Super Admin full statewide intelligence insights", () => {
      const response = AiAssistantService.processQuery({
        query: "Which shops show unusual consumption?",
        role: "SUPER_ADMIN",
      });

      expect(response.restrictedByRbac).toBeUndefined();
      expect(response.responseMarkdown).toContain("Madurai Main FPS");
    });
  });

  describe("6. Fraud Chain Intelligence & Counterfactual Simulation", () => {
    it("should retrieve active Fraud Chains and reconstruct timeline events", () => {
      const chains = FraudChainService.getAllChains();
      expect(chains.length).toBeGreaterThan(0);
      const mduChain = chains.find(c => c.chainId === "FC-MDU-001");
      expect(mduChain).toBeDefined();
      expect(mduChain?.timelineEvents.length).toBeGreaterThanOrEqual(5);
      expect(mduChain?.evidenceContributions.length).toBeGreaterThanOrEqual(4);
    });

    it("should dynamically simulate counterfactual removal of evidence factors", () => {
      const sim = FraudChainService.simulateCounterfactual("FC-MDU-001", [
        "Behavioral Drift (Ration DNA)",
        "Physical vs Digital Inventory Discrepancy",
      ]);

      expect(sim.originalRiskScore).toBe(88);
      expect(sim.simulatedRiskScore).toBe(46);
      expect(sim.simulatedRiskScore).toBeLessThan(sim.originalRiskScore);
    });

    it("should resolve a fraud chain, adjust beneficiary trust, and commit to audit ledger", () => {
      const resolved = FraudChainService.resolveChain(
        "FC-MDU-001",
        {
          finding: "LEGITIMATE_DISCREPANCY",
          resolutionReason: "Manual stock correction was delayed and verified by inspector.",
          resolvedBy: "Super Admin",
          resolvedAt: new Date().toISOString(),
          trustScoreAdjustment: 4,
        },
        {
          email: "superadmin@click2ration.gov",
          name: "Super Admin",
          role: "SUPER_ADMIN",
        }
      );

      expect(resolved?.status).toBe("RESOLVED");
      expect(resolved?.resolution?.finding).toBe("LEGITIMATE_DISCREPANCY");

      // Verify trust score recovered
      const profile = RationDnaService.getProfile("BEN-TN-MDU-00842");
      expect(profile.trustScore).toBeGreaterThan(78);

      // Verify audit trail record
      const logs = FraudAuditService.getAuditLogs();
      expect(logs.some(l => l.action === "FRAUD_CHAIN_RESOLVED")).toBe(true);
    });
  });
});
