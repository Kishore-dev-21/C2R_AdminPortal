import { Router } from "express";
import {
  postStockTransfer,
  postInventoryMove,
  postFraudLog,
  postDeliveryProof,
  getHistory,
  getVerifyChain,
  getAuditReport,
  getStats,
  getVerifyTransaction,
  getBlock,
  getFraudScores,
} from "../controllers/blockchainController";

const router = Router();

// Write endpoints (POST)
router.post("/stock-transfer",   postStockTransfer);
router.post("/inventory-move",   postInventoryMove);
router.post("/fraud-log",        postFraudLog);
router.post("/delivery-proof",   postDeliveryProof);

// Read endpoints (GET)
router.get("/history",           getHistory);
router.get("/verify-chain",      getVerifyChain);
router.get("/audit-report",      getAuditReport);
router.get("/stats",             getStats);
router.get("/fraud-scores",      getFraudScores);
router.get("/verify/:txId",      getVerifyTransaction);
router.get("/block/:blockNumber", getBlock);

export default router;
