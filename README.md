# Customer 360 & Next-Best-Action (NBA) Engine
### Powered by Snowflake Cortex AI, TypeScript, and Node.js

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg?logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg?logo=react)](https://react.dev/)
[![Snowflake Cortex](https://img.shields.io/badge/Snowflake-Cortex%20AI-29B5E8.svg?logo=snowflake)](https://www.snowflake.com/en/data-cloud/cortex/)
[![Tests](https://img.shields.io/badge/Tests-16%2F16%20Passed-emerald.svg)]()

> Insurers and lenders require a unified, real-time customer view to drive hyper-personalization, smarter underwriting, and churn reduction. **Apex 360** unifies structured touchpoints (policies, credit scores, loans, claims ledgers) and unstructured telephony interactions (call transcripts, sentiment waveforms, competitor mentions) into a single operational 360 view with a real-time Next-Best-Action (NBA) recommendation engine and an AI Copilot.

---

## 🌟 Hackathon Judging Alignment

| Judging Dimension | Solution Execution & Evidence |
| :--- | :--- |
| **Real World Relevance** | Solves high-stakes insurance and lending problems: **(1) Policy Churn Retention** (retaining an $42.5k LTV client threatening cancellation after a 28% rate hike), **(2) Smarter Underwriting** (detecting fleet collision loss spikes and mandating IoT telematics with premium rebates), **(3) Cross-Sell Personalization** (converting a new $620k mortgage borrower into a homeowner insurance customer), and **(4) Claims Bottleneck Escalation** (resolving stalled OEM repair approvals). |
| **Technical Execution** | End-to-end **TypeScript** across backend and frontend, modular services (`CortexService`, `NBAEngine`, `CustomerService`, `CopilotService`), RESTful API endpoints, interactive audio waveform simulation, and production-grade Snowflake Cortex SQL generation. |
| **Solution Completeness** | Unified 360 dossiers, interactive audio transcript player with utterance-level sentiment badges, prioritized Next-Best-Action cards with one-click execution that updates risk scores and the audit timeline in real time, grounded Ask-360 AI Copilot, and full automated test suite (`npm test`). |

---

## 🏛 System Architecture

```mermaid
graph TD
    subgraph Data Layer
        A1[(Structured: Policies, Loans, Claims, Credit, Payments)]
        A2[(Unstructured: Audio Call Transcripts, Tone, Churn Signals)]
    end

    subgraph Snowflake Cortex Intelligence Layer
        B[Customer 360 Dynamic Table Aggregator]
        C1[SNOWFLAKE.CORTEX.SENTIMENT]
        C2[SNOWFLAKE.CORTEX.EXTRACT_ANSWER]
        C3[SNOWFLAKE.CORTEX.COMPLETE]
        C4[Vector Similarity Search]
    end

    subgraph Engine & API Services (Node + TypeScript)
        D[Customer 360 State Store]
        E[Next-Best-Action Algorithmic Engine]
        F[Ask-360 Natural Language Copilot]
    end

    subgraph Operational Web UI (React + Vite)
        G1[Portfolio Health & Risk Ribbon]
        G2[Interactive 360 Customer Dossier]
        G3[Audio Waveform Transcript Player]
        G4[One-Click NBA Dispatch & Audit Trail]
        G5[Snowflake Cortex Architecture Inspector]
    end

    A1 & A2 --> B
    B --> C1 & C2 & C3 & C4
    C1 & C2 & C3 & C4 --> D & E & F
    D & E & F --> G1 & G2 & G3 & G4 & G5
```

---

## 🚀 Key Features

### 1. Unified Customer 360 Profile
- Combines insurance policies (Auto, Home, Umbrella, Cyber, Life), lending facilities (Mortgages, Commercial Loans), and claims history.
- Calculates unified metrics: **Lifetime Value (LTV)**, **Churn Risk Score (0-100%)**, **Underwriting Risk Tier (A-Preferred to High Risk)**, and **Cortex Sentiment Score (-1.0 to +1.0)**.

### 2. Unstructured Touchpoint & Call Transcript Analytics
- Analyzes phone transcripts with speaker diarization (`Customer` vs `Apex Advisor`).
- Utterance-level sentiment scoring and signal tagging (*Rate Shock*, *Competitor Quote*, *Cancellation Threat*, *Loss Exposure*).
- Interactive audio playback simulator with scrub bar and visual waveform tracking.

### 3. Next-Best-Action (NBA) Engine
- Evaluates multi-factor signals (Churn risk, loss ratio, policy renewal dates, and call transcripts) to generate prioritized recommendations.
- Each action provides **Confidence Score (%)**, **Quantified Business Impact ($ ARR Protected or +GWP)**, **Strategic Rationale**, and the **Snowflake Cortex Trigger query**.
- **One-Click Execution**: Clicking *"Execute NBA Now"* updates customer state, reduces churn risk score, elevates sentiment, and logs an immutable audit event in the omnichannel timeline.

### 4. Grounded "Ask 360 Copilot"
- Natural language query assistant grounded in customer structured records and unstructured call transcripts.
- Answers questions like *"Why is Elena at risk of churning?"*, *"What happened on the last call with Marcus?"*, or *"Can we offer a bundle discount?"*.
- Provides clickable source citations and embedded **one-click action execution directly inside the chat window** (*"Move from a customer question to a recommended action in one experience"*).

### 5. Native Snowflake Cortex Blueprint
- Live in-app inspector showing production-ready Snowflake SQL:
  - `SNOWFLAKE.CORTEX.SENTIMENT`: Audio transcript NLP scoring
  - `SNOWFLAKE.CORTEX.EXTRACT_ANSWER`: Zero-shot competitor and entity extraction
  - `SNOWFLAKE.CORTEX.COMPLETE`: LLM-generated rationale and action proposals
  - `DYNAMIC TABLE`: Real-time Customer 360 Master View DDL

---

## 🛠 Tech Stack

- **Runtime & Backend:** Node.js (v20+ / v24), Express 4, TypeScript 5.7, TSX
- **Frontend & Bundling:** React 18, Vite 6, Lucide Icons, Pure Modern CSS (Dark-mode glassmorphic design system)
- **Data & Intelligence:** Synthetic Insurer & Lender Multi-Domain Dataset, Snowflake Cortex AI function simulator & DDL generators
- **Testing:** Automated verification suite (`src/tests/verify.ts`)

---

## ⚡ Quickstart Guide

### Prerequisites
- Node.js (v18 or higher; tested on v24)
- npm (v9 or higher)

### 1. Installation
```bash
git clone https://github.com/ujju2020/Customer-360-and-Next-Best-Action-Engine.git
cd Customer-360-and-Next-Best-Action-Engine
npm install
```

### 2. Run Automated Verification Tests
Run the 16-point automated test suite covering customer aggregation, sentiment extraction, NBA rules, action state mutations, and Copilot reasoning:
```bash
npm test
```

### 3. Start the Interactive Application
Start the full-stack application (Vite dev server with embedded API middleware):
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

> *Optional:* If you wish to run the standalone Express backend server on port `3001`:
> ```bash
> npm run server
> ```

### 4. Build for Production
```bash
npm run build
```

---

## 🎯 Demo Walkthrough (Judge / Evaluator Flow)

1. **Portfolio Overview:**
   - Review the top KPI ribbon: Total Managed LTV ($273,100), Average Churn Risk, High-Risk Accounts, and Queued Next-Best-Actions.
2. **Inspect At-Risk High Net-Worth Account (Elena Rostova - CUST-1001):**
   - Click on **Elena Rostova** in the left sidebar. Notice her **89% Churn Risk** and **-0.78 Cortex Audio Sentiment**.
   - Switch to the **"Call Transcripts & Audio"** tab.
   - Click **Play** on the audio player to observe simulated call playback and waveform progression.
   - Observe the highlighted utterance: *"Victoria, I am absolutely furious... cancel my renewal if you don't fix this... State Farm quoted $3,100."*
3. **Execute Next Best Action:**
   - Return to the **"Next Best Actions"** tab.
   - View the top action: *"Deploy VIP Retention Package & 15% Loyalty Rate Adjustment ($10,450 ARR Protected)"*.
   - Click **"Execute NBA Now"**.
   - Notice the instant feedback: status transitions to **Executed & Audited**, Elena's churn risk score drops from 89% to 44%, and a new audit event appears in the **Omnichannel Journey** tab.
4. **Move from Question to Action with Ask 360 Copilot:**
   - Click **"Ask 360 Copilot"** in the top navigation or on the customer header.
   - Click the prompt pill: *"Why is Elena at risk of churning?"*.
   - Read the grounded response with citations to the call transcript and risk dossier.
   - If an action is pending, notice you can execute it directly from the chat conversation!
5. **Explore Smarter Underwriting (Marcus Vance - CUST-1002):**
   - Select **Marcus Vance** (Commercial Fleet & Logistics).
   - See how multiple collision claims and driver turnover escalated his **Underwriting Risk Score to 84/100 (HIGH_RISK)**.
   - Observe the Next Best Action: *"Mandate IoT Telematics Program with $3,800 Fleet Risk Rebate (-42% loss ratio)"*.
6. **Inspect Snowflake Cortex Architecture:**
   - Click **"Snowflake Cortex Architecture"** in the top header to examine the executable SQL queries for `SNOWFLAKE.CORTEX.SENTIMENT`, `COMPLETE`, and the `DYNAMIC TABLE` Master View DDL.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and timestamp |
| `GET` | `/api/analytics/kpis` | Portfolio summary metrics (LTV, Churn, Pending NBAs) |
| `GET` | `/api/customers` | Query customers with optional filters (`search`, `tier`, `riskCategory`) |
| `GET` | `/api/customers/:id` | Full Customer 360 dossier with policies, loans, claims, and transcripts |
| `POST` | `/api/customers/:id/actions/:actionId/execute` | Executes an NBA, mutates customer state, and logs timeline event |
| `POST` | `/api/copilot/ask` | Grounded natural language Q&A with transcript citations and proposed actions |
| `GET` | `/api/snowflake/blueprint` | Production Snowflake Cortex SQL DDL and query templates |
| `POST` | `/api/admin/reset` | Resets dataset to pristine initial state |

---

## ❄️ Snowflake Cortex SQL Example

```sql
-- Dynamic Table extracting Sentiment & Churn Signals from Telephony Ingest
CREATE OR REPLACE DYNAMIC TABLE ANALYTICS.CUSTOMER_360.TRANSCRIPT_SENTIMENT_FEEDS
TARGET_LAG = '5 MINUTES'
WAREHOUSE = COMPUTE_WH
AS
SELECT 
    t.customer_id,
    t.transcript_id,
    t.call_timestamp,
    SNOWFLAKE.CORTEX.SENTIMENT(t.raw_transcript_text) AS sentiment_score,
    SNOWFLAKE.CORTEX.EXTRACT_ANSWER(
        t.raw_transcript_text, 
        'Does the caller express an intent to cancel or mention a competitor?'
    ) AS competitor_churn_signal
FROM RAW_INGEST.TELEPHONY.VOICE_TRANSCRIPTS t;
```

---

## 📄 License & Copyright

**Copyright (c) 2026 Ujjwal Kumar Bhowmick**  
- **Developer**: Ujjwal Kumar Bhowmick  
- **Email**: [ujjwalkumarbhowmick30@gmail.com](mailto:ujjwalkumarbhowmick30@gmail.com)  
- **All rights reserved.**