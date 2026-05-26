# DeskFlow - Real-Time SLA Helpdesk Kanban Board

DeskFlow is a premium, real-time helpdesk ticketing system built using the MERN stack (MongoDB, Express, React, Node.js). It features automated Service Level Agreement (SLA) timers, strict state transition validation, and instant multi-client board synchronization via WebSockets (Socket.io).

## Key Features

1. **Real-time Live Sync**: WebSockets sync ticket creations, edits, deletions, and status movements across all open clients instantly without page reloads.
2. **Dynamic SLA Engine**: Automatically computes SLA countdown timers based on ticket priorities. Breached SLAs are visually flagged with active borders and warnings.
3. **Workflow State Control**: Programmatically enforces ticket progression logic. Invalid transitions (e.g. going straight from Open to Resolved/Closed) are rejected by the backend API and toasted on the frontend.
4. **Interactive Filters**: Dynamic client-side searching by keyword and server-side filtering by Priority or SLA Breach Status.
5. **Glassmorphism UI**: High-fidelity dashboard styled using custom Vanilla CSS variables, responsive grids, sleek gradients, hover animations, and glow-effects.

---

## Folder Structure

```bash
bajaj_api/
├── backend/            # Express, Node, Socket.io and Mongoose API code
│   ├── config/         # Database connection module
│   ├── models/         # MongoDB schemas
│   ├── routes/         # Router with transition validators and event emitters
│   ├── .env.example    # Configuration skeleton
│   ├── package.json    
│   └── server.js       # Main server entrypoint
├── frontend/           # Vite, React, Socket.io-client dashboard
│   ├── src/
│   │   ├── components/ # Modular board UI pieces
│   │   ├── App.jsx     # Parent state container
│   │   ├── index.css   # Glassmorphism styling rules
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── README.md
└── .gitignore          # Repository exclusions (ignores node_modules & secrets)
```

---

## State Transition Rules

To maintain high support standards, status updates must strictly follow the workflow progression:

| Current Status | Allowed Target Statuses | Reason/Constraint |
| :--- | :--- | :--- |
| **Open** | `In Progress` | Work must begin before review or closure. |
| **In Progress** | `Open`, `Under Review` | Can revert to queue or request verification. |
| **Under Review** | `In Progress`, `Closed` | Can be rejected (needs more work) or resolved. |
| **Closed** | `Open` | Reopening a ticket resets it back to the Open queue. |

Any other transition (such as dragging a ticket from **Open** straight to **Closed**) will be rejected by the API with a `400 Bad Request` and notified via toast.

---

## SLA Priority Thresholds

SLA deadlines are auto-calculated from creation time based on priority:

* **Urgent**: 2 Hours (pulsing alert)
* **High**: 8 Hours (orange alert)
* **Medium**: 24 Hours (standard)
* **Low**: 48 Hours (extended)

---

## Setup & Local Run

### Prerequisites
* Node.js (v18+)
* MongoDB (Running locally or an Atlas cluster)

### Running Backend
1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```
2. Create `.env` from `.env.example` and set `MONGO_URI` (defaults to local database).
3. Install dependencies and start server:
   ```bash
   npm install
   ```
   * Development mode: `npm run dev`
   * Production mode: `npm start`

### Running Frontend
1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Create `.env` from `.env.example` and define `VITE_API_URL` (points to your running backend, e.g. `http://localhost:5000` locally).
3. Install dependencies and run Vite dev server:
   ```bash
   npm install
   npm run dev
   ```

---

## Deployment Settings

### Backend → Render
* **Root Directory**: `backend`
* **Build Command**: `yarn install`
* **Start Command**: `yarn start`
* **Environment Variables**: Add `MONGO_URI` variable under Environment settings in the Render dashboard and set its value to your MongoDB Atlas cloud database connection string. Do not use localhost URLs in production.

### Frontend → Vercel
* **Root Directory**: `frontend`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Environment Variables**: Add `VITE_API_URL` pointing to your deployed Render URL (without trailing slash).
