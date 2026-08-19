/**
 * Database Seed — Pre-populates blockchain with realistic PDS transfer history
 * Run: npm run db:seed
 */

import { pool } from "./pool";
import { BlockchainLedgerService } from "../services/blockchainLedgerService";

async function seed() {
  const service = new BlockchainLedgerService();

  console.log("Checking if chain already seeded...");
  const count = await service.getChainLength();
  if (count > 1) {
    console.log(`Chain already has ${count} blocks. Skipping seed.`);
    await pool.end();
    return;
  }

  console.log("Seeding genesis block...");
  await service.initGenesis();

  const records = [
    { type: "WAREHOUSE_TO_DISTRICT" as const, batchId: "BATCH-WD-2026-001", commodity: "Rice", quantity: 5000, unit: "kg", source: "Central Chennai Warehouse", destination: "Chennai District", authorizedBy: "SUPER_ADMIN", orderId: "ORD-1001" },
    { type: "DISTRICT_TO_SHOP"     as const, batchId: "BATCH-DS-2026-001", commodity: "Rice", quantity: 200, unit: "kg", source: "Chennai District", destination: "Anna Nagar FPS", authorizedBy: "DISTRICT_ADMIN", orderId: "ORD-1001" },
    { type: "DISTRICT_TO_SHOP"     as const, batchId: "BATCH-DS-2026-002", commodity: "Sugar", quantity: 50, unit: "kg", source: "Chennai District", destination: "KK Nagar FPS", authorizedBy: "DISTRICT_ADMIN", orderId: "ORD-1002" },
    { type: "WAREHOUSE_TO_DISTRICT" as const, batchId: "BATCH-WD-2026-002", commodity: "Cooking Oil", quantity: 2000, unit: "L", source: "Madurai Storage Hub", destination: "Madurai District", authorizedBy: "SUPER_ADMIN", orderId: "ORD-1003" },
    { type: "DISTRICT_TO_SHOP"     as const, batchId: "BATCH-DS-2026-003", commodity: "Cooking Oil", quantity: 80, unit: "L", source: "Madurai District", destination: "Madurai Main FPS", authorizedBy: "DISTRICT_ADMIN", orderId: "ORD-1003" },
    { type: "INVENTORY_MOVEMENT"   as const, batchId: "BATCH-INV-2026-001", commodity: "Wheat", quantity: 300, unit: "kg", source: "Central Chennai Warehouse", destination: "Anna Nagar FPS", authorizedBy: "SUPER_ADMIN", orderId: "ORD-1005" },
    { type: "WAREHOUSE_TO_DISTRICT" as const, batchId: "BATCH-WD-2026-003", commodity: "Wheat", quantity: 3000, unit: "kg", source: "Coimbatore Food Depot", destination: "Coimbatore District", authorizedBy: "SUPER_ADMIN", orderId: "ORD-1008" },
    { type: "DISTRICT_TO_SHOP"     as const, batchId: "BATCH-DS-2026-004", commodity: "Wheat", quantity: 180, unit: "kg", source: "Coimbatore District", destination: "Coimbatore Central FPS", authorizedBy: "DISTRICT_ADMIN", orderId: "ORD-1008" },
    { type: "INVENTORY_MOVEMENT"   as const, batchId: "BATCH-INV-2026-002", commodity: "Rice", quantity: 250, unit: "kg", source: "Central Chennai Warehouse", destination: "T Nagar FPS", authorizedBy: "DISTRICT_ADMIN", orderId: "ORD-1007" },
    { type: "WAREHOUSE_TO_DISTRICT" as const, batchId: "BATCH-WD-2026-004", commodity: "Rice", quantity: 4000, unit: "kg", source: "Salem Grain Storage", destination: "Salem District", authorizedBy: "SUPER_ADMIN", orderId: "ORD-1010" },
    { type: "DISTRICT_TO_SHOP"     as const, batchId: "BATCH-DS-2026-005", commodity: "Rice", quantity: 120, unit: "kg", source: "Salem District", destination: "Salem Market FPS", authorizedBy: "DISTRICT_ADMIN", orderId: "ORD-1010" },
    { type: "DELIVERY_PROOF"       as const, batchId: "BATCH-DP-2026-001", commodity: "Rice", quantity: 200, unit: "kg", source: "Anna Nagar FPS", destination: "Beneficiaries", authorizedBy: "SHOP_ADMIN", orderId: "ORD-1001" },
  ];

  for (const r of records) {
    await service.addStockTransfer({ ...r, transferType: r.type });
    process.stdout.write(".");
  }

  // Fraud logs
  await service.addFraudLog({ caseId: "FRAUD-2026-001", fraudType: "Stock Diversion", district: "Madurai", shop: "Madurai Main FPS", severity: "Critical", detectedBy: "AI", evidence: "Blockchain: 80L dispatched. DB: 45L received. 35L unaccounted." });
  await service.addFraudLog({ caseId: "FRAUD-2026-002", fraudType: "Duplicate Distribution", district: "Salem", shop: "Salem Market FPS", severity: "High", detectedBy: "AI", evidence: "Same beneficiary distributed twice. Blockchain: single transfer. DB: two entries." });
  await service.addFraudLog({ caseId: "FRAUD-2026-003", fraudType: "Abnormal Stock Usage", district: "Chennai", shop: "T Nagar FPS", severity: "Medium", detectedBy: "AI", evidence: "DB reports 56% more stock than blockchain recorded." });
  process.stdout.write(".\n");

  console.log("\n[Click2Ration] Seed completed.");
  await pool.end();
}

seed().catch(err => {
  console.error("[Click2Ration] Seed failed:", err);
  process.exit(1);
});
