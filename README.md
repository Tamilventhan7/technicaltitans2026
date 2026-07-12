# TransitOps+ Intelligent Fleet Management Platform

TransitOps+ is a modern enterprise-grade SaaS dashboard built to streamline fleet logistics operations with AI-powered automations, carbon footprint analytics, predictive maintenance forecasting, real-time telemetry simulations, and multi-language support.

---

## 🚀 Key Modules & Capabilities

1. **Intelligent Command Center** — Dynamic map tracing, active trip tickers, real-time alert feed, and instant operational health checks.
2. **AI Dashboard** — Fleet health index, fuel optimization matrices, carbon emissions heatmaps, and revenue-expense projections.
3. **Smart Dispatching** — Auto-generated best-matching driver/vehicle pairings based on cargo weight, licenses, and distance telemetry.
4. **Interactive AI Copilot** — Omnipresent floating chat drawer supporting NLP natural text commands, list/metric cards rendering, voice speech-to-text inputs, and quick-action confirmations.
5. **Auditing & Compliance** — Automatic tracking of user logins, dispatches, mechanical schedules, settings updates, and expense ledger modifications.
6. **Mobile Driver App & POD** — Simplified mobile operator view to sign proof of delivery (POD), upload cargo verification photos, and record trip odometer telemetry.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts, Leaflet Maps, Framer Motion
- **Backend:** Node.js, Express.js, TypeScript, Socket.IO, Mongoose ODM
- **Database:** MongoDB (with an automatic Local JSON Fallback system in `server/data/db.json` when MongoDB is offline)
- **Containerization:** Docker & Docker Compose

---

## 📂 Project Structure

```text
TransitOps/
├── client/                 # React Single Page App
│   ├── public/             # Static PWA assets & manifest.json
│   ├── src/
│   │   ├── components/     # UI components (layouts, panels, charts)
│   │   ├── context/        # App context, sidebar settings, sockets
│   │   └── pages/          # Login, Landing, and Admin workspaces
│   └── index.html          # Entry document
│
├── server/                 # Express REST & WebSocket API
│   ├── src/
│   │   ├── ai/             # NLP engine, recommendations, Gemini triggers
│   │   ├── db/             # Mongoose connection & local JSON DB fallback
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routers (auth, trips, fleet, system)
│   │   └── index.ts        # Server bootstrap
│
├── Dockerfile.client       # Client Docker deployment
├── Dockerfile.server       # Backend server Docker build
├── docker-compose.yml      # Orchestrated setup
└── package.json            # Monorepo setup scripts
```

---

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v9+)
- MongoDB (optional, fallback offline JSON database will be used automatically if not connected)

### Installation

Install dependencies across the monorepo:

```bash
npm run install:all
```

### Running Locally (Development)

To spin up both Vite client and Express API concurrently:

```bash
npm run dev
```

- **Frontend URL:** [http://localhost:5173](http://localhost:5173)
- **Backend URL:** [http://localhost:3001](http://localhost:3001)

### Building for Production

Compile both environments:

```bash
npm run build
```

---

## 🐳 Docker Deployment

To build and run all services (MongoDB, Server, and Frontend) in coordinated Docker containers:

```bash
docker-compose up --build
```

- The React client will be accessible at [http://localhost](http://localhost) (port 80).
- The Express API will bind to [http://localhost:3001](http://localhost:3001).
- MongoDB stores files persistently in the `mongo-data` volume.

---

## 🔐 Compliance & Security Logging

Every key state mutation is logged to the system's Audit Ledger. This includes:
- Operator Logins & Roster adjustments
- Fleet Dispatches & Route scheduling
- Fuel theft alarms & carbon parameter updates
- Expense declarations & approval signatures

Logs can be queried via `GET /system/audit-logs` or audited directly in the **System Audit Logs** panel under the Admin role.
