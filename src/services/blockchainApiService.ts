/**
 * blockchainApiService
 *
 * Unified API adapter for the blockchain backend.
 * - When the Node.js backend is running (localhost:4000), calls real REST APIs.
 * - When the backend is offline, transparently falls back to the local
 *   blockchainService (localStorage mock) so the UI always works.
 *
 * The UI shows a "Live / Mock" indicator based on which mode is active.
 */

import { blockchainService, Block, StockTransferPayload, FraudLogPayload, AuditReport } from "./blockchainService";

const BASE_URL = "http://localhost:4000/blockchain";
const TIMEOUT_MS = 3000;

// ── Fetch with timeout ─────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ── Backend response → frontend Block shape mapper ─────────────────────────

function toBlock(b: any): Block {
  return {
    index: b.blockNumber ?? b.index,
    transactionId: b.transactionId,
    timestamp: b.createdAt ?? b.timestamp,
    transferType: b.transactionType ?? b.transferType,
    payload: b.payload,
    previousHash: b.previousHash ?? b.previous_hash,
    hash: b.currentHash ?? b.hash,
    nonce: b.nonce ?? 0,
    verificationStatus: b.verificationStatus ?? b.verification_status ?? "VERIFIED",
    nodeId: b.nodeId ?? b.node_id ?? "NODE-SUPERADMIN-01",
    // Extra fields from real backend
    digitalSignature: b.digitalSignature,
  } as Block & { digitalSignature?: string };
}

// ── Service ────────────────────────────────────────────────────────────────

export type ApiMode = "real" | "mock";

class BlockchainApiService {
  public mode: ApiMode = "mock";

  private async tryReal<T>(realFn: () => Promise<T>, mockFn: () => T | Promise<T>): Promise<T> {
    try {
      const result = await realFn();
      this.mode = "real";
      return result;
    } catch {
      this.mode = "mock";
      return mockFn();
    }
  }

  // ── GET /blockchain/history ──────────────────────────────────────────────

  async getHistory(limit = 50): Promise<Block[]> {
    return this.tryReal(
      async () => {
        const data = await apiFetch<{ blocks: any[] }>(`/history?limit=${limit}`);
        return data.blocks.map(toBlock);
      },
      () => blockchainService.getHistory(limit)
    );
  }

  // ── GET /blockchain/stats ────────────────────────────────────────────────

  async getStats() {
    return this.tryReal(
      () => apiFetch<any>("/stats"),
      () => blockchainService.getStats()
    );
  }

  // ── GET /blockchain/verify-chain ─────────────────────────────────────────

  async verifyChain() {
    return this.tryReal(
      () => apiFetch<any>("/verify-chain"),
      async () => {
        const result = await blockchainService.verifyChain();
        return {
          valid: result.valid,
          checkedBlocks: blockchainService.getChain().length,
          tamperedBlocks: result.tamperedBlocks.map(n => ({ blockNumber: n, expectedHash: "", foundHash: "" })),
          verifiedAt: new Date().toISOString(),
        };
      }
    );
  }

  // ── GET /blockchain/audit-report ─────────────────────────────────────────

  async getAuditReport(): Promise<AuditReport> {
    return this.tryReal(
      () => apiFetch<AuditReport>("/audit-report"),
      () => blockchainService.getAuditReport()
    );
  }

  // ── GET /blockchain/verify/:txId ─────────────────────────────────────────

  async verifyTransaction(txId: string) {
    return this.tryReal(
      async () => {
        const data = await apiFetch<any>(`/verify/${encodeURIComponent(txId)}`);
        return { found: data.found, valid: data.valid, block: data.block ? toBlock(data.block) : undefined };
      },
      () => blockchainService.verifyTransaction(txId)
    );
  }

  // ── POST /blockchain/stock-transfer ──────────────────────────────────────

  async recordStockTransfer(payload: Omit<StockTransferPayload, "transferType"> & { transferType?: string }): Promise<Block | null> {
    return this.tryReal(
      async () => {
        const data = await apiFetch<{ block: any }>("/stock-transfer", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        return toBlock(data.block);
      },
      async () => {
        const fullPayload: StockTransferPayload = {
          ...payload,
          transferType: (payload.transferType as StockTransferPayload["transferType"]) ?? "WAREHOUSE_TO_DISTRICT",
        };
        return blockchainService.recordStockTransfer(fullPayload);
      }
    );
  }

  // ── POST /blockchain/inventory-move ──────────────────────────────────────

  async recordInventoryMove(payload: Omit<StockTransferPayload, "transferType">): Promise<Block | null> {
    return this.tryReal(
      async () => {
        const data = await apiFetch<{ block: any }>("/inventory-move", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        return toBlock(data.block);
      },
      async () => {
        const full: StockTransferPayload = { ...payload, transferType: "INVENTORY_MOVEMENT" };
        return blockchainService.recordStockTransfer(full);
      }
    );
  }

  // ── POST /blockchain/fraud-log ────────────────────────────────────────────

  async recordFraudLog(payload: FraudLogPayload): Promise<{ block: Block; riskScore?: any } | null> {
    return this.tryReal(
      async () => {
        const data = await apiFetch<{ block: any; riskScore: any }>("/fraud-log", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        return { block: toBlock(data.block), riskScore: data.riskScore };
      },
      async () => {
        const block = await blockchainService.recordFraudLog(payload);
        return { block };
      }
    );
  }

  // ── POST /blockchain/delivery-proof ──────────────────────────────────────

  async recordDeliveryProof(payload: Omit<StockTransferPayload, "transferType">): Promise<Block | null> {
    return this.tryReal(
      async () => {
        const data = await apiFetch<{ block: any }>("/delivery-proof", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        return toBlock(data.block);
      },
      async () => {
        const full: StockTransferPayload = { ...payload, transferType: "INVENTORY_MOVEMENT" };
        return blockchainService.recordStockTransfer(full);
      }
    );
  }

  // ── GET /blockchain/fraud-scores ─────────────────────────────────────────

  async getFraudScores(): Promise<any[]> {
    return this.tryReal(
      () => apiFetch<any[]>("/fraud-scores"),
      () => [] // no mock equivalent needed
    );
  }

  // ── GET /blockchain/block/:n ──────────────────────────────────────────────

  async getBlock(blockNumber: number): Promise<Block | null> {
    return this.tryReal(
      async () => {
        const data = await apiFetch<any>(`/block/${blockNumber}`);
        return toBlock(data);
      },
      () => {
        const b = blockchainService.getBlock(blockNumber);
        return b ?? null;
      }
    );
  }
}

export const blockchainApiService = new BlockchainApiService();
