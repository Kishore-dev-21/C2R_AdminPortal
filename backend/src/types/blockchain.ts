/**
 * Shared blockchain types for the Click2Ration PDS audit system.
 *
 * STORES ONLY: stock transfers, inventory movements, fraud logs, delivery proofs
 * NEVER STORES: passwords, Aadhaar numbers, mobile numbers, personal information
 */

export type TransactionType =
  | "WAREHOUSE_TO_DISTRICT"
  | "DISTRICT_TO_SHOP"
  | "INVENTORY_MOVEMENT"
  | "FRAUD_LOG"
  | "DELIVERY_PROOF";

export type VerificationStatus = "VERIFIED" | "TAMPERED" | "PENDING";

export type FraudSeverity = "Critical" | "High" | "Medium" | "Low";

// ── Payloads — only audit-relevant fields, never PII ──────────────────────

export interface StockTransferPayload {
  batchId: string;
  commodity: string;
  quantity: number;
  unit: string;
  source: string;
  destination: string;
  authorizedBy: string; // role only (SUPER_ADMIN, DISTRICT_ADMIN) — no usernames
  orderId?: string;
}

export interface InventoryMovePayload {
  batchId: string;
  commodity: string;
  quantity: number;
  unit: string;
  source: string;
  destination: string;
  reason: string;
  authorizedBy: string;
}

export interface FraudLogPayload {
  caseId: string;
  fraudType: string;
  district: string;
  shop: string;
  severity: FraudSeverity;
  detectedBy: "AI" | "MANUAL";
  evidence: string;
  riskScore: number; // 0-100
}

export interface DeliveryProofPayload {
  deliveryId: string;
  batchId: string;
  commodity: string;
  quantity: number;
  unit: string;
  shop: string;
  district: string;
  deliveredAt: string;
  verifiedBy: string; // role only
}

export type BlockPayload =
  | StockTransferPayload
  | InventoryMovePayload
  | FraudLogPayload
  | DeliveryProofPayload;

// ── Block ──────────────────────────────────────────────────────────────────

export interface Block {
  id: number;              // DB primary key
  blockNumber: number;     // Sequential block index (0 = genesis)
  transactionId: string;  // Unique TX identifier
  transactionType: TransactionType;
  timestamp: string;      // ISO-8601
  previousHash: string;
  currentHash: string;    // SHA-256 of canonical block data
  payload: BlockPayload;
  digitalSignature: string; // HMAC-SHA256 of payload using NODE_ID as key
  nodeId: string;           // Which node committed this block
  verificationStatus: VerificationStatus;
}

// ── API Responses ──────────────────────────────────────────────────────────

export interface ChainStats {
  totalBlocks: number;
  totalTransfers: number;
  fraudLogs: number;
  deliveryProofs: number;
  warehouseToDistrict: number;
  districtToShop: number;
  inventoryMovements: number;
}

export interface VerifyChainResult {
  valid: boolean;
  checkedBlocks: number;
  tamperedBlocks: TamperedBlock[];
  verifiedAt: string;
}

export interface TamperedBlock {
  blockNumber: number;
  transactionId: string;
  reason: string;
}

export interface AuditReport {
  generatedAt: string;
  nodeId: string;
  chainLength: number;
  chainValid: boolean;
  stats: ChainStats;
  recentBlocks: Block[];
  tamperedBlocks: TamperedBlock[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
