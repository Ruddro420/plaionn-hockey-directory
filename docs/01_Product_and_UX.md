# 01 — Product and UX

## 1. Launch boundary

**Phase 1: directory and demand capture.** Public home, league search and profiles, curated city pages, event catalogue/detail pages, Champions League interest form, Captain's Club interest/team submission, request-a-league form, listing correction/claim requests, email verification, moderation dashboard and reviewed spreadsheet import. Admin approves team submissions into minimal public team profiles. This creates useful captain relationships without requiring a full member application.

**Phase 2: member utility.** Authenticated captain/operator dashboards, approved claims, self-service team editing, recruitment postings, saved leagues/events, consented alerts and player-to-team introductions. Captain's Club in Phase 1 is explicitly an interest programme; do not advertise these functions as available until shipped.

**Phase 3: competition platform.** Event entry/payment integration, roster management, competition results and defensible cross-league ratings. Reuse the existing league app where feasible. Champions League dates, fees, qualification and format remain business decisions.

Excluded from Phase 1: mass scraping, imported player biographies or stats, cross-league rankings, live availability guarantees, payments, native mobile apps, public chat, public player contact directories, automated marketing campaigns and automatic listing claims. No third-party photos or logos are needed.

## 2. Audience and navigation

Players want suitable hockey nearby. Captains want players and suitable competition. Operators want visibility and accurate listings. Admins need reliable data and measurable demand.

Desktop navigation: Find a League • Teams • Tournaments • Champions League. Secondary links: For League Operators • Captain's Club. Mobile: compact menu and one contextual primary action. Phase 1 Teams shows approved profiles and a team-submission CTA; recruitment search only appears in Phase 2.

| Route | Phase | Purpose and main action |
|---|---|---|
| `/` | 1 | Local discovery; Find a league |
| `/leagues` | 1 | Search/filter results; View league |
| `/leagues/:slug` | 1 | Verified public details; Visit official registration/site |
| `/locations/:province/:city` | 1 | Curated local directory; Browse local leagues |
| `/teams` and `/teams/:slug` | 1 | Approved team identities; Register your team |
| `/captains` | 1 | Explain Captain's Club; Submit team/interest |
| `/tournaments` and `/tournaments/:slug` | 1 | Published event details; External registration or interest |
| `/champions-league` | 1 | Explain planned competition; Register interest |
| `/request-a-league` | 1 | Capture unmet local demand |
| `/operators` | 1 | Explain free listing/partner proposition; Submit or claim listing |
| `/listing-request` | 1 | Correction, addition, claim or removal request |
| `/privacy`, `/terms`, `/contact` | 1 | Owner-approved policies/support |
| `/admin` | 1 | Restricted review, publishing and data management |
| `/account/*` | 2 | Authenticated self-service tools |

## 3. Homepage composition

1. Header/navigation.
2. Hero: **Your next great season starts here.** Supporting text: Find adult hockey leagues, join a team and discover tournaments near you.
3. City/postal-area search with Find a league primary action. Secondary actions: Register your team and Explore tournaments. Use manual location entry by default; location permission is optional.
4. Local league cards: name, area, season, level, nights and registration link status. Never fabricate missing values.
5. Captain section: **Less organizing. More hockey.** Explain current interest programme accurately.
6. Upcoming published tournaments; if none exist, show an honest interest CTA instead of invented events.
7. Champions League: **Win your league. Take on the city.** Supporting copy: A planned competition connecting adult hockey teams across leagues. Register interest for updates on format and eligibility. Interest does not guarantee entry.
8. Operator section: **Keep your league. Give your teams more to play for.** Free listing, referrals and event partnerships.
9. Footer: contact, policies, corrections and Plaionn ownership disclosure.

## 4. League finder and profile

Search indexes published league names, aliases, municipalities and arenas. Phase 1 filters: municipality, season, programme category, skill label, age eligibility, playing night and individual/team registration. Keep ice hockey default; distinguish ball hockey explicitly if retained in source data. Radius search is optional Phase 2 unless geocoded arenas are ready.

Filter state lives in URL parameters; browser back and shared links restore it. Multiple selections within a filter use OR; different filters use AND. Unknown field values do not match a specific filter and must not be inferred. Default sort is relevance for text searches, otherwise name; offer city/name sorting. Sponsored placements are labelled and separated from ordinary organic ordering.

Cards: league name, area, category, season, days, skill description, verification label and View league. Show Unknown/Not confirmed where relevant. Do not show invented fees or open places. Empty state offers Clear filters and Request a league while retaining search context.

Profile: title and area; operator disclosure; programme summary; arenas; season/days; age and eligibility; skill labels as described by the source; fee with currency, unit and season if known; official registration link; public general contact only when approved; source links and date checked; report correction; related local options. A source-linked listing is not necessarily operator-claimed. Labels must distinguish Research checked, Operator confirmed and Information needs review.

Unverified municipal applicant leads remain admin-only. No public acquisition priority, ownership speculation, outreach history, private person contact or spreadsheet notes.

## 5. Forms and flows

All forms: accessible labels, inline validation, preserved values on error, clear success state and submission identifier. Verify email before counting a lead as confirmed. Rate-limit and provide accessible spam controls. Marketing opt-in is optional, separate and unchecked; a service request must work without it.

| Form | Required | Optional | Result |
|---|---|---|---|
| Captain/team interest | Captain name/email, team name, city, current league or independent, interest type | Division, preferred events, roster-size estimate | Pending private submission; verification email; admin review before public profile |
| Champions League interest | Name/email, role, city, team if captain | Home league/division, preferred season | Interest receipt; no promised place or qualification |
| Request a league | Email, city, preferred nights, skill description, individual/team | Travel radius, preferred season, team-size estimate | Verified demand record; admin segmentation |
| Listing request | Request type, relevant listing or new name, email, proposed change | Evidence URL, message | Review queue; no automatic publication or ownership transfer |
| Event interest | Email, event ID, individual/team | Team name, desired division | Receipt; event-specific interest record |

League visit flow: search → inspect profile → external official site; outbound links identify destination. No compulsory signup.

Captain flow: submit team → verify email → admin checks consent to publish team fields → approve public team identity → record competition interest. Contact details remain private. Later member account links to the same stable team ID.

Claim flow: identify listing → submit evidence → verify requester → admin independently checks authority → approve role in Phase 2. A matching email domain alone is insufficient. Duplicate/conflicting claims enter manual review; current editors are not silently displaced.

Team profiles show team name, city, home league relationship if confirmed, division label and verified event history when available. No player names, rosters, personal contact details or inferred ratings in Phase 1. Multiple home-league affiliations are possible.

## 6. Event and Champions League content

Event fields include organiser, location, dates/timezone, eligibility, divisions, price/currency and unit, guaranteed games, registration deadline, format, cancellation policy link and registration URL. Only publish commercial promises supplied by the organiser. Allow draft, interest-only, registration-open, full, completed and cancelled states. Missing dates or pricing are clearly TBA. External registrations are not counted as paid registrations without a confirmation integration.

Champions League is an interest page at launch. Explain that format, qualification, locations and dates will be announced. Do not publish unsupported national rankings or imply affiliation with other sports competitions.

## 7. Visual system and responsive behaviour

Proposed direction, subject to brand approval: ink #12202B, ice #F5F8FA, white #FFFFFF, action blue #1463DF. Verify contrast in final implementation. Use system sans-serif, strong headings, 8px spacing scale, restrained borders and original text-based team badges. No third-party logos/photos required. One primary action per section.

Desktop: contained content area, filter sidebar and responsive card grid. Mobile: single column, filter drawer with result count, clear/reset controls and sticky contextual action only when it does not obscure content. Validate 360px, 768px and 1440px widths. Keyboard-operable menus/dialogs, visible focus, descriptive link names, screen-reader announcements for form errors/results, reduced-motion support and touch targets around 44px.

## 8. Success measures

Report verified captains, unique teams expressing event interest, outbound league referrals, verified demand by city/night, listing freshness and approved operator claims. Event payment metrics require confirmed provider data. Separate raw submissions from verified leads; deduplicate repeat interest from the same team/event. Do not invent commercial conversion targets before a baseline exists.
