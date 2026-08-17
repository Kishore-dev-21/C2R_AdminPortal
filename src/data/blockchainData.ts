/**
 * Blockchain Mock Ledger Data
 * Pre-seeded immutable audit trail entries for the PDS system.
 * These simulate records that have been committed to the permissioned chain.
 */

import type { Block, TransferType, VerificationStatus } from "@/services/blockchainService";

// Helper to make a deterministic display hash from a seed string
function displayHash(seed: string): string {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = (h * 33) ^ seed.charCodeAt(i);
  const base = (Math.abs(h) >>> 0).toString(16).padStart(8, "0");
  return (base + base + base + base + base + base + base + base).slice(0, 64);
}

export const mockBlockchainLedger: Block[] = [
  {
    index: 0,
    transactionId: "TX-GENESIS-0000000000000000",
    timestamp: "2026-01-01T00:00:00.000Z",
    transferType: "INVENTORY_MOVEMENT",
    payload: {
      batchId: "GENESIS",
      commodity: "GENESIS_BLOCK",
      quantity: 0,
      unit: "",
      source: "SYSTEM",
      destination: "CHAIN_INIT",
      transferType: "INVENTORY_MOVEMENT",
      authorizedBy: "SYSTEM",
    },
    previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
    hash: displayHash("GENESIS_BLOCK_CLICK2RATION_PDS_2026"),
    nonce: 0,
    verificationStatus: "VERIFIED",
    nodeId: "SYSTEM",
  },
  {
    index: 1,
    transactionId: "TX-1-20260309-WD-001",
    timestamp: "2026-03-09T06:00:00.000Z",
    transferType: "WAREHOUSE_TO_DISTRICT",
    payload: {
      batchId: "BATCH-WD-2026-001",
      commodity: "Rice",
      quantity: 5000,
      unit: "kg",
      source: "Central Chennai Warehouse",
      destination: "Chennai District",
      transferType: "WAREHOUSE_TO_DISTRICT",
      authorizedBy: "SUPER_ADMIN",
      orderId: "ORD-1001",
    },
    previousHash: displayHash("GENESIS_BLOCK_CLICK2RATION_PDS_2026"),
    hash: displayHash("TX-1-20260309-WD-001"),
    nonce: 182731,
    verificationStatus: "VERIFIED",
    nodeId: "NODE-WAREHOUSE-CHENNAI-01",
  },
  {
    index: 2,
    transactionId: "TX-2-20260309-DS-001",
    timestamp: "2026-03-09T08:12:00.000Z",
    transferType: "DISTRICT_TO_SHOP",
    payload: {
      batchId: "BATCH-DS-2026-001",
      commodity: "Rice",
      quantity: 200,
      unit: "kg",
      source: "Chennai District",
      destination: "Anna Nagar FPS",
      transferType: "DISTRICT_TO_SHOP",
      authorizedBy: "DISTRICT_ADMIN",
      orderId: "ORD-1001",
    },
    previousHash: displayHash("TX-1-20260309-WD-001"),
    hash: displayHash("TX-2-20260309-DS-001"),
    nonce: 384920,
    verificationStatus: "VERIFIED",
    nodeId: "NODE-DISTRICT-CHENNAI-01",
  },
  {
    index: 3,
    transactionId: "TX-3-20260309-DS-002",
    timestamp: "2026-03-09T09:30:00.000Z",
    transferType: "DISTRICT_TO_SHOP",
    payload: {
      batchId: "BATCH-DS-2026-002",
      commodity: "Sugar",
      quantity: 50,
      unit: "kg",
      source: "Chennai District",
      destination: "KK Nagar FPS",
      transferType: "DISTRICT_TO_SHOP",
      authorizedBy: "DISTRICT_ADMIN",
      orderId: "ORD-1002",
    },
    previousHash: displayHash("TX-2-20260309-DS-001"),
    hash: displayHash("TX-3-20260309-DS-002"),
    nonce: 291048,
    verificationStatus: "VERIFIED",
    nodeId: "NODE-DISTRICT-CHENNAI-01",
  },
  {
    index: 4,
    transactionId: "TX-4-20260309-WD-002",
    timestamp: "2026-03-09T07:30:00.000Z",
    transferType: "WAREHOUSE_TO_DISTRICT",
    payload: {
      batchId: "BATCH-WD-2026-002",
      commodity: "Cooking Oil",
      quantity: 2000,
      unit: "L",
      source: "Madurai Storage Hub",
      destination: "Madurai District",
      transferType: "WAREHOUSE_TO_DISTRICT",
      authorizedBy: "SUPER_ADMIN",
      orderId: "ORD-1003",
    },
    previousHash: displayHash("TX-3-20260309-DS-002"),
    hash: displayHash("TX-4-20260309-WD-002"),
    nonce: 509312,
    verificationStatus: "VERIFIED",
    nodeId: "NODE-WAREHOUSE-MADURAI-01",
  },
  {
    index: 5,
    transactionId: "TX-5-20260309-DS-003",
    timestamp: "2026-03-09T10:30:00.000Z",
    transferType: "DISTRICT_TO_SHOP",
    payload: {
      batchId: "BATCH-DS-2026-003",
      commodity: "Cooking Oil",
      quantity: 80,
      unit: "L",
      source: "Madurai District",
      destination: "Madurai Main FPS",
      transferType: "DISTRICT_TO_SHOP",
      authorizedBy: "DISTRICT_ADMIN",
      orderId: "ORD-1003",
    },
    previousHash: displayHash("TX-4-20260309-WD-002"),
    hash: displayHash("TX-5-20260309-DS-003"),
    nonce: 671204,
    verificationStatus: "VERIFIED",
    nodeId: "NODE-DISTRICT-MADURAI-01",
  },
  {
    index: 6,
    transactionId: "TX-6-20260309-INV-001",
    timestamp: "2026-03-09T11:00:00.000Z",
    transferType: "INVENTORY_MOVEMENT",
    payload: {
      batchId: "BATCH-INV-2026-001",
      commodity: "Wheat",
      quantity: 300,
      unit: "kg",
      source: "Central Chennai Warehouse",
      destination: "Anna Nagar FPS",
      transferType: "INVENTORY_MOVEMENT",
      authorizedBy: "SUPER_ADMIN",
      orderId: "ORD-1005",
    },
    previousHash: displayHash("TX-5-20260309-DS-003"),
    hash: displayHash("TX-6-20260309-INV-001"),
    nonce: 823419,
    verificationStatus: "VERIFIED",
    nodeId: "NODE-WAREHOUSE-CHENNAI-01",
  },
  {
    index: 7,
    transactionId: "TX-7-20260309-FL-001",
    timestamp: "2026-03-09T12:00:00.000Z",
    transferType: "FRAUD_LOG",
    payload: {
      caseId: "FRAUD-2026-001",
      fraudType: "Stock Diversion",
      district: "Madurai",
      shop: "Madurai Main FPS",
      severity: "Critical",
      detectedBy: "AI",
      evidence: "Blockchain quantity 80L; database reports 45L. Discrepancy: 35L unaccounted.",
    },
    previousHash: displayHash("TX-6-20260309-INV-001"),
    hash: displayHash("TX-7-20260309-FL-001"),
    nonce: 102938,
    verificationStatus: "VERIFIED",
    nodeId: "NODE-SUPERADMIN-01",
  },
  {
    index: 8,
    transactionId: "TX-8-20260309-WD-003",
    timestamp: "2026-03-09T06:45:00.000Z",
    transferType: "WAREHOUSE_TO_DISTRICT",
    payload: {
      batchId: "BATCH-WD-2026-003",
      commodity: "Wheat",
      quantity: 3000,
      unit: "kg",
      source: "Coimbatore Food Depot",
      destination: "Coimbatore District",
      transferType: "WAREHOUSE_TO_DISTRICT",
      authorizedBy: "SUPER_ADMIN",
      orderId: "ORD-1008",
    },
    previousHash: displayHash("TX-7-20260309-FL-001"),
    hash: displayHash("TX-8-20260309-WD-003"),
    nonce: 554871,
    verificationStatus: "VERIFIED",
    nodeId: "NODE-WAREHOUSE-COIMBATORE-01",
  },
  {
    index: 9,
    transactionId: "TX-9-20260309-DS-004",
    timestamp: "2026-03-09T09:15:00.000Z",
    transferType: "DISTRICT_TO_SHOP",
    payload: {
      batchId: "BATCH-DS-2026-004",
      commodity: "Wheat",
      quantity: 180,
      unit: "kg",
      source: "Coimbatore District",
      destination: "Coimbatore Central FPS",
      transferType: "DISTRICT_TO_SHOP",
      authorizedBy: "DISTRICT_ADMIN",
      orderId: "ORD-1008",
    },
    previousHash: displayHash("TX-8-20260309-WD-003"),
    hash: displayHash("TX-9-20260309-DS-004"),
    nonce: 778923,
    verificationStatus: "VERIFIED",
    nodeId: "NODE-DISTRICT-COIMBATORE-01",
  },
  {
    index: 10,
    transactionId: "TX-10-20260310-FL-002",
    timestamp: "2026-03-10T08:15:00.000Z",
    transferType: "FRAUD_LOG",
    payload: {
      caseId: "FRAUD-2026-002",
      fraudType: "Duplicate Distribution",
      district: "Salem",
      shop: "Salem Market FPS",
      severity: "High",
      detectedBy: "AI",
      evidence: "Same beneficiary ID distributed twice. Blockchain shows single transfer; DB shows two entries.",
    },
    previousHash: displayHash("TX-9-20260309-DS-004"),
    hash: displayHash("TX-10-20260310-FL-002"),
    nonce: 340912,
    verificationStatus: "VERIFIED",
    nodeId: "NODE-SUPERADMIN-01",
  },
  {
    index: 11,
    transactionId: "TX-11-20260310-INV-002",
    timestamp: "2026-03-10T10:00:00.000Z",
    transferType: "INVENTORY_MOVEMENT",
    payload: {
      batchId: "BATCH-INV-2026-002",
      commodity: "Rice",
      quantity: 250,
      unit: "kg",
      source: "Central Chennai Warehouse",
      destination: "T Nagar FPS",
      transferType: "INVENTORY_MOVEMENT",
      authorizedBy: "DISTRICT_ADMIN",
      orderId: "ORD-1007",
    },
    previousHash: displayHash("TX-10-20260310-FL-002"),
    hash: displayHash("TX-11-20260310-INV-002"),
    nonce: 921045,
    verificationStatus: "VERIFIED",
    nodeId: "NODE-DISTRICT-CHENNAI-01",
  },
];

// ── Fraud comparison data (DB record vs Blockchain record) ─────────────────

export interface FraudComparisonRecord {
  caseId: string;
  fraudType: string;
  district: string;
  shop: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  detectedBy: "AI" | "MANUAL";
  blockchainRecord: {
    transactionId: string;
    batchId: string;
    commodity: string;
    quantity: number;
    unit: string;
    timestamp: string;
    hash: string;
  };
  databaseRecord: {
    orderId: string;
    commodity: string;
    reportedQuantity: number;
    unit: string;
    recordedAt: string;
  };
  discrepancy: string;
  status: "Flagged" | "Under Investigation" | "Resolved" | "Escalated";
}

export const fraudComparisonData: FraudComparisonRecord[] = [
  {
    caseId: "FRAUD-2026-001",
    fraudType: "Stock Diversion",
    district: "Madurai",
    shop: "Madurai Main FPS",
    severity: "Critical",
    detectedBy: "AI",
    blockchainRecord: {
      transactionId: "TX-5-20260309-DS-003",
      batchId: "BATCH-DS-2026-003",
      commodity: "Cooking Oil",
      quantity: 80,
      unit: "L",
      timestamp: "2026-03-09T10:30:00.000Z",
      hash: displayHash("TX-5-20260309-DS-003"),
    },
    databaseRecord: {
      orderId: "ORD-1003",
      commodity: "Cooking Oil",
      reportedQuantity: 45,
      unit: "L",
      recordedAt: "2026-03-09T10:45:00.000Z",
    },
    discrepancy: "Blockchain: 80L dispatched. Database: 45L received. 35L unaccounted — possible diversion.",
    status: "Under Investigation",
  },
  {
    caseId: "FRAUD-2026-002",
    fraudType: "Duplicate Distribution",
    district: "Salem",
    shop: "Salem Market FPS",
    severity: "High",
    detectedBy: "AI",
    blockchainRecord: {
      transactionId: "TX-10-20260310-FL-002",
      batchId: "BATCH-DS-2026-007",
      commodity: "Rice",
      quantity: 25,
      unit: "kg",
      timestamp: "2026-03-10T08:00:00.000Z",
      hash: displayHash("TX-10-20260310-FL-002"),
    },
    databaseRecord: {
      orderId: "ORD-1012",
      commodity: "Rice",
      reportedQuantity: 50,
      unit: "kg",
      recordedAt: "2026-03-10T08:20:00.000Z",
    },
    discrepancy: "Blockchain: single transfer of 25kg. Database: two entries totaling 50kg for same beneficiary ID.",
    status: "Flagged",
  },
  {
    caseId: "FRAUD-2026-003",
    fraudType: "Abnormal Stock Usage",
    district: "Chennai",
    shop: "T Nagar FPS",
    severity: "Medium",
    detectedBy: "AI",
    blockchainRecord: {
      transactionId: "TX-11-20260310-INV-002",
      batchId: "BATCH-INV-2026-002",
      commodity: "Rice",
      quantity: 250,
      unit: "kg",
      timestamp: "2026-03-10T10:00:00.000Z",
      hash: displayHash("TX-11-20260310-INV-002"),
    },
    databaseRecord: {
      orderId: "ORD-1007",
      commodity: "Rice",
      reportedQuantity: 390,
      unit: "kg",
      recordedAt: "2026-03-10T10:15:00.000Z",
    },
    discrepancy: "Database reports 56% more stock than blockchain recorded. Possible false entry inflation.",
    status: "Under Investigation",
  },
  {
    caseId: "FRAUD-2026-004",
    fraudType: "Stock Mismatch",
    district: "Chennai",
    shop: "Anna Nagar FPS",
    severity: "Low",
    detectedBy: "MANUAL",
    blockchainRecord: {
      transactionId: "TX-2-20260309-DS-001",
      batchId: "BATCH-DS-2026-001",
      commodity: "Rice",
      quantity: 200,
      unit: "kg",
      timestamp: "2026-03-09T08:12:00.000Z",
      hash: displayHash("TX-2-20260309-DS-001"),
    },
    databaseRecord: {
      orderId: "ORD-1001",
      commodity: "Rice",
      reportedQuantity: 195,
      unit: "kg",
      recordedAt: "2026-03-09T08:30:00.000Z",
    },
    discrepancy: "Minor 5kg shortfall. Likely transit loss. Blockchain record authoritative.",
    status: "Resolved",
  },
];
