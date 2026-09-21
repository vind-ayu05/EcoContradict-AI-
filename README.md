# EcoContradict AI 🌿

> **"Find sustainability problems before they happen."**

EcoContradict AI is an environmental-tech decision-support platform designed to analyze planned events, construction/renovation projects, community programs, and corporate operations to **detect hidden contradictions between stated sustainability goals and actual planned actions**.

---

## 🌟 The Core Innovation

Most environmental tools either calculate carbon footprints retrospectively (after emissions occur) or act as generic conversational chat interfaces. 

**EcoContradict AI solves the upstream planning mismatch:**
- **Sustainability Goal:** "Zero-Waste Campus Hackathon"
- **Planned Action:** 500 single-use plastic water bottles, disposable polystyrene plates, 2,500 printed forms & certificates.

**EcoContradict AI Detects:**
> ⚠️ **SUSTAINABILITY CONTRADICTION DETECTED**
> - **Goal:** Zero Waste
> - **Conflicting Action:** 500 Single-Use Plastic Water Bottles
> - **Why it contradicts:** The goal promises landfill diversion, yet procurement schedules non-biodegradable virgin petroleum polymers generating ~22.5 kg of solid plastic waste.
> - **Recommended Alternative:** Install 4 touchless hydration stations + "BYO Bottle" campaign.

---

## 🚀 Key Features

1. **Multi-Step Plan Audit:** Enter project plans via text or upload PDF documents.
2. **Goal-vs-Action Contradiction Engine:** Identifies specific conflicts, explains why they exist, and flags risk level.
3. **6 Sustainability Categories:**
   - ♻️ Waste
   - 💧 Water
   - ⚡ Energy
   - 🚗 Transportation
   - 📦 Materials
   - 🛒 Consumption
4. **Overall Sustainability Scoring (0–100):** Mathematically weighted scoring with category risk distribution.
5. **Before vs After ("Transform Your Plan"):** Visual side-by-side transformation with direct replacement guidance.
6. **Interactive "What-If?" Simulator:** Interactively test alternative choices and watch scores improve in real-time.
7. **Ask EcoContradict Contextual Assistant:** Grounded AI assistance specifically briefed on the active project audit.
8. **Professional Export & Reporting:** Complete compliance reports downloadable in Markdown/JSON format.
9. **Responsible AI by Design:** Complete transparency on confidence, model assumptions, and human-in-the-loop governance.
10. **Zero-Key Deterministic Demo Mode:** Operates immediately without requiring external API keys.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion, Recharts
- **Backend:** Node.js, Express, TypeScript, REST API, Multer, PDF-Parse, Zod
- **Database:** Prisma ORM schema, Persistent local storage engine with SQLite migration compatibility
- **AI Engine:**
  - Modern `@google/genai` SDK (`gemini-3.8-flash`) with structured schema output
  - Deterministic rule-based fallback engine for offline / keyless execution

---

## 📦 Project Structure

```
/
├── server.ts                     # Full-stack server entry point (Express + Vite)
├── backend/
│   └── src/
│       ├── ai/                   # Modular AI services
│       │   ├── AIAnalyzer.ts
│       │   ├── GoalExtractor.ts
│       │   ├── ActivityExtractor.ts
│       │   ├── ContradictionDetector.ts
│       │   ├── RiskClassifier.ts
│       │   ├── RecommendationEngine.ts
│       │   ├── ImpactEstimator.ts
│       │   ├── ReportGenerator.ts
│       │   ├── DemoAIEngine.ts
│       │   └── GeminiAIEngine.ts
│       ├── controllers/
│       ├── routes/
│       ├── validators/
│       └── types/
├── database/
│   ├── prisma/
│   │   ├── schema.prisma         # Prisma ORM schema
│   │   └── seed.ts               # Database seed script
│   ├── db.ts                     # Persistent data store & seed engine
│   └── ecocontradict_store.json  # Auto-generated persistent records
├── src/                          # React client application
│   ├── components/               # Modular UI views & charts
│   ├── lib/                      # API client & utilities
│   ├── types/                    # Shared client types
│   ├── App.tsx                   # Main SPA orchestration
│   └── index.css                 # Tailwind CSS styles
└── docs/                         # Architecture & responsible AI docs
```

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`. If `GEMINI_API_KEY` is not provided, the application runs in high-fidelity **Deterministic Demo Mode**.

```env
GEMINI_API_KEY="your-gemini-key-here"
PORT=3000
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚖️ Responsible AI Principles

1. **Advisory Decision Support:** EcoContradict AI augments human organizers; it does not replace procurement authorities or environmental safety officers.
2. **Transparent Reasoning:** Every contradiction explanation explicitly cites the conflict mechanism and provides verifiable life-cycle assumptions.
3. **Data Privacy:** Plans submitted for analysis are stored locally in the isolated application environment and never used for public model training.
4. **Uncertainty Calibration:** Confidence scores are transparently communicated to prevent over-reliance on estimates.
