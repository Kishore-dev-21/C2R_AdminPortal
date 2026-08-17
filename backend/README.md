# Click2Ration — Blockchain Audit Backend

Node.js + Express permissioned blockchain audit service for the PDS system.

## Architecture

```
PostgreSQL (persistent ledger)
    ↕
BlockchainLedgerService (SHA-256 hash chain, tamper detection)
    ↕
REST API (Express)
    ↕
React Frontend (blockchainApiService — live or mock fallback)
```

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 2. Install
```bash
cd backend
npm install
```

### 3. Configure
```bash
cp .env.example .env
# Edit .env — set DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, SIGNING_SECRET
```

### 4. Create database
```sql
CREATE DATABASE click2ration;
```

### 5. Run migrations
```bash
npm run db:migrate
```

### 6. Seed demo data
```bash
npm run db:seed
```

### 7. Start the server
```bash
npm run dev       # development (auto-reload)
npm run build && npm start   # production
```

Server runs at: `http://localhost:4000`

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /blockchain/stock-transfer | Record a stock transfer block |
| POST | /blockchain/inventory-move | Record an inventory adjustment |
| POST | /blockchain/fraud-log | Record a fraud investigation log |
| POST | /blockchain/delivery-proof | Record delivery verification |
| GET | /blockchain/history | Paginated block history |
| GET | /blockchain/verify-chain | Full chain integrity check |
| GET | /blockchain/audit-report | Complete audit report (JSON) |
| GET | /blockchain/stats | Chain statistics |
| GET | /blockchain/fraud-scores | AI-computed fraud risk scores |
| GET | /blockchain/verify/:txId | Verify a single transaction |
| GET | /blockchain/block/:n | Get block by number |
| GET | /health | Health check |

## Blockchain Data Scope
- Stock transfer records
- Warehouse to District movements
- District to Shop movements
- Inventory adjustments
- Fraud investigation logs
- Delivery verification records

Excluded from Blockchain (Privacy & Security):
- Passwords and authentication secrets
- Aadhaar identification numbers
- Mobile numbers and beneficiary personal data
- Product media assets
- Notification queues

## Database Schema

```sql
blockchain_blocks   -- immutable block records
tamper_alerts       -- automatic tampering notifications  
chain_verifications -- audit log of integrity checks
```

## Government Deployment Notes

- Uses PostgreSQL (free, open source) — no blockchain network fees
- Each government node (warehouse/district/shop) can run its own instance
- Hash chain links guarantee tamper detection without consensus overhead
- HMAC-SHA256 digital signatures per block using a shared secret
- Constraint at DB level prevents storing disallowed transaction types
