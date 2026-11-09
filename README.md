# 🏒 Plaionn Hockey Directory & Champions League Platform

> **Mobile-first Adult Hockey Discovery, Team Hub & Champions League Platform**  
> Serving the Greater Toronto Area (GTA) with regional expansion capability via data configuration.

---

## 🎯 Executive Summary & Commercial Purpose

The **Plaionn Hockey Directory** fulfills the developer handoff specification defined across `01_Product_and_UX.md`, `02_Data_and_Engineering.md`, `03_Delivery_and_Acceptance.md`, and `Wheelhouse Champions League & Challengers Cup Format.docx`.

- **Commercial Flywheel:** Free, high-utility directory → opted-in player & captain relationships → tournament discovery → Champions League participation → evidence for future league launches.
- **League Operator Partnership:** Transparent disclosures; free listing & referral traffic; respect for independent league governance.
- **Privacy & Compliance:** Canadian Anti-Spam Legislation (CASL) compliant; private contact information strictly segregated from public API and search index payloads.

---

## 🏗️ Technical Architecture & Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19, Tailwind CSS v4, Lucide Icons | Responsive (360px mobile, 768px tablet, 1440px desktop), WCAG AA accessible, ink (`#12202B`) / ice (`#F5F8FA`) / action blue (`#1463DF`) palette |
| **Backend** | Node.js (v24), Express 5 | REST API, optimistic concurrency locking, rate limiting, secure error handling |
| **Database** | SQLite via `better-sqlite3` (WAL mode) | ACID compliant, foreign keys enabled, indexed search, zero-latency queries |
| **Data Importer** | Staged Two-Phase Importer | Staging preview, duplicate candidate detection, applicant lead quarantine, idempotency |
| **Test Matrix** | Native Acceptance Test Suite | Automated test runner covering all 22 acceptance scenarios (`A01`–`A22`) |

---

## 🚀 Quick Start Guide

### 1. Installation
```bash
npm install
```

### 2. Seed Database (Pre-loaded with 79 GTA Leagues)
```bash
npm run seed
```
This populates the relational database with the 79 GTA hockey leagues extracted from `Men's Hockey Leagues to Add.xlsx`, complete with season offerings, arena links, and source evidence citations.

### 3. Run Acceptance Tests
```bash
npm test
```
Executes all 22 acceptance tests (`A01` through `A22`) with 100% pass verification.

### 4. Start Development Server
```bash
npm run dev
```
Starts both the Express API server on `http://localhost:3001` and the Vite dev server on `http://localhost:5173`.

### 5. Production Build & Execution
```bash
npm run build
npm start
```
Compiles production assets to `/dist` and serves both the API and client application on `http://localhost:3001`.

---

## 🗺️ Route Inventory

| Route | Purpose | Key Features |
|---|---|---|
| `/` | Homepage | Search hero, curated cities, featured leagues, Captain's Club teaser, Champions League banner, Operator value proposition. |
| `/leagues` | League Finder | Full faceted search (city, night, skill tier, registration format, sport type), URL query parameter sync, sorting, zero-match empty state with unmet demand CTA. |
| `/leagues/:slug` | League Profile | Verified details, operator disclosures, season offerings, arenas, honest fee labeling (no fabricated fees), source citations with checked dates, outbound official link modal, report correction/claim modal. |
| `/locations/:province/:city` | Curated City Hubs | In-depth local guide for Toronto, Vaughan, Brampton, Mississauga, Markham, Whitby, Oakville, Burlington. |
| `/champions-league` | Competition Hub | Full breakdown of the Champions League (1st place & playoff champions) vs Challengers Cup (2nd through top half), 5 skill tiers, knockout bracket format, and interest form. |
| `/captains` | Captain's Club | "Less organizing. More hockey." Captain team submission form with CASL decoupled consent. |
| `/teams` & `/teams/:slug` | Approved Team Directory | Moderated public team profiles showing team name, city, division, and home league affiliation. No private contact or player rosters exposed. |
| `/tournaments` | Tournaments Catalogue | Published weekend tournaments, pricing, guaranteed games, format, registration links or interest capture. |
| `/operators` | For League Operators | Partner proposition, free listing benefits, submission & claim pathway. |
| `/request-a-league` | Unmet Demand Capture | Capture unserved player & team demand by city, nights, and skill level. |
| `/verify-email` | Email Verification | Single-use expiring token verification with safe reuse/expiry error handling and resend option. |
| `/admin` | Operations Console | Overview & 90-day freshness alerts, Listing Requests Queue, Team Submissions Approval, CSV Staging Importer, and 22-Point Test Matrix runner. |

---

## 🧪 Acceptance Matrix Compliance (A01–A22)

Every acceptance criterion defined in `03_Delivery_and_Acceptance.md` has been implemented and tested:

- **A01: Search Alias & Filters:** Case-insensitive search on league names, aliases, and arenas; URL query string state persistence; unknown nights not falsely matched.
- **A02: Zero-Match Empty State:** Honest empty state without fabricated listings; retains query context with immediate "Request a League" action.
- **A03: Unknown Fee Display:** Honest "Fee not publicly published" display when fees are null; source URL and verification date cited.
- **A04: Public Payload Privacy:** Unverified municipal ice allocation applicant leads (e.g., H.E.T.I. Adults) strictly excluded from public view; leads and CRM notes isolated.
- **A05: Import CSV Staging Preview:** Staging preview flags applicant leads, duplicate candidates, and missing fields without mutating live database.
- **A06: Idempotent Reimport:** Reimporting unchanged data updates existing records in place without duplicating organisations or programmes.
- **A07: Operator Update Protection:** Stale research cannot overwrite operator-confirmed records without explicit override.
- **A08: Interest Deduplication:** Unique deduplication keys prevent repeated lead entries or redundant email dispatch.
- **A09: Expiring Single-Use Tokens:** Verification tokens are single-use; expired or reused tokens show safe guidance and resend flow.
- **A10: CASL Consent Decoupling:** Optional marketing opt-in is unchecked by default; transactional service receipts function independently.
- **A11: Listing Claim Queue:** Claim requests enqueue into pending review; no automatic ownership transfer without evidence verification.
- **A12: Admin Authorization:** Admin routes require valid authentication (`x-admin-token` / Bearer token); unauthorized requests return HTTP 401.
- **A13: Listing Corrections Queue:** Correction submissions queue for editorial review with full audit log trail.
- **A14: Honest Event Lifecycle:** Interest-only events show honest TBA dates/fees without false payment claims.
- **A15: Moderated Team Profiles:** Approved public profiles display only verified squad details; captain email, phone, and rosters are strictly omitted.
- **A16: WCAG AA Accessibility:** Explicit form labels, focus rings, semantic HTML, and ARIA attributes throughout.
- **A17: Responsive Design:** Fluid layouts tested across 360px mobile, 768px tablet, and 1440px desktop viewports.
- **A18: Slug Redirects:** Updating a league slug preserves SEO equity via 301 redirects in `slug_redirects`.
- **A19: Backup & Recovery:** Staging backup and restore endpoints serialize and recover the complete relational schema.
- **A20: Analytics Reconciliation:** Admin dashboard separates unique verified leads from raw tentative submissions.
- **A21: Optimistic Concurrency Control:** Stale writes during concurrent admin edits are rejected via version checking (HTTP 409 Conflict).
- **A22: Hostile Input & URL Protection:** URL schemes validated (HTTP/HTTPS only); payload size caps prevent denial-of-service or script execution.

---

## 🔒 Security & Admin Access

- **Admin Secret Token:** Set via `ADMIN_TOKEN` environment variable (default: `plaionn-admin-key`).
- **Database File:** Located at `server/db/hockey_directory.db`.
- **Source Documents:** Preserved in `/docs` directory.
