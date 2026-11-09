# 02 — Data and Engineering

## 1. Architecture boundaries

Proposed architecture: server-rendered public website, application API, relational database, restricted admin interface and transactional email service. Use the existing Plaionn app's stable IDs/authentication where available. The developer should propose exact tools and currently supported versions; no vendor selection or version is mandated by this document.

Public pages use only approved published records. Admin write paths enforce server-side permissions. Background tasks handle email delivery, source freshness reminders and optional approved imports. Search can begin with database-backed filtering; a dedicated search service is unnecessary until demonstrated scale requires it.

Separate development, staging and production. Keep credentials server-side and out of repositories. Plaionn owns the source repository, domains, deployment accounts and database; developer access is delegated and revocable.

## 2. Logical data model

All core records use immutable IDs, created_at/updated_at timestamps and an audit trail. Slugs are presentation identifiers with redirect history. Unknown values are null, not invented defaults. Dates have explicit timezone context; monetary amounts have currency and unit.

| Entity | Principal fields and relationships |
|---|---|
| Organisation | ID, name, aliases, official domain, operator type if verified; owns multiple programmes |
| League programme | ID, organisation_id, name, slug, category, eligibility text, description, publication status, claimed status, owner disclosure |
| Season offering | ID, programme_id, season label/start/end, skill labels, nights, registration modes/status, fee amount/currency/unit, registration URL, last_checked_at |
| Arena | ID, name, address, city/province/country; optional coordinates and coordinate source |
| Offering arena | offering_id + arena_id; multiple arenas permitted |
| Source evidence | ID, URL, source type, retrieved/checked dates, applicable season, evidence summary, rights/review notes |
| Field evidence | entity type/ID, field name, source_id, verification status, reviewer and checked date |
| Team | ID, public name/slug, city, publication status; no public captain email |
| Team affiliation | team_id, programme/offering_id, season, division label, confirmation status |
| User and membership | Auth identity; role scoped to team/programme; administrator roles separately assigned |
| Lead | ID, private contact details, role, city, email verification status, source channel; merge only after review |
| Interest | lead_id, optional team_id/event_id, interest type, city/night/season preferences, status; dedupe key |
| Event | ID, organiser_id, type, slug, lifecycle state, dates/timezone, location, divisions, price/unit, policy and registration URLs |
| Listing request | listing ID if applicable, request type, evidence, requester, review state, assigned admin and decision |
| Consent | lead/user ID, purpose/channel, exact text version, timestamp, acquisition source, withdrawal timestamp |
| Import batch/row | source ID, source row key/hash, raw private staging data, mapping version, review result, proposed changes |
| Audit entry | Actor, time, action, target ID, before/after changes; sensitive fields access-controlled |

Skills/levels use original league descriptions in Phase 1; no assertion that one league's A/B/C levels equal another's. Store operator, programme and season separately so six locations of an operator are neither merged into one public programme nor mistaken for six unrelated owners.

## 3. Publication and freshness

Publication state: draft → review → published → archived. Verification is separate: unverified, research_checked, operator_confirmed or needs_review. A league may be published with some unknown fields after review; an unidentified applicant cannot.

Recommended configurable freshness interval: 90 days for programme facts, and an additional review before a new season. An expired date or stale check changes the visible availability wording; it must not silently assert closure. Send admin review reminders, not unrequested marketing. Preserve provenance and previous published versions.

## 4. Existing workbook import

Treat the workbook as private research, not a public CMS endpoint. Read current headers and map explicitly: its two Status columns have different meanings. Never publish the sheet or its raw rows.

| Workbook field | Treatment |
|---|---|
| League, Area, Category | Candidate programme fields; normalise and review |
| Source | Evidence URLs; validate scheme/domain and preserve multiple sources |
| Checked on | Source check date; not a guarantee that every field is verified |
| Email, Phone, Contact person | Private staging; publish only separately approved general business contact |
| Status columns, Priority, Ownership note, Opportunity | Private CRM/research only; never expose in public API, page HTML or search index |
| Attached research notes, email research fields | Private evidence; reviewer may write a clean public summary |

MVP supports admin CSV upload exported from Sheets. Direct Sheets sync is an optional later adapter, not a second editing source. Import workflow: upload → header validation → preview → candidate matching → field diff → approve → transactional publish. A preview cannot change live content.

Matching uses stored source-row identity plus normalised name, domain, location and aliases. Names alone are insufficient. Preserve separate seasonal offerings under one programme and separate locations under an operator. Duplicate candidates are reviewed; uncertain cases stay pending. Reimporting unchanged data is idempotent. Do not overwrite a newer operator-confirmed field with older research. Preserve manual overrides and provenance. Keep an import batch rollback/diff record; rollback must detect intervening edits rather than erase them.

Import test cases must include H.E.T.I. Adults as an unresolved applicant, multiple ASHL locations, separate women's/coed programmes under one operator, and an older summer season. These are review examples, not seed claims that any programme is currently open.

## 5. Interface contract (illustrative, vendor-neutral)

| Method/path | Access | Behaviour |
|---|---|---|
| GET /api/leagues | Public | Published records only; q/city/category/season/night/level/registration filters; bounded pagination |
| GET /api/leagues/:slug | Public | Approved field projection plus evidence labels; never raw record dump |
| GET /api/events | Public | Published event projection and lifecycle state |
| POST /api/interests | Public, rate-limited | Validate payload; dedupe/idempotency; create pending verification; generic receipt |
| POST /api/listing-requests | Public, rate-limited | Queue request and evidence; no direct public edit |
| POST /api/email-verifications | Token protected | Single-use expiring token; mark confirmed; no marketing consent inferred |
| POST /api/admin/imports/preview | Admin | Validate/stage only; return warnings and proposed changes |
| POST /api/admin/imports/:id/commit | Admin | Approve selected rows; concurrency check and audit |
| PATCH /api/admin/leagues/:id | Admin | Version-checked changes; explicit publish action |
| POST /api/admin/requests/:id/decision | Admin | Approve/reject with reason and audit |

Return structured field errors for invalid inputs; 401/403 for authentication/authorisation errors; 409 for stale edits; 429 for throttling. Use request IDs for diagnosis. Retry submission/webhook handling must not create duplicate leads or send repeated emails. Never expose whether an email already exists through public lookup responses.

## 6. Permissions and safety requirements

Visitors read approved public content and submit requests. Phase 1 admins manage content; reviewers may review but only authorised publishers publish. Phase 2 captains edit only approved teams; operators edit only approved programmes. Every ownership check is server-side, including export and direct object access. Admin authentication requires MFA where supported.

No public endpoint returns lead email/phone, consent records, private source rows, outreach status or unpublished drafts. Sanitize submitted content; disallow executable HTML. Validate external URLs; avoid server fetching arbitrary URLs, private addresses or redirects without controls. Use CSRF protections where applicable, secure sessions, rate limits and audited exports. Logs must omit secrets and unnecessary personal data.

Use clear privacy notices, explicit publication consent for team submissions and separate optional marketing consent. Provide correction/removal and unsubscribe mechanisms. Business owner supplies reviewed policy text, retention periods and marketing rules before production; implementation requirements here are not legal advice or permission to scrape. Public visibility alone is not a rights approval. New automated source ingestion requires source-specific approval and a disable switch.

## 7. Analytics and operations

Track: search_submitted, filter_applied, league_viewed, official_link_clicked, interest_submitted, email_verified, team_approved, listing_request_submitted and external_registration_clicked. Include non-sensitive city/category/programme/event identifiers and campaign attribution; no emails, phones or message contents in analytics. Record consent state where applicable. Paid registration is a separate server-confirmed event in a later integration.

Dashboard: verified leads by city/night/interest, unique interested teams by event, referral clicks, pending requests, stale listings and source coverage. Counts exclude rejected/spam and distinguish tentative from verified demand. Do not treat estimated roster size as committed players.

SEO: index only published profiles and useful curated city pages; canonical URLs and redirects; sitemap; descriptive titles; no indexing admin, forms, drafts or arbitrary filter combinations. Avoid thin auto-generated city pages and fabricated review/rating markup.

Operations: monitored uptime/errors, database backups, restore drill, transactional email bounce handling, queue retry/dead-letter handling and audit exports. Propose initial recovery targets of 24-hour maximum data loss and one business-day recovery; validate and price these rather than promising them without infrastructure. Provide a content/data export and instructions for restoring it independently.
