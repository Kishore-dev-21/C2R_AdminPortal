/**
 * Database Migration — Click2Ration Blockchain Audit Tables
 *
 * Run: npm run db:migrate
 *
 * Blockchain stores ONLY:
 *   stock_transfers, inventory_movements, fraud_logs, delivery_proofs
 * NEVER stores: passwords, Aadhaar, mobile numbers, personal data
 */

import { pool } from "./pool";

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ── Blockchain Blocks Table ──────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS blockchain_blocks (
        id            SERIAL PRIMARY KEY,
        block_number  INTEGER NOT NULL UNIQUE,
        transaction_id VARCHAR(80) NOT NULL UNIQUE,
        transaction_type VARCHAR(40) NOT NULL,
        -- CHECK constraint ensures only audit data types are ever committed
        CONSTRAINT valid_tx_type CHECK (transaction_type IN (
          'WAREHOUSE_TO_DISTRICT', 'DISTRICT_TO_SHOP',
          'INVENTORY_MOVEMENT', 'FRAUD_LOG', 'DELIVERY_PROOF'
        )),
        payload       JSONB NOT NULL,
        previous_hash CHAR(64) NOT NULL,
        current_hash  CHAR(64) NOT NULL,
        digital_signature VARCHAR(128),
        node_id       VARCHAR(60) NOT NULL DEFAULT 'NODE-SUPERADMIN-01',
        verification_status VARCHAR(20) NOT NULL DEFAULT 'VERIFIED',
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ── Tamper Alerts Table ──────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS tamper_alerts (
        id              SERIAL PRIMARY KEY,
        block_number    INTEGER NOT NULL REFERENCES blockchain_blocks(block_number),
        expected_hash   CHAR(64) NOT NULL,
        found_hash      CHAR(64) NOT NULL,
        detected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        acknowledged    BOOLEAN NOT NULL DEFAULT FALSE,
        acknowledged_by VARCHAR(40)
      );
    `);

    // ── Chain Audit Log Table ────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS chain_verifications (
        id              SERIAL PRIMARY KEY,
        chain_length    INTEGER NOT NULL,
        valid           BOOLEAN NOT NULL,
        tampered_blocks JSONB,
        verified_by     VARCHAR(40),
        verified_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ── Indexes ──────────────────────────────────────────────────────────
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_blocks_tx_type ON blockchain_blocks(transaction_type);
      CREATE INDEX IF NOT EXISTS idx_blocks_created  ON blockchain_blocks(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_blocks_tx_id    ON blockchain_blocks(transaction_id);
    `);

    await client.query("COMMIT");
    console.log("[Click2Ration] Migration completed successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Click2Ration] Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
