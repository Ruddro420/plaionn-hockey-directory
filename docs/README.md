# Plaionn Hockey Directory — Developer Handoff

Version 1.0 • 5 November 2026 • Product specification for estimation and implementation

## Start here

Build a mobile-first adult hockey discovery website that helps players find leagues and helps captains discover tournaments and register interest in the Plaionn Champions League. Launch in the Greater Toronto Area; support additional Canadian regions through data rather than separate codebases.

Read `01_Product_and_UX.md`, `02_Data_and_Engineering.md` and `03_Delivery_and_Acceptance.md` in that order. `backlog.csv` is an estimation worksheet. This package is a proposed implementation baseline, not a deployed application, approved legal policy, completed visual design or commitment to a particular vendor.

## Commercial purpose

Free, useful directory → opted-in player and captain relationships → tournament participation → Champions League participation → evidence for new league launches. League operators should benefit from recruitment and referral traffic. Plaionn-operated leagues must be identified transparently.

## Developer response requested

Return a milestone quote with effort and price by backlog item, recurring service costs, assumptions, exclusions, dependencies and a recommended stack compatible with the existing Plaionn app. Identify reusable components before proposing a separate platform. Quote Phase 1 independently from Phase 2 and Phase 3. Include design, implementation, QA, deployment, documentation and handover.

## Owner decisions before production

Confirm public brand/domain, existing app/repository/authentication architecture, business contact, approved privacy and terms copy, support inbox, production hosting and sender domain. Confirm whether event pages link to an existing registration provider. Use configurable placeholders in staging; these decisions do not block estimating or building the core directory.

## Source material

- Current strategy: Plaionn discussion accompanying this package. This specification governs the proposed MVP; future phases are not launch commitments.
- League research workbook: https://docs.google.com/spreadsheets/d/16xISCRi4b9aTwnkKSLNzSW9MvV8GPdPee7Fm55K3tW0/edit#gid=178602015 — Leagues tab; Hockey Directory tab contains discovery sources. Re-read live workbook at import time; do not assume row counts or statuses remain unchanged.
- Toronto allocation source: https://www.toronto.ca/wp-content/uploads/2026/04/97bf-978a-ice-allocation-entitlements-2025-2026-1.pdf — applicant leads require verification; the document heading and filename may refer to different seasons. Never treat an ice applicant as proof of an active standalone league.
- Design inspiration reviewed: https://www.brodierec.com/locations ; https://www.brodierec.com/drop-in ; https://www.brodierec.com/locations/vaughan-gta . Use principles of local discovery, clear divisions and membership value; do not copy branding, layouts or claims.

## Package contents

1. Product scope, route inventory, screen specifications and flows.
2. Data model, permissions, import controls, interfaces and operations.
3. Delivery milestones, acceptance tests and handover checklist.
4. Backlog CSV ready for estimating or importing into a task tracker.

No production credentials, private league outreach data or player records are included.
