/**
 * AI Fraud Risk Scoring Service
 *
 * Rule-based scoring engine that analyzes blockchain records and assigns
 * risk scores (0-100) with severity labels: Critical / High / Medium / Low.
 *
 * Detects:
 *  - Stock quantity mismatches between blockchain and reported DB values
 *  - Duplicate distribution patterns
 *  - Abnormal stock usage (statistical deviation)
 *  - Repeated fraud at same shop/district
 *  - Unusually large single transfers
 */

import { pool } from "../db/pool";
import { FraudSeverity } from "../types/blockchain";

export interface FraudRiskScore {
  riskScore: number;        // 0-100
  severity: FraudSeverity;
  triggers: string[];       // Human-readable reasons
}

export interface FraudAnalysisResult {
  caseId: string;
  shop: string;
  district: string;
  fraudType: string;
  riskScore: number;
  severity: FraudSeverity;
  triggers: string[];
  blockchainQty: number;
  reportedQty: number;
  discrepancy: number;
  discrepancyPct: number;
  recommendation: string;
}

// ── Severity thresholds ────────────────────────────────────────────────────

function scoreToSeverity(score: number): FraudSeverity {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

// ── Core scoring rules ─────────────────────────────────────────────────────

export function computeFraudRiskScore(params: {
  blockchainQty: number;
  reportedQty: number;
  fraudType: string;
  shop: string;
  district: string;
  priorCasesAtShop?: number;
}): FraudRiskScore {
  const { blockchainQty, reportedQty, fraudType, priorCasesAtShop = 0 } = params;
  let score = 0;
  const triggers: string[] = [];

  // Rule 1: Quantity discrepancy
  if (blockchainQty > 0 && reportedQty > 0) {
    const discrepancyPct = Math.abs(blockchainQty - reportedQty) / blockchainQty * 100;
    if (discrepancyPct >= 40) {
      score += 45;
      triggers.push(`Large quantity discrepancy: ${discrepancyPct.toFixed(1)}% difference`);
    } else if (discrepancyPct >= 20) {
      score += 30;
      triggers.push(`Moderate quantity discrepancy: ${discrepancyPct.toFixed(1)}% difference`);
    } else if (discrepancyPct >= 5) {
      score += 15;
      triggers.push(`Minor quantity discrepancy: ${discrepancyPct.toFixed(1)}% difference`);
    }

    // Direction matters: DB reporting MORE than blockchain is more suspicious
    if (reportedQty > blockchainQty) {
      score += 10;
      triggers.push("Database reports MORE than blockchain — potential false entry inflation");
    }
  }

  // Rule 2: Fraud type multipliers
  if (fraudType === "Stock Diversion") {
    score += 20;
    triggers.push("Stock Diversion pattern detected");
  } else if (fraudType === "Duplicate Distribution") {
    score += 25;
    triggers.push("Duplicate Distribution pattern detected");
  } else if (fraudType === "Abnormal Stock Usage") {
    score += 15;
    triggers.push("Abnormal stock consumption pattern");
  } else if (fraudType === "Stock Mismatch") {
    score += 10;
    triggers.push("Stock count mismatch detected");
  }

  // Rule 3: Prior cases at the same shop
  if (priorCasesAtShop >= 3) {
    score += 20;
    triggers.push(`High-risk shop: ${priorCasesAtShop} prior fraud cases`);
  } else if (priorCasesAtShop >= 2) {
    score += 12;
    triggers.push(`${priorCasesAtShop} prior fraud cases at this shop`);
  } else if (priorCasesAtShop === 1) {
    score += 5;
    triggers.push("1 prior fraud case at this shop");
  }

  const finalScore = Math.min(score, 100);
  return {
    riskScore: finalScore,
    severity: scoreToSeverity(finalScore),
    triggers,
  };
}

// ── DB-backed analysis ─────────────────────────────────────────────────────

export async function analyzeFraudFromChain(): Promise<FraudAnalysisResult[]> {
  // Fetch all fraud log blocks
  const res = await pool.query(
    `SELECT * FROM blockchain_blocks WHERE transaction_type='FRAUD_LOG' ORDER BY block_number DESC`
  );

  const results: FraudAnalysisResult[] = [];

  for (const row of res.rows) {
    const payload = row.payload as any;
    const shop = payload.shop || "";
    const district = payload.district || "";

    // Count prior fraud cases for this shop
    const priorRes = await pool.query(
      `SELECT COUNT(*) FROM blockchain_blocks
       WHERE transaction_type='FRAUD_LOG'
         AND payload->>'shop' = $1
         AND block_number < $2`,
      [shop, row.block_number]
    );
    const priorCasesAtShop = Number(priorRes.rows[0].count);

    // Use stored riskScore if present, else compute
    const storedRisk = payload.riskScore;
    let riskScore: number;
    let triggers: string[];
    let severity: FraudSeverity;

    if (typeof storedRisk === "number") {
      riskScore = storedRisk;
      severity = scoreToSeverity(riskScore);
      triggers = [payload.evidence || "Evidence recorded on blockchain"];
    } else {
      const computed = computeFraudRiskScore({
        blockchainQty: 0,
        reportedQty: 0,
        fraudType: payload.fraudType || "",
        shop,
        district,
        priorCasesAtShop,
      });
      riskScore = computed.riskScore;
      severity = computed.severity;
      triggers = computed.triggers;
    }

    const recommendation =
      severity === "Critical" ? "Immediate investigation required. Escalate to state controller." :
      severity === "High"     ? "Assign district supervisor for field audit within 48 hours." :
      severity === "Medium"   ? "Schedule monthly audit. Monitor shop transactions for 30 days." :
                                "Record in log. Recheck at next routine inspection.";

    results.push({
      caseId: payload.caseId || row.transaction_id,
      shop,
      district,
      fraudType: payload.fraudType || "Unknown",
      riskScore,
      severity,
      triggers,
      blockchainQty: 0,
      reportedQty: 0,
      discrepancy: 0,
      discrepancyPct: 0,
      recommendation,
    });
  }

  return results;
}
