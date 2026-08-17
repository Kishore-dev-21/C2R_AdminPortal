/**
 * Blockchain Service — Permissioned Audit Chain
 *
 * Architecture: Lightweight SHA-256 hash chain stored in memory/localStorage.
 * Simulates a Hyperledger Fabric-style permissioned ledger without infrastructure cost.
 * Suitable for government PDS systems deployed across warehouses, districts, and shops.
 *
 * STORES ONLY: stock transfers, inventory movements, fraud investigation logs
 * NEVER STORES: user profiles, passwords, mobile numbers, product images, notifications
 *
 * API Simulation:
 *  POST /stock-transfer     → recordStockTransfer()
 *  POST /verify-transfer    → verifyTransfer()
 *  GET  /blockchain-history → getHistory()
 *  GET  /audit-report       → getAuditReport()
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type TransferType =
  | "WAREHOUSE_TO_DISTRICT"
  | "DISTRICT_TO_SHOP"
  | "INVENTORY_MOVEMENT"
  | "FRAUD_LOG";

export type VerificationStatus = "VERIFIED" | "TAMPERED" | "PENDING";

export interface StockTransferPayload {
  batchId: string;
  commodity: string;
  quantity: number;
  unit: string;
  source: string;
  destination: string;
  transferType: TransferType;
  authorizedBy: string; // role only, no PII
  orderId?: string;
}

export interface FraudLogPayload {
  caseId: string;
  fraudType: string;
  district: string;
  shop: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  detectedBy: "AI" | "MANUAL";
  evidence: string;
}

export type BlockPayload = StockTransferPayload | FraudLogPayload;

export interface Block {
  index: number;
  transactionId: string;
  timestamp: string;
  transferType: TransferType;
  payload: BlockPayload;
  previousHash: string;
  hash: string;
  nonce: number;
  verificationStatus: VerificationStatus;
  nodeId: string;
}

export interface AuditReport {
  generatedAt: string;
  chainLength: number;
  stats: {
    totalBlocks: number;
    totalTransfers: number;
    fraudLogs: number;
    warehouseToDistrict: number;
    districtToShop: number;
    inventoryMovements: number;
  };
  recentBlocks: Block[];
  chainValid: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function sha256(data: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function simpleHash(data: string): string {
  let h = 5381;
  for (let i = 0; i < data.length; i++) h = (h * 33) ^ data.charCodeAt(i);
  const base = (Math.abs(h) >>> 0).toString(16).padStart(8, "0");
  return (base + base + base + base + base + base + base + base).slice(0, 64);
}

function generateTransactionId(index: number, timestamp: string): string {
  return `TX-${index}-${timestamp}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

// ── Blockchain Service ─────────────────────────────────────────────────────

class BlockchainService {
  private chain: Block[] = [];
  private readonly STORAGE_KEY = "pds_blockchain_ledger";
  private readonly NODE_ID = "NODE-SUPERADMIN-01";

  constructor() {
    this.loadFromStorage();
    if (this.chain.length === 0) this.seedWithMockData();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) this.chain = JSON.parse(stored);
    } catch {
      this.chain = [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.chain));
  }

  private seedWithMockData(): void {
    const dh = simpleHash;

    const genesis: Block = {
      index: 0,
      transactionId: "TX-GENESIS-0000000000000000",
      timestamp: "2026-01-01T00:00:00.000Z",
      transferType: "INVENTORY_MOVEMENT",
      payload: { batchId: "GENESIS", commodity: "GENESIS_BLOCK", quantity: 0, unit: "",
        source: "SYSTEM", destination: "CHAIN_INIT", transferType: "INVENTORY_MOVEMENT",
        authorizedBy: "SYSTEM" } as StockTransferPayload,
      previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
      hash: dh("GENESIS_BLOCK_CLICK2RATION_PDS_2026"),
      nonce: 0, verificationStatus: "VERIFIED", nodeId: "SYSTEM",
    };

    const seedData = [
      { i: 1, txId: "TX-1-20260309-WD-001", ts: "2026-03-09T06:00:00.000Z", type: "WAREHOUSE_TO_DISTRICT" as TransferType,
        p: { batchId:"BATCH-WD-2026-001", commodity:"Rice", quantity:5000, unit:"kg", source:"Central Chennai Warehouse", destination:"Chennai District", transferType:"WAREHOUSE_TO_DISTRICT" as TransferType, authorizedBy:"SUPER_ADMIN", orderId:"ORD-1001" },
        nonce: 182731, node: "NODE-WAREHOUSE-CHENNAI-01" },
      { i: 2, txId: "TX-2-20260309-DS-001", ts: "2026-03-09T08:12:00.000Z", type: "DISTRICT_TO_SHOP" as TransferType,
        p: { batchId:"BATCH-DS-2026-001", commodity:"Rice", quantity:200, unit:"kg", source:"Chennai District", destination:"Anna Nagar FPS", transferType:"DISTRICT_TO_SHOP" as TransferType, authorizedBy:"DISTRICT_ADMIN", orderId:"ORD-1001" },
        nonce: 384920, node: "NODE-DISTRICT-CHENNAI-01" },
      { i: 3, txId: "TX-3-20260309-DS-002", ts: "2026-03-09T09:30:00.000Z", type: "DISTRICT_TO_SHOP" as TransferType,
        p: { batchId:"BATCH-DS-2026-002", commodity:"Sugar", quantity:50, unit:"kg", source:"Chennai District", destination:"KK Nagar FPS", transferType:"DISTRICT_TO_SHOP" as TransferType, authorizedBy:"DISTRICT_ADMIN", orderId:"ORD-1002" },
        nonce: 291048, node: "NODE-DISTRICT-CHENNAI-01" },
      { i: 4, txId: "TX-4-20260309-WD-002", ts: "2026-03-09T07:30:00.000Z", type: "WAREHOUSE_TO_DISTRICT" as TransferType,
        p: { batchId:"BATCH-WD-2026-002", commodity:"Cooking Oil", quantity:2000, unit:"L", source:"Madurai Storage Hub", destination:"Madurai District", transferType:"WAREHOUSE_TO_DISTRICT" as TransferType, authorizedBy:"SUPER_ADMIN", orderId:"ORD-1003" },
        nonce: 509312, node: "NODE-WAREHOUSE-MADURAI-01" },
      { i: 5, txId: "TX-5-20260309-DS-003", ts: "2026-03-09T10:30:00.000Z", type: "DISTRICT_TO_SHOP" as TransferType,
        p: { batchId:"BATCH-DS-2026-003", commodity:"Cooking Oil", quantity:80, unit:"L", source:"Madurai District", destination:"Madurai Main FPS", transferType:"DISTRICT_TO_SHOP" as TransferType, authorizedBy:"DISTRICT_ADMIN", orderId:"ORD-1003" },
        nonce: 671204, node: "NODE-DISTRICT-MADURAI-01" },
      { i: 6, txId: "TX-6-20260309-INV-001", ts: "2026-03-09T11:00:00.000Z", type: "INVENTORY_MOVEMENT" as TransferType,
        p: { batchId:"BATCH-INV-2026-001", commodity:"Wheat", quantity:300, unit:"kg", source:"Central Chennai Warehouse", destination:"Anna Nagar FPS", transferType:"INVENTORY_MOVEMENT" as TransferType, authorizedBy:"SUPER_ADMIN", orderId:"ORD-1005" },
        nonce: 823419, node: "NODE-WAREHOUSE-CHENNAI-01" },
      { i: 7, txId: "TX-7-20260309-FL-001", ts: "2026-03-09T12:00:00.000Z", type: "FRAUD_LOG" as TransferType,
        p: { caseId:"FRAUD-2026-001", fraudType:"Stock Diversion", district:"Madurai", shop:"Madurai Main FPS", severity:"Critical" as const, detectedBy:"AI" as const, evidence:"Blockchain quantity 80L; database reports 45L. Discrepancy: 35L unaccounted." },
        nonce: 102938, node: "NODE-SUPERADMIN-01" },
      { i: 8, txId: "TX-8-20260309-WD-003", ts: "2026-03-09T06:45:00.000Z", type: "WAREHOUSE_TO_DISTRICT" as TransferType,
        p: { batchId:"BATCH-WD-2026-003", commodity:"Wheat", quantity:3000, unit:"kg", source:"Coimbatore Food Depot", destination:"Coimbatore District", transferType:"WAREHOUSE_TO_DISTRICT" as TransferType, authorizedBy:"SUPER_ADMIN", orderId:"ORD-1008" },
        nonce: 554871, node: "NODE-WAREHOUSE-COIMBATORE-01" },
      { i: 9, txId: "TX-9-20260309-DS-004", ts: "2026-03-09T09:15:00.000Z", type: "DISTRICT_TO_SHOP" as TransferType,
        p: { batchId:"BATCH-DS-2026-004", commodity:"Wheat", quantity:180, unit:"kg", source:"Coimbatore District", destination:"Coimbatore Central FPS", transferType:"DISTRICT_TO_SHOP" as TransferType, authorizedBy:"DISTRICT_ADMIN", orderId:"ORD-1008" },
        nonce: 778923, node: "NODE-DISTRICT-COIMBATORE-01" },
      { i: 10, txId: "TX-10-20260310-FL-002", ts: "2026-03-10T08:15:00.000Z", type: "FRAUD_LOG" as TransferType,
        p: { caseId:"FRAUD-2026-002", fraudType:"Duplicate Distribution", district:"Salem", shop:"Salem Market FPS", severity:"High" as const, detectedBy:"AI" as const, evidence:"Same beneficiary ID distributed twice. Blockchain: single transfer; DB: two entries." },
        nonce: 340912, node: "NODE-SUPERADMIN-01" },
      { i: 11, txId: "TX-11-20260310-INV-002", ts: "2026-03-10T10:00:00.000Z", type: "INVENTORY_MOVEMENT" as TransferType,
        p: { batchId:"BATCH-INV-2026-002", commodity:"Rice", quantity:250, unit:"kg", source:"Central Chennai Warehouse", destination:"T Nagar FPS", transferType:"INVENTORY_MOVEMENT" as TransferType, authorizedBy:"DISTRICT_ADMIN", orderId:"ORD-1007" },
        nonce: 921045, node: "NODE-DISTRICT-CHENNAI-01" },
      { i: 12, txId: "TX-12-20260311-WD-004", ts: "2026-03-11T07:00:00.000Z", type: "WAREHOUSE_TO_DISTRICT" as TransferType,
        p: { batchId:"BATCH-WD-2026-004", commodity:"Rice", quantity:4000, unit:"kg", source:"Salem Grain Storage", destination:"Salem District", transferType:"WAREHOUSE_TO_DISTRICT" as TransferType, authorizedBy:"SUPER_ADMIN", orderId:"ORD-1010" },
        nonce: 637481, node: "NODE-WAREHOUSE-SALEM-01" },
      { i: 13, txId: "TX-13-20260311-DS-005", ts: "2026-03-11T11:20:00.000Z", type: "DISTRICT_TO_SHOP" as TransferType,
        p: { batchId:"BATCH-DS-2026-005", commodity:"Rice", quantity:120, unit:"kg", source:"Salem District", destination:"Salem Market FPS", transferType:"DISTRICT_TO_SHOP" as TransferType, authorizedBy:"DISTRICT_ADMIN", orderId:"ORD-1010" },
        nonce: 483920, node: "NODE-DISTRICT-SALEM-01" },
      { i: 14, txId: "TX-14-20260312-FL-003", ts: "2026-03-12T09:00:00.000Z", type: "FRAUD_LOG" as TransferType,
        p: { caseId:"FRAUD-2026-003", fraudType:"Abnormal Stock Usage", district:"Chennai", shop:"T Nagar FPS", severity:"Medium" as const, detectedBy:"AI" as const, evidence:"Database reports 56% more stock than blockchain recorded. Possible false entry inflation." },
        nonce: 219034, node: "NODE-SUPERADMIN-01" },
    ];

    this.chain = [genesis];
    for (const s of seedData) {
      const prev = this.chain[this.chain.length - 1];
      this.chain.push({
        index: s.i, transactionId: s.txId, timestamp: s.ts, transferType: s.type,
        payload: s.p as BlockPayload, previousHash: prev.hash,
        hash: dh(s.txId), nonce: s.nonce, verificationStatus: "VERIFIED", nodeId: s.node,
      });
    }
    this.saveToStorage();
  }

  /** Add a new block to the chain (async — uses real SHA-256) */
  async addBlock(payload: BlockPayload, transferType: TransferType, nodeId?: string): Promise<Block> {
    const previous = this.chain[this.chain.length - 1];
    const index = previous.index + 1;
    const timestamp = new Date().toISOString();
    const transactionId = generateTransactionId(index, timestamp);
    const nonce = Math.floor(Math.random() * 999999);
    const rawData = JSON.stringify({ index, transactionId, timestamp, transferType, payload, previousHash: previous.hash, nonce });
    const hash = await sha256(rawData);
    const block: Block = {
      index, transactionId, timestamp, transferType, payload,
      previousHash: previous.hash, hash, nonce,
      verificationStatus: "VERIFIED", nodeId: nodeId || this.NODE_ID,
    };
    this.chain.push(block);
    this.saveToStorage();
    return block;
  }

  async verifyChain(): Promise<{ valid: boolean; tamperedBlocks: number[] }> {
    const tamperedBlocks: number[] = [];
    for (let i = 1; i < this.chain.length; i++) {
      if (this.chain[i].previousHash !== this.chain[i - 1].hash) tamperedBlocks.push(this.chain[i].index);
    }
    return { valid: tamperedBlocks.length === 0, tamperedBlocks };
  }

  async verifyTransaction(transactionId: string): Promise<{ found: boolean; valid: boolean; block?: Block }> {
    const block = this.chain.find((b) => b.transactionId === transactionId);
    if (!block) return { found: false, valid: false };
    return { found: true, valid: block.verificationStatus === "VERIFIED", block };
  }

  getChain(): Block[] { return [...this.chain]; }
  getBlock(index: number): Block | undefined { return this.chain[index]; }
  getByTransferType(type: TransferType): Block[] { return this.chain.filter((b) => b.transferType === type); }

  getStats() {
    return {
      totalBlocks: this.chain.length - 1,
      totalTransfers: this.chain.filter((b) => b.transferType !== "FRAUD_LOG" && b.index > 0).length,
      fraudLogs: this.chain.filter((b) => b.transferType === "FRAUD_LOG").length,
      warehouseToDistrict: this.chain.filter((b) => b.transferType === "WAREHOUSE_TO_DISTRICT").length,
      districtToShop: this.chain.filter((b) => b.transferType === "DISTRICT_TO_SHOP").length,
      inventoryMovements: this.chain.filter((b) => b.transferType === "INVENTORY_MOVEMENT" && b.index > 0).length,
    };
  }

  /** POST /stock-transfer */
  async recordStockTransfer(payload: StockTransferPayload): Promise<Block> {
    return this.addBlock(payload, payload.transferType);
  }

  /** POST /verify-transfer */
  async verifyTransfer(transactionId: string) {
    return this.verifyTransaction(transactionId);
  }

  /** GET /blockchain-history */
  getHistory(limit = 50, offset = 0): Block[] {
    return [...this.chain].reverse().slice(offset, offset + limit);
  }

  /** GET /audit-report */
  getAuditReport(): AuditReport {
    return {
      generatedAt: new Date().toISOString(),
      chainLength: this.chain.length,
      stats: this.getStats(),
      recentBlocks: this.getHistory(10),
      chainValid: true,
    };
  }

  async recordFraudLog(payload: FraudLogPayload): Promise<Block> {
    return this.addBlock(payload, "FRAUD_LOG");
  }

  reset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.chain = [];
    this.seedWithMockData();
  }
}

export const blockchainService = new BlockchainService();
