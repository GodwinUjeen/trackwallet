# TrackWallet

Multi-user personal finance app (Angular + Node.js + MongoDB) inspired by wallet trackers with Home, Categories, Analytics, and Transactions.

## Prerequisites

- Node.js **20.19+** or **22+** (Angular 21; use `nvm use 22`)
- MongoDB running locally (`mongodb://127.0.0.1:27017`)

## Backend

```bash
cd track-wallet-be
cp .env.example .env   # if needed
npm install
npm run dev
```

API: `http://localhost:3000`

## Frontend

```bash
cd track-wallet-fe
npm install
npm start
```

App: `http://localhost:4200`

## Usage

1. Register an account (default accounts + categories are seeded).
2. On **Home**, use the upload icon to import [`sample-data.csv`](sample-data.csv) (December 2025 export).
3. Browse **Transactions**, **Categories**, and **Analytics**; manage categories via the pencil on Categories.

## API overview

| Area | Endpoints |
|------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Accounts | `CRUD /api/accounts` |
| Categories | `CRUD /api/categories`, `GET /api/categories/tree` |
| Transactions | `CRUD /api/transactions` |
| Analytics | `/api/analytics/summary`, `by-category`, `timeseries`, `averages`, `compare`, `balance-series` |
| Import | `POST /api/import/csv` (multipart `file`) |

All wallet routes require `Authorization: Bearer <token>`.
# trackwallet
# trackwallet
