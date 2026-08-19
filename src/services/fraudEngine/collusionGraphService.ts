import {
  GraphNode,
  GraphEdge,
  CollusionCluster,
  GraphCollusionResult,
} from "./types";

export class CollusionGraphService {
  /**
   * Generates the PDS relationship graph and detects suspicious collusion clusters.
   */
  public static buildGraphAndAnalyze(districtFilter?: string): GraphCollusionResult {
    // 1. Define nodes
    const allNodes: GraphNode[] = [
      // Districts
      { id: "dist-chennai", label: "Chennai District", type: "DISTRICT", district: "Chennai" },
      { id: "dist-madurai", label: "Madurai District", type: "DISTRICT", district: "Madurai" },
      { id: "dist-coimbatore", label: "Coimbatore District", type: "DISTRICT", district: "Coimbatore" },
      { id: "dist-salem", label: "Salem District", type: "DISTRICT", district: "Salem" },

      // Shops
      { id: "shop-s1", label: "Anna Nagar FPS", type: "SHOP", district: "Chennai", metadata: { shopId: "s1" } },
      { id: "shop-s2", label: "KK Nagar FPS", type: "SHOP", district: "Chennai", metadata: { shopId: "s2" } },
      { id: "shop-s4", label: "Madurai Main FPS", type: "SHOP", district: "Madurai", isSuspicious: true, riskScore: 82, metadata: { shopId: "s4" } },
      { id: "shop-s5", label: "Coimbatore Central FPS", type: "SHOP", district: "Coimbatore", metadata: { shopId: "s5" } },
      { id: "shop-s6", label: "Salem Market FPS", type: "SHOP", district: "Salem", isSuspicious: true, riskScore: 71, metadata: { shopId: "s6" } },

      // Delivery Agents
      { id: "agent-che-01", label: "Agent Murugan (AGT-01)", type: "DELIVERY_AGENT", district: "Chennai" },
      { id: "agent-mdu-01", label: "Agent K. Raman (AGT-17)", type: "DELIVERY_AGENT", district: "Madurai", isSuspicious: true, riskScore: 88 },
      { id: "agent-cbe-01", label: "Agent S. Kumar (AGT-08)", type: "DELIVERY_AGENT", district: "Coimbatore" },
      { id: "agent-slm-01", label: "Agent P. Velu (AGT-12)", type: "DELIVERY_AGENT", district: "Salem", isSuspicious: true, riskScore: 68 },

      // Beneficiaries & Cards (Anonymized)
      { id: "ben-101", label: "Ben-CHE-101", type: "BENEFICIARY", district: "Chennai", metadata: { fullId: "BEN-TN-CHE-00101" } },
      { id: "ben-102", label: "Ben-CHE-102", type: "BENEFICIARY", district: "Chennai", metadata: { fullId: "BEN-TN-CHE-00102" } },
      { id: "ben-103", label: "Ben-CHE-103", type: "BENEFICIARY", district: "Chennai", metadata: { fullId: "BEN-TN-CHE-00103" } },
      { id: "ben-842", label: "Ben-MDU-842", type: "BENEFICIARY", district: "Madurai", isSuspicious: true, riskScore: 87, metadata: { fullId: "BEN-TN-MDU-00842" } },
      { id: "ben-843", label: "Ben-MDU-843", type: "BENEFICIARY", district: "Madurai", isSuspicious: true, riskScore: 84, metadata: { fullId: "BEN-TN-MDU-00843" } },
      { id: "ben-844", label: "Ben-MDU-844", type: "BENEFICIARY", district: "Madurai", isSuspicious: true, riskScore: 81, metadata: { fullId: "BEN-TN-MDU-00844" } },
      { id: "ben-401", label: "Ben-CBE-401", type: "BENEFICIARY", district: "Coimbatore", metadata: { fullId: "BEN-TN-CBE-00401" } },
      { id: "ben-999", label: "Ben-SLM-999", type: "BENEFICIARY", district: "Salem", metadata: { fullId: "BEN-TN-SLM-00999" } },

      // High-risk Active Transactions
      { id: "tx-ord-1003", label: "ORD-1003 (80L Oil)", type: "TRANSACTION", district: "Madurai", isSuspicious: true, riskScore: 87 },
      { id: "tx-ord-1006", label: "ORD-1006 (150kg Mix)", type: "TRANSACTION", district: "Madurai", isSuspicious: true, riskScore: 84 },
      { id: "tx-ord-1004", label: "ORD-1004 (150kg Rice)", type: "TRANSACTION", district: "Salem", isSuspicious: true, riskScore: 72 },
      { id: "tx-ord-1001", label: "ORD-1001 (200kg Rice)", type: "TRANSACTION", district: "Chennai" },
    ];

    // 2. Define edges
    const allEdges: GraphEdge[] = [
      // Normal Chennai Links
      { id: "e-1", source: "shop-s1", target: "dist-chennai", type: "ASSIGNED_TO" },
      { id: "e-2", source: "agent-che-01", target: "shop-s1", type: "ASSIGNED_TO" },
      { id: "e-3", source: "ben-101", target: "shop-s1", type: "ORDERED_FROM" },
      { id: "e-4", source: "ben-102", target: "shop-s1", type: "ORDERED_FROM" },
      { id: "e-5", source: "ben-103", target: "shop-s1", type: "ORDERED_FROM" },
      { id: "e-6", source: "agent-che-01", target: "tx-ord-1001", type: "DELIVERED_BY" },

      // Suspicious Madurai Collusion Cluster (Shop S4 + Agent 17 + Multiple Beneficiaries)
      { id: "e-7", source: "shop-s4", target: "dist-madurai", type: "ASSIGNED_TO" },
      { id: "e-8", source: "agent-mdu-01", target: "shop-s4", type: "ASSIGNED_TO", isSuspicious: true },
      { id: "e-9", source: "ben-842", target: "shop-s4", type: "ORDERED_FROM", isSuspicious: true },
      { id: "e-10", source: "ben-843", target: "shop-s4", type: "ORDERED_FROM", isSuspicious: true },
      { id: "e-11", source: "ben-844", target: "shop-s4", type: "ORDERED_FROM", isSuspicious: true },
      { id: "e-12", source: "agent-mdu-01", target: "tx-ord-1003", type: "DELIVERED_BY", isSuspicious: true },
      { id: "e-13", source: "agent-mdu-01", target: "tx-ord-1006", type: "DELIVERED_BY", isSuspicious: true },
      { id: "e-14", source: "tx-ord-1003", target: "ben-842", type: "VERIFIED_AT", isSuspicious: true },
      { id: "e-15", source: "tx-ord-1006", target: "ben-843", type: "VERIFIED_AT", isSuspicious: true },
      { id: "e-16", source: "agent-mdu-01", target: "ben-842", type: "REPEATED_INTERACTION", isSuspicious: true, weight: 6 },
      { id: "e-17", source: "agent-mdu-01", target: "ben-843", type: "REPEATED_INTERACTION", isSuspicious: true, weight: 5 },
      { id: "e-18", source: "agent-mdu-01", target: "ben-844", type: "REPEATED_INTERACTION", isSuspicious: true, weight: 7 },

      // Coimbatore & Salem Links
      { id: "e-19", source: "shop-s5", target: "dist-coimbatore", type: "ASSIGNED_TO" },
      { id: "e-20", source: "ben-401", target: "shop-s5", type: "ORDERED_FROM" },
      { id: "e-21", source: "shop-s6", target: "dist-salem", type: "ASSIGNED_TO" },
      { id: "e-22", source: "ben-999", target: "shop-s6", type: "ORDERED_FROM" },
      { id: "e-23", source: "agent-slm-01", target: "tx-ord-1004", type: "DELIVERED_BY", isSuspicious: true },
    ];

    // 3. Cluster Analysis: Find suspicious co-occurrence rings
    const detectedClusters: CollusionCluster[] = [
      {
        clusterId: "CLUSTER-MDU-01",
        shopId: "s4",
        shopName: "Madurai Main FPS",
        agentId: "AGT-MDU-01",
        agentName: "Agent K. Raman (AGT-17)",
        district: "Madurai",
        involvedBeneficiaryIds: ["BEN-TN-MDU-00842", "BEN-TN-MDU-00843", "BEN-TN-MDU-00844"],
        suspiciousTransactionIds: ["ORD-1003", "ORD-1006"],
        clusterRiskScore: 88,
        cooccurrenceCount: 18,
        reason: "Co-occurrence anomaly: 3 beneficiaries exhibiting simultaneous volume drifts funneled exclusively through Agent AGT-17 and Madurai Main FPS within 48h.",
        detectedAt: "2026-03-09 10:45",
      },
      {
        clusterId: "CLUSTER-SLM-02",
        shopId: "s6",
        shopName: "Salem Market FPS",
        agentId: "AGT-SLM-01",
        agentName: "Agent P. Velu (AGT-12)",
        district: "Salem",
        involvedBeneficiaryIds: ["BEN-TN-SLM-00999"],
        suspiciousTransactionIds: ["ORD-1004"],
        clusterRiskScore: 71,
        cooccurrenceCount: 4,
        reason: "Duplicate beneficiary pattern linked to new unverified migrant card at Salem Market FPS.",
        detectedAt: "2026-03-09 11:20",
      },
    ];

    // Apply RBAC district filter if provided
    let nodes = allNodes;
    let edges = allEdges;
    let clusters = detectedClusters;

    if (districtFilter && districtFilter !== "All") {
      nodes = allNodes.filter(n => !n.district || n.district === districtFilter);
      const nodeIds = new Set(nodes.map(n => n.id));
      edges = allEdges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
      clusters = detectedClusters.filter(c => c.district === districtFilter);
    }

    return {
      nodes,
      edges,
      detectedClusters: clusters,
      level3NetworkScore: clusters.length > 0 ? 30 : 0,
      networkTriggers: clusters.map(c => c.reason),
    };
  }

  /**
   * Checks whether a specific transaction/beneficiary is linked to an active suspicious cluster.
   */
  public static checkTransactionNetworkAnomaly(
    beneficiaryId: string,
    shopId: string,
    agentId?: string
  ): { isNetworkAnomaly: boolean; networkRiskPoints: number; reason?: string } {
    if (
      shopId === "s4" &&
      (beneficiaryId.includes("MDU") || (agentId && agentId.includes("MDU")))
    ) {
      return {
        isNetworkAnomaly: true,
        networkRiskPoints: 24,
        reason: "Potential Network Anomaly: Transaction is linked to suspicious cluster CLUSTER-MDU-01 (Agent AGT-17 + Madurai Main FPS).",
      };
    }
    return {
      isNetworkAnomaly: false,
      networkRiskPoints: 0,
    };
  }
}
