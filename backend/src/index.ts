import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { testConnection } from "./db/pool";
import { blockchainLedgerService } from "./services/blockchainLedgerService";
import blockchainRoutes from "./routes/blockchain";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/blockchain", blockchainRoutes);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "click2ration-blockchain-api",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ── Start ──────────────────────────────────────────────────────────────────
async function start() {
  console.log("[server] Starting Click2Ration Blockchain API...");

  const dbOk = await testConnection();
  if (!dbOk) {
    console.error("[server] Cannot connect to PostgreSQL. Check .env DB_* settings.");
    console.log("[server] Hint: Copy backend/.env.example to backend/.env and configure your DB credentials.");
    process.exit(1);
  }
  console.log("[server] PostgreSQL connected.");

  // Ensure genesis block exists
  await blockchainLedgerService.initialize();
  console.log("[server] Blockchain ledger initialized.");

  app.listen(PORT, () => {
    console.log(`[server] Listening on http://localhost:${PORT}`);
    console.log(`[server] Endpoints:`);
    console.log(`  POST http://localhost:${PORT}/blockchain/stock-transfer`);
    console.log(`  POST http://localhost:${PORT}/blockchain/inventory-move`);
    console.log(`  POST http://localhost:${PORT}/blockchain/fraud-log`);
    console.log(`  POST http://localhost:${PORT}/blockchain/delivery-proof`);
    console.log(`  GET  http://localhost:${PORT}/blockchain/history`);
    console.log(`  GET  http://localhost:${PORT}/blockchain/verify-chain`);
    console.log(`  GET  http://localhost:${PORT}/blockchain/audit-report`);
    console.log(`  GET  http://localhost:${PORT}/blockchain/stats`);
    console.log(`  GET  http://localhost:${PORT}/blockchain/fraud-analysis`);
    console.log(`  GET  http://localhost:${PORT}/blockchain/verify/:txId`);
    console.log(`  GET  http://localhost:${PORT}/blockchain/block/:blockNumber`);
  });
}

start();
