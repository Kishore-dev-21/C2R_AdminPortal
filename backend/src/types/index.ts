/**
 * Shared types — backend blockchain domain model
 * NEVER include PII fields here (no Aadhaar, mobile, password)
 */

export type TransactionType =
  | "WAREHOUSE_TO_DISTRICT"
  | "DISTRICT_TO_SHOP"
  | "INVENTORY_MOVEMENT"
  | "FRAUD_LOG"
  | "DELIVERY_PROOF";

export type VerificationStatus = "VERIFIED" | "TAMPERED" | "PENDING";
export type FraudSeverity = "Critical" | "High" | "Medium" | "Low";

export interface StockTransferPayload {
  batchId: string;
  commodity: string;
  quantity: number;
  unit: string;
  source: string;
  destination: string;
  transferType: TransactionType;
  authorizedBy: string; // role string only — no user names or IDs
  orderId?: string;
}

export interface FraudLogPayload {
  caseId: string;
  fraudType: string;
  district: string;
  shop: string;
  severity: FraudSeverity;
  detectedBy: "AI" | "MANUAL";
  evidence: string;
}

export type BlockPayload = StockTransferPayload | FraudLogPayload;

/** Canonical block shape returned by all GET endpoints */
export interface BlockRecord {
  blockNumber: number;
  transactionId: string;
  transactionType: TransactionType;
  payload: BlockPayload;
  previousHash: string;
  currentHash: string;
  digitalSignature: string;
  nodeId: string;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

/** AI fraud risk score computed server-side from evidence + type */
export interface FraudRiskScore {
  caseId: string;
  score: number;        // 0–100
  level: FraudSeverity;
  factors: string[];
}

export interface ChainStats {
  totalBlocks: number;
  totalTransfers: number;
  fraudLogs: number;
  warehouseToDistrict: number;
  districtToShop: number;
  inventoryMovements: number;
  deliveryProofs: number;
}

export interface VerifyChainResult {
  valid: boolean;
  checkedBlocks: number;
  tamperedBlocks: Array<{ blockNumber: number; expectedHash: string; foundHash: string }>;
  verifiedAt: string;
}

export interface AuditReport {
  generatedAt: string;
  chainLength: number;
  stats: ChainStats;
  recentBlocks: BlockRecord[];
  chainValid: boolean;
  tamperedBlocks: number[];
}
