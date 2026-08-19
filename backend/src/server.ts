import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import blockchainRoutes from "./routes/blockchain";
import fraudRoutes from "./routes/fraudIntelligence";
import { BlockchainLedgerService } from "./services/blockchainLedgerService";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "1mb" }));

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/blockchain", blockchainRoutes);
app.use("/fraud", fraudRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "click2ration-blockchain", timestamp: new Date().toISOString() });
});

// ── Boot ──────────────────────────────────────────────────────────────────
async function start() {
  // Ensure genesis block exists on startup
  try {
    const svc = new BlockchainLedgerService();
    await svc.initGenesis();
    console.log("[Click2Ration] Blockchain genesis block ready.");
  } catch (err) {
    console.warn("[Click2Ration] Could not init genesis (DB may not be ready yet):", (err as Error).message);
  }

  app.listen(PORT, () => {
    console.log(`[Click2Ration] Blockchain API running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   Ledger: http://localhost:${PORT}/blockchain/history`);
  });
}

start();
