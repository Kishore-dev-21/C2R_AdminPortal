import { Request, Response } from "express";
import { BlockchainLedgerService, computeFraudRiskScore } from "../services/BlockchainLedgerService";
import { FraudLogPayload, StockTransferPayload, TransactionType } from "../types";

const svc = new BlockchainLedgerService();

// ── POST /blockchain/stock-transfer ─────────────────────────────────────────

export async function postStockTransfer(req: Request, res: Response) {
  try {
    const { batchId, commodity, quantity, unit, source, destination, authorizedBy, orderId, transferType } = req.body;
    if (!batchId || !commodity || !quantity || !unit || !source || !destination || !authorizedBy) {
      return res.status(400).json({ error: "Missing required fields: batchId, commodity, quantity, unit, source, destination, authorizedBy" });
    }
    const validTypes: TransactionType[] = ["WAREHOUSE_TO_DISTRICT", "DISTRICT_TO_SHOP"];
    const txType: TransactionType = validTypes.includes(transferType) ? transferType : "WAREHOUSE_TO_DISTRICT";
    const payload: StockTransferPayload = { batchId, commodity, quantity: Number(quantity), unit, source, destination, authorizedBy, orderId, transferType: txType };
    const block = await svc.addStockTransfer(payload);
    return res.status(201).json({ success: true, block });
  } catch (err: any) {
    console.error("POST /blockchain/stock-transfer:", err);
    return res.status(500).json({ error: err.message });
  }
}

// ── POST /blockchain/inventory-move ─────────────────────────────────────────

export async function postInventoryMove(req: Request, res: Response) {
  try {
    const { batchId, commodity, quantity, unit, source, destination, authorizedBy, orderId } = req.body;
    if (!batchId || !commodity || !quantity || !unit || !source || !destination || !authorizedBy) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const payload: StockTransferPayload = { batchId, commodity, quantity: Number(quantity), unit, source, destination, authorizedBy, orderId, transferType: "INVENTORY_MOVEMENT" };
    const block = await svc.addInventoryMove(payload);
    return res.status(201).json({ success: true, block });
  } catch (err: any) {
    console.error("POST /blockchain/inventory-move:", err);
    return res.status(500).json({ error: err.message });
  }
}

// ── POST /blockchain/fraud-log ───────────────────────────────────────────────

export async function postFraudLog(req: Request, res: Response) {
  try {
    const { caseId, fraudType, district, shop, severity, detectedBy, evidence } = req.body;
    if (!caseId || !fraudType || !district || !shop || !severity || !detectedBy || !evidence) {
      return res.status(400).json({ error: "Missing required fraud log fields" });
    }
    const payload: FraudLogPayload = { caseId, fraudType, district, shop, severity, detectedBy, evidence };
    const block = await svc.addFraudLog(payload);
    const riskScore = computeFraudRiskScore(payload);
    return res.status(201).json({ success: true, block, riskScore });
  } catch (err: any) {
    console.error("POST /blockchain/fraud-log:", err);
    return res.status(500).json({ error: err.message });
  }
}

// ── POST /blockchain/delivery-proof ─────────────────────────────────────────

export async function postDeliveryProof(req: Request, res: Response) {
  try {
    const { batchId, commodity, quantity, unit, source, destination, authorizedBy, orderId } = req.body;
    if (!batchId || !commodity || !quantity || !unit || !source || !destination || !authorizedBy) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const payload: StockTransferPayload = { batchId, commodity, quantity: Number(quantity), unit, source, destination, authorizedBy, orderId, transferType: "DELIVERY_PROOF" };
    const block = await svc.addDeliveryProof(payload);
    return res.status(201).json({ success: true, block });
  } catch (err: any) {
    console.error("POST /blockchain/delivery-proof:", err);
    return res.status(500).json({ error: err.message });
  }
}

// ── GET /blockchain/history ──────────────────────────────────────────────────

export async function getHistory(req: Request, res: Response) {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const txType = req.query.type as string | undefined;
    const blocks = await svc.getHistory(limit, offset, txType);
    const stats = await svc.getStats();
    return res.json({ blocks, stats, total: stats.totalBlocks });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// ── GET /blockchain/verify-chain ─────────────────────────────────────────────

export async function getVerifyChain(req: Request, res: Response) {
  try {
    const result = await svc.verifyChain();
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// ── GET /blockchain/audit-report ─────────────────────────────────────────────

export async function getAuditReport(req: Request, res: Response) {
  try {
    const report = await svc.getAuditReport();
    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// ── GET /blockchain/stats ─────────────────────────────────────────────────────

export async function getStats(req: Request, res: Response) {
  try {
    const stats = await svc.getStats();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// ── GET /blockchain/verify-transaction/:txId ──────────────────────────────────

export async function getVerifyTransaction(req: Request, res: Response) {
  try {
    const { txId } = req.params;
    const result = await svc.verifyTransaction(txId);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// ── GET /blockchain/block/:blockNumber ────────────────────────────────────────

export async function getBlock(req: Request, res: Response) {
  try {
    const blockNumber = Number(req.params.blockNumber);
    if (isNaN(blockNumber)) return res.status(400).json({ error: "Invalid block number" });
    const block = await svc.getBlockByNumber(blockNumber);
    if (!block) return res.status(404).json({ error: "Block not found" });
    return res.json(block);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// ── GET /blockchain/fraud-scores ──────────────────────────────────────────────

export async function getFraudScores(req: Request, res: Response) {
  try {
    const blocks = await svc.getHistory(100, 0, "FRAUD_LOG");
    const scores = blocks.map(b => {
      const p = b.payload as FraudLogPayload;
      return { ...computeFraudRiskScore(p), caseId: p.caseId, transactionId: b.transactionId, blockNumber: b.blockNumber, createdAt: b.createdAt };
    });
    return res.json(scores);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
