/**
 * TypeScript types mirroring the backend blockchain types.
 * Kept separate so backend/frontend can evolve independently.
 */

export type TransactionType =
  | "WAREHOUSE_TO_DISTRICT"
  | "DISTRICT_TO_SHOP"
  | "INVENTORY_MOVEMENT"
  | "FRAUD_LOG"
  | "DELIVERY_PROOF";

export type VerificationStatus = "VERIFIED" | "TAMPERED" | "PENDING";

export interface Block {
  id: number;
  blockNumber: number;
  transactionId: string;
  transactionType: TransactionType;
  timestamp: string;
  previousHash: string;
  currentHash: string;
  payload: Record<string, unknown>;
  digitalSignature: string;
  nodeId: string;
  verificationStatus: VerificationStatus;
}

export interface ChainStats {
  totalBlocks: number;
  totalTransfers: number;
  fraudLogs: number;
  deliveryProofs: number;
  warehouseToDistrict: number;
  districtToShop: number;
  inventoryMovements: number;
}

export interface TamperedBlock {
  blockNumber: number;
  transactionId: string;
  reason: string;
}

export interface VerifyChainResult {
  valid: boolean;
  checkedBlocks: number;
  tamperedBlocks: TamperedBlock[];
  verifiedAt: string;
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
