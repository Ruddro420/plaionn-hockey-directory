# 03 — Delivery and Acceptance

## Milestones and sign-off

1. **Discovery and design:** inspect existing app architecture; confirm data ownership, route map and MVP scope; produce desktop/mobile mockups for home, finder, profile, interest form and admin review. Deliver architecture proposal and milestone estimate.
2. **Data/admin foundation:** schema, permissions, evidence workflow, CSV preview/dedupe/commit, review queue and audit trail. Demonstrate on synthetic fixtures before importing business data.
3. **Public experience:** discovery, profiles, curated city pages, teams, events, Champions League and forms. Complete verification and transactional email flow.
4. **QA and staging:** complete acceptance matrix, accessibility checks, import reconciliation, performance/security checks and owner UAT. Resolve blocking defects.
5. **Launch and handover:** owner-approved production content/policies, domain and email configuration, backup/restore validation, production smoke tests, admin walkthrough and agreed support terms.

No fixed delivery dates or budget are assumed. Developer estimates dependencies and effort. Phase 2/3 require separate approval and acceptance plans.

## Acceptance matrix

| ID | Scenario | Pass condition |
|---|---|---|
| A01 | Search an alias and apply city/night filters | Correct published matches; URL persists filters; unknown night not falsely matched |
| A02 | Search with no matches | Clear state and request form; no fabricated listings; input retained |
| A03 | Open profile with unknown fee/season | Clear unknown labels, source/date and valid official link; no invented availability |
| A04 | Inspect API, HTML and search payloads | No private outreach fields, lead contacts or unpublished applicant data |
| A05 | Import mixed research CSV | Preview flags unknown applicant, duplicate candidate and missing fields; no live changes before approval |
| A06 | Reimport same approved file | No duplicate organisations/programmes/offerings and no repeated mutation |
| A07 | Import old data over manual/operator update | Conflict shown; newer approved value survives unless reviewer explicitly changes it |
| A08 | Submit interest twice/retry network | One logical interest; clear receipt; verification email not repeatedly sent |
| A09 | Verify expired/reused email link | Safe explanation/resend path; token cannot be reused to mutate other records |
| A10 | Decline marketing opt-in | Service submission succeeds; no marketing enrollment; consent record reflects selection |
| A11 | Request ownership of unrelated listing | No ownership granted until manual evidence review; no data leakage |
| A12 | Direct unauthorised admin/object access | Server rejects request; cross-team access tested when Phase 2 ships |
| A13 | Submit correction/removal | Queue item, receipt and audited admin decision; public state changes only through authorised action |
| A14 | Open interest-only event | No payment/confirmed-entry claim; unknown dates/prices shown honestly |
| A15 | Publish team | Explicitly approved public fields only; captain email and player data absent |
| A16 | Use keyboard and screen reader | Filters, menus, dialogs and forms operable; labelled errors and visible focus |
| A17 | Test 360/768/1440px layouts | No unintended horizontal scrolling, clipped actions or obscured form controls |
| A18 | Change slug/unpublish record | Old slug redirects; unpublished record leaves sitemap and public API/index |
| A19 | Restore staging backup | Core records, relationships and evidence recover; procedure documented |
| A20 | Reconcile analytics | Unique verified leads distinguish from raw submissions; outbound clicks not labelled registrations |
| A21 | Concurrent admin edits | Stale write rejected or explicit merge required; audit shows actor and result |
| A22 | Spam/hostile content and URLs | Throttled/validated; markup cannot execute; no arbitrary internal URL fetch |

Performance acceptance proposal: test homepage, filtered results and profile with 1,000 synthetic programmes and 50 concurrent browsing users; target p95 API response below 1 second in staging, excluding external links. Use a documented mobile test configuration; target LCP ≤2.5s, CLS ≤0.1 and field INP ≤200ms once enough real traffic exists. Report measurements and environment; do not substitute a single lab score for field evidence. Adjust targets with owner if infrastructure constraints materially change cost.

## Launch content checklist

- Review imported candidates; publish only understood programmes with appropriate evidence.
- Check official links, season wording and missing values; never assert complete coverage of all GTA leagues.
- Publish meaningful city pages only for supported locations.
- Confirm event facts and owner-approved qualification language; otherwise use interest-only states.
- Check disclosures for Plaionn-owned/managed programmes and any sponsored placements.
- Approve privacy/terms, request handling, retention and sender identity.
- Run all critical acceptance cases on staging; no unresolved critical security/data exposure defects.

## Handover required

Owner-controlled repository and production accounts; setup/deployment instructions; environment-variable template without secrets; database diagram and migrations; test suite and results; component/design files; import/export guide; publishing/moderation guide; backup/restore procedure; analytics definitions; third-party costs/licences; known limitations; support/warranty terms; rollback procedure and admin training recording or written walkthrough.

## Future phase gates

Phase 2 begins when repeat captain/operator demand justifies self-service. Include membership verification, role transfer, saved items, recruitment expiry/moderation and consented introductions; do not expose personal emails publicly.

Phase 3 rankings require results provenance, identity matching, a documented versioned algorithm, minimum-evidence rules, provisional labels and an appeal process. Validate against actual cross-league games. Separate rankings from tournament eligibility decisions. Payments require provider confirmation, refunds/cancellations, reconciliation and webhook replay tests. Do not rebuild these if the existing Plaionn app can safely provide them.
