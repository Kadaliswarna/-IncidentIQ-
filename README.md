# INCIDENTIQ

> **"Remember every incident. Resolve the next one faster."**

**IncidentIQ** is a production-grade, AI-powered autonomous Incident Response Agent built with **Hindsight agent memory** and **Groq reasoning** (`openai/gpt-oss-120b`). It empowers Site Reliability Engineers (SREs) and DevOps teams to dramatically reduce Mean Time to Resolve (MTTR) by continuously learning from past failures and resolutions.

---

## The IncidentIQ Memory Loop

The core architecture makes the persistent agent memory loop visually and functionally central to operations:

```
NEW INCIDENT
      ↓
AI ANALYZES INCIDENT
      ↓
HINDSIGHT RECALL
      ↓
FIND SIMILAR HISTORICAL INCIDENTS
      ↓
IDENTIFY ROOT-CAUSE PATTERNS
      ↓
RECOMMEND PREVIOUSLY SUCCESSFUL RESOLUTION
      ↓
RUNBOOK
      ↓
RESOLVE INCIDENT
      ↓
GENERATE POST-MORTEM
      ↓
HINDSIGHT RETAIN
      ↓
NEW KNOWLEDGE AVAILABLE FOR FUTURE INCIDENTS
```

---

## Key Features

1. **Autonomous Incident Investigation**:
   - Live telemetry status and duration tracking.
   - Groq AI analysis identifying error patterns and symptoms without presenting unconfirmed facts as truth.
   - Explicit **LIKELY ROOT CAUSE** and **CONFIDENCE** scoring (e.g. 94% confidence).

2. **Real Hindsight Cloud Memory Recall**:
   - Queries `https://api.hindsight.vectorize.io` across multi-strategy retrieval (semantic similarity, keyword BM25, causal graph traversal, and temporal search).
   - Surfaces historical incident cards (e.g. `INC-1042` with 92% similarity, `INC-982` with 87% similarity) with past root causes and resolutions.
   - One-click `[Use Resolution]` to apply historical remediation steps directly.

3. **Interactive Recommended Resolution**:
   - Checkbox checklist dynamically updated from historical memory and AI analysis.
   - Interactive progress bar; checking steps timestamps actions and automatically appends them to the live incident timeline.

4. **Executable Runbook Library**:
   - Step-by-step procedures, prerequisites, CLI commands with one-click clipboard copy, live execution simulator, verification checks, and rollback plans.
   - Pre-loaded with `DB-CONNECTION-04`, `KUBE-POD-OOM-02`, `REDIS-FAILOVER-01`, and `AUTH-TOKEN-LEAK-05`.

5. **Live Incident Timeline**:
   - Categorized vertical stream with dedicated icons for **detection**, **AI analysis**, **memory recall**, **engineer action**, and **resolution**.

6. **Automated Post-Mortem & Hindsight Retain**:
   - Automatically generates executive summary, impact analysis, timeline, root causes, contributing factors, what worked, what didn't work, lessons learned, and preventive actions.
   - Clicking **`SAVE TO HINDSIGHT MEMORY`** executes a real `client.retain()` operation into Hindsight Cloud, making new knowledge instantly accessible for future incidents.

7. **Incident Response Agent Chat**:
   - Interactive conversational assistant grounded in the active incident context and recalled memories from Hindsight with citation tags.

8. **Visual Memory Relationship Graph**:
   - Multi-hop causal chain tracing:
     `Current Incident → API Gateway Latency → Database Connection Pool → Connection Exhaustion → Historical Incidents → Successful Resolution → Runbook`.

9. **Microservices Health**:
   - Live status for API Gateway, Payment Service, Database, Authentication, and Notifications with telemetry, common root causes, and related runbooks.

---

## Security Architecture

- **Zero Client Secret Exposure**: API keys (`HINDSIGHT_API_KEY`, `GROQ_API_KEY`) are kept exclusively on the backend in `backend/.env`.
- Frontend makes zero external API calls to Hindsight or Groq; all communication is routed via backend proxy.
- `.env` is included in both root and backend `.gitignore`.
- Template `.env.example` is provided with clean variable placeholders.

---

## Getting Started

### 1. Backend Setup

```bash
cd backend

# Create or verify .env
cp .env.example .env
# Edit .env with your keys:
# HINDSIGHT_API_KEY=hsk_...
# HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
# GROQ_API_KEY=gsk_...
# GROQ_MODEL=openai/gpt-oss-120b
# CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open `http://localhost:5173` in your browser.
