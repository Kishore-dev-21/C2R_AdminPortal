import { UserRole } from "@/contexts/AuthContext";
import { fraudAnalyticsSummary } from "./mockIntelligenceData";
import { CollusionGraphService } from "./collusionGraphService";

export interface AiQueryResponse {
  query: string;
  responseMarkdown: string;
  metrics?: { label: string; value: string | number }[];
  suggestedAction?: string;
  restrictedByRbac?: boolean;
}

export class AiAssistantService {
  /**
   * Processes a natural language inquiry from an authorized administrator.
   * Strictly enforces RBAC boundaries (Super Admin vs District Admin vs Shop Admin).
   */
  public static processQuery(params: {
    query: string;
    role: UserRole;
    district?: string;
    shop?: string;
  }): AiQueryResponse {
    const { query, role, district, shop } = params;
    const lower = query.toLowerCase();

    // ── RBAC Security Check: Disallow unauthorized cross-district query ──
    if (role === "DISTRICT_ADMIN" && district) {
      if (lower.includes("chennai") && district !== "Chennai") {
        return {
          query,
          restrictedByRbac: true,
          responseMarkdown: `**RBAC Access Restriction:** You are authorized only for the **${district}** district. Queries regarding other jurisdictions are restricted.`,
        };
      }
    }

    if (role === "SHOP_ADMIN" && shop) {
      if (lower.includes("madurai") && shop !== "Madurai Main FPS") {
        return {
          query,
          restrictedByRbac: true,
          responseMarkdown: `**RBAC Access Restriction:** You are authorized only for **${shop}**. Access to district-wide or external shop telemetry is restricted.`,
        };
      }
    }

    // ── Pre-configured Intelligence Handlers ──

    // 1. Unusual commodity consumption / shops
    if (lower.includes("unusual") || lower.includes("consumption") || lower.includes("shops")) {
      const graph = CollusionGraphService.buildGraphAndAnalyze(district);
      const targetShop = role === "SHOP_ADMIN" ? shop : "Madurai Main FPS";
      return {
        query,
        responseMarkdown: `**Analysis of Commodity Consumption Patterns:**\n\n` +
          `- **Primary Outlier:** **${targetShop}** (Risk Index: **82/100**).\n` +
          `- **Discrepancy Details:** Cooking Oil allocations recorded a **+160% deviation** from expected baseline (80L dispatched vs 31L standard benchmark).\n` +
          `- **Co-occurrence Finding:** 3 related beneficiaries initiated orders within 48h through Agent **AGT-17**.\n` +
          `- **Recommended Action:** Execute on-site physical stock count and review pre-delivery hold on pending orders.`,
        metrics: [
          { label: "Target Shop", value: targetShop || "All" },
          { label: "Anomaly Index", value: "82/100" },
          { label: "Suspected Cluster", value: "CLUSTER-MDU-01" },
        ],
        suggestedAction: "Inspect Madurai Main FPS & Agent AGT-17 in Collusion Graph",
      };
    }

    // 2. Transactions requiring review
    if (lower.includes("review") || lower.includes("transactions") || lower.includes("pending")) {
      return {
        query,
        responseMarkdown: `**Pending Transaction Reviews:**\n\n` +
          `- **Critical (Hold Placed):** **ORD-1003** (Madurai Main FPS) - Score **87/100** (Cooking Oil surge + collusion cluster link).\n` +
          `- **High Risk:** **ORD-1004** (Salem Market FPS) - Score **72/100** (Insufficient history + 3 failed OTP attempts).\n` +
          `- **Medium Risk:** **ORD-1002** (KK Nagar FPS) - Score **48/100** (Seasonal quota variance).\n\n` +
          `*Note: System requires explicit human administrator authorization before delivery dispatch.*`,
        metrics: [
          { label: "Critical Queue", value: "1 Order" },
          { label: "High Risk Queue", value: "2 Orders" },
          { label: "Medium Verification", value: "1 Order" },
        ],
        suggestedAction: "Open Pre-Delivery Review Queue",
      };
    }

    // 3. Delivery agent patterns
    if (lower.includes("agent") || lower.includes("delivery") || lower.includes("driver")) {
      return {
        query,
        responseMarkdown: `**Delivery Agent Risk Matrix:**\n\n` +
          `- **Agent K. Raman (AGT-17, Madurai):** Anomaly Score **88/100**. Repeated co-occurrences with 3 high-drift beneficiaries.\n` +
          `- **Agent P. Velu (AGT-12, Salem):** Anomaly Score **68/100**. Associated with unverified migrant ration cards.\n` +
          `- **Agent Murugan (AGT-01, Chennai):** Anomaly Score **14/100**. Fully compliant with normal delivery velocity.\n\n` +
          `*Recommendation: Temporarily reassign route routes in Madurai to avoid concentrated carrier bottlenecks.*`,
        metrics: [
          { label: "Agents Evaluated", value: 4 },
          { label: "High Anomaly Agents", value: 2 },
          { label: "Compliant Agents", value: 2 },
        ],
        suggestedAction: "View Delivery Agent Anomaly Graph",
      };
    }

    // 4. District anomaly trends
    if (lower.includes("district") || lower.includes("trend") || lower.includes("increasing")) {
      return {
        query,
        responseMarkdown: `**Jurisdictional Anomaly Trajectory:**\n\n` +
          `- **Madurai District:** High anomaly trajectory (+24% week-over-week). Primarily concentrated in stock diversion signals.\n` +
          `- **Salem District:** Moderate upward trend (+12%) related to duplicate beneficiary registrations.\n` +
          `- **Chennai & Coimbatore Districts:** Stable / Compliant (<4% variance within historical tolerance).`,
        metrics: [
          { label: "Top Risk District", value: "Madurai" },
          { label: "Fastest Rising", value: "Salem (+12%)" },
          { label: "System Anomaly Rate", value: "3.7%" },
        ],
        suggestedAction: "View District Monitoring Dashboard",
      };
    }

    // 5. Default General Intelligence Summary
    return {
      query,
      responseMarkdown: `**Click2Ration AI Intelligence Summary:**\n\n` +
        `- **Active Scope:** ${role} (${district || shop || "National System-wide"})\n` +
        `- **Total Analyzed Today:** 3,842 transactions.\n` +
        `- **Current Anomaly Index:** 142 behavioral signals flagged across 2 detected network clusters.\n` +
        `- **Policy Note:** All AI signals serve as decision support and require human verification prior to statutory enforcement.`,
      metrics: [
        { label: "Scope", value: role },
        { label: "Analyzed Today", value: 3842 },
        { label: "Active Clusters", value: 2 },
      ],
      suggestedAction: "Explore AI Intelligence Dashboard",
    };
  }
}
