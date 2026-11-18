# SupplierPulse — submission answers
UiPath "Agents at Work: The Maestro Automate Challenge" · built in Studio Web (Maestro Automate, Community plan)

> Every claim below is backed by a Debug run listed in TEST_SCENARIOS.md. All supplier data, purchase orders, the contract and the companies are fictional. The earthquake is real public USGS data (M7.4 Hualien, Taiwan, 2024-04-02, event `us7000m9g4`).

---

## 1. Overview (what it does, who it's for)
When a major earthquake strikes, SupplierPulse tells a supply-chain planner within about 40 seconds:
- which suppliers are **geographically exposed**, kept separate from **confirmed disruption**;
- how much stock and money is at risk;
- what the supplier contract allows, and which mitigation is best.

A planner then approves or rejects the recommendation. Only after approval is a mitigation request created, then verified and audited. It is for procurement and supply-chain teams who must act within hours of a disaster near a supplier site.

## 2. The problem it solves
After a quake, planners have to work out four things:
- Who is near it?
- How long does our stock last?
- What do the contracts say about expediting, alternate sources and notice periods?
- What is it worth acting on?

Doing this by hand takes hours (we assume about 3 hours per supplier). It also invites three costly mistakes:
- treating "near the quake" as "disrupted";
- relying on buffer stock that sits in the quake zone;
- committing spend before anyone has approved it.

**In the demo scenario:**
- One supplier is 121 km from the epicentre, with 12 days of cover against a 28-day lead time.
- That is a **16-day shortfall (2,400 units) and USD 192,000 of modelled line-stop exposure**: 16 days × an assumed USD 12,000 per day of line stoppage (fictional demo PO book, not a measured loss).
- Expediting under contract §2 costs at most USD 9,400 and closes the whole gap, so the **modelled net benefit is USD 182,600** (exposure avoided minus the maximum surcharge).
- The analysis took about 40 s instead of about 3 h.

## 3. How it works (Maestro controls the whole process: 41 nodes, 2 triggers, a loop over exposed suppliers, 7 End nodes that return typed results)
**Triggers (two entry points, one flow):**
- **Scheduled, every 15 min:** polls the USGS feed for M6+ events from the last 15 minutes. No event → `End: no new event` (quiet, no audit row). Contract text comes from Data Fabric (`Supplier.ContractText`) for the highest-risk exposed supplier and is passed to the agent in its prompt. Tested in Debug with a Static mock of the USGS response (TEST_SCENARIOS rows 23–25). **Deployed as v1.0.0 on 11 Nov 2026; the schedule then fired on its own** (Orchestrator job from Flow_TimeTrigger, Successful, 6 s; row 32). **Current version: v1.0.1** (adds the "terms in force" rule and switches Planner approval to Live; rows 36–37).
- **Manual (demo):** the planner uploads the supplier contract PDF; the run replays the real M7.4 Hualien event and the agent reads the PDF with Analyze Files.

| # | Step | Type | What it decides |
|---|---|---|---|
| 1 | HTTP Request: USGS event API | Integration (retry 2, timeout 1 min) | Real earthquake data |
| 2 | Parse USGS response → Load suppliers | Script + Data Fabric | Supplier sites, stock, lead times |
| 3 | **Exposure check** | Deterministic rules | Validates the USGS payload (fails loudly, never a false all-clear). Applies haversine distance and a magnitude radius (M≥7 → 300 km), then computes days of cover vs lead time and a risk score. Labels each supplier **POTENTIALLY EXPOSED** and never "disrupted". |
| 4 | **Any supplier exposed?** | Decision | No → audited NO_EXPOSURE (≈5 s, the agent is never called) |
| 5 | **Contract analyst agent** | AI agent + Analyze Files | Reads the PDF and returns 7 typed values. Its explanation separates **contract facts with section numbers** from **inferences**, and has an **"Options compared"** part giving, for each option, the clause, time to relief, cost limit and main uncertainty, plus what would change the decision. |
| 6 | **Validator** | Deterministic policy | Allowed actions only, expedite cap ≤ USD 10,000, alternate must be pre-approved, confidence check. A negation-aware language guard blocks any claim of a confirmed disruption. |
| 7 | **Business impact & options** | Deterministic maths | Units short, PO value, USD at risk. Compares expedite / alt-source / buffer / monitor on cost, arrival day, residual shortfall and residual risk. Reports exposure vs disruption status separately, plus net benefit and time saved. |
| 8 | **Proposal valid?** | Decision | No → Manual review, audited with the reasons |
| 9 | **Find existing request → Already requested?** | Data Fabric + Decision | Dedupe on event + supplier |
| 10 | **Planner approval** | Human task (Quick Form) | Approve / Reject with a comment |
| 11 | Create request → Read back request → audit | Data Fabric | The request exists only after approval and is verified by reading it back. The audit row records the value at risk and the net benefit. |
| 12 | **Loop: Each other exposed supplier** | Loop + AI agent + script + Data Fabric | Runs once for every exposed supplier other than the highest-risk one. A second contract agent (text from Data Fabric) proposes an action; a policy check (same rules and language guard as the Validator) marks it PROPOSAL_FOR_REVIEW or MANUAL_REVIEW; an AuditLog row records it for the planner. Verified with a mocked second supplier (row 28). |

**What happens when a step fails:**
- HTTP Request, Exposure check, the agent and Business impact each have an **error handle**, all wired to **Escalate failure**. That step names the failed step and reason, creates nothing, and writes an ESCALATED_ERROR audit row.
- **Every ending writes one AuditLog row** (except the quiet scheduled "no new event"): APPROVED_REQUEST_CREATED, REJECTED, DUPLICATE_SKIPPED, MANUAL_REVIEW, NO_EXPOSURE or ESCALATED_ERROR. Each loop iteration adds a PROPOSAL_FOR_REVIEW or MANUAL_REVIEW row.
- **Every ending then reaches an End node** that returns 7 typed flow outputs: outcome, recommendedAction, alternateSupplier, disruptionStatus, expediteDays, expediteCapUsd, valueAtRiskUsd. These are what the evaluations and any calling process read.

**Exposure vs disruption:**
- Proximity only ever produces "GEOGRAPHICALLY EXPOSED".
- Disruption status comes from the site status: unknown → "UNCONFIRMED", reported_operational → "SITE REPORTS OPERATIONAL", reported_impacted → "IMPACT REPORTED BY SITE".
- The agent is told never to imply disruption, and the Validator enforces it.

## 4. How I built it with a coding agent
(Also slide 14 of the deck: six logged mistakes and fixes.)
I built SupplierPulse with **Claude (Anthropic)** as my coding agent:
- First as a step-by-step guide while I clicked.
- Later directly in Studio Web through the *Claude in Chrome* extension, on my tenant, with my permission.

Every change, mistake and fix is logged in `logs/AGENT_LOG.md`.

**What the agent did well:**
- Ran a "Milestone 0" of capability probes, recorded as VERIFIED / FAILED / NOT TESTED, before building anything.
- Wrote and locally unit-tested the exposure, validator and business-impact scripts.
- Designed approve-before-create, dedupe, error escalation and the audit trail.
- Read run traces to find the agent's mistakes (it counted on-site buffer stock as safe, and omitted the 40% expedite capacity limit) and fixed them in the prompt (run #37).
- Caught false positives in its own language guard ("no / absent / if … confirmed disruption", and later "doesn't require confirmed disruption") and made the guard negation- and condition-aware (verified in run #50).

**What I changed or caught:**
- A mis-focused Ctrl+A / Delete wiped the canvas. Undo restored the nodes but not three settings, which were found from a failed run and repaired.
- The first design created the request *before* approval. We reordered it.
- After a colleague's review, we added the business-impact step, the option comparison and a live exception scenario.

## 5. Testing approach
- **Unit tests (Node):**
  - validator: 15 cases, incl. negation/condition cases and curly apostrophes
  - loop policy check: 6 cases
  - exposure maths: distances 121 / 2,146 / 12,477 km
  - business impact: 2,400 units, USD 192,000, USD 9,400, net USD 182,600, and the "impact reported" case
- **50+ Debug runs**, covering every branch. See `TEST_SCENARIOS.md`.
  - Full live runs: #30, #37, #38, #39.
  - Approve #34, Reject #33, Duplicate #38/#39, No exposure #26, Manual review #31, Escalation #35/#36.
  - Loop over a second exposed supplier (mocked Vietnam site at 96 km): PROPOSAL_FOR_REVIEW row written.
  - **Exception, unapproved alternate supplier (#40):** the agent proposes "Acme Pulp Co." → Validator blocks it → manual review + audit, and no request is created.
- **Static mocks** on single nodes simulate conditions you can't wait for: 0 USGS events, no exposure, an unapproved alternate, the planner's decision.
- **Agent evaluations, built in Studio Web (Datasets, Evaluators, Eval runs):**
  - **Dataset:** 3 contracts.
    - The baseline SP-TEST-0417, captured from run #41 with "Add to evaluations".
    - A variant with different terms: 35 d, 15 d, 12%, USD 6,000, Northbay Paper Mills.
    - A trap contract with **no expedite clause**, where the right answer is alt_source and -1 for the expedite values.
  - **Evaluators:**
    - 4 Exact Match checks: expedite cap, expedite days, alternate supplier, recommended action.
    - 1 LLM-judge rubric (100 points) scoring cited clauses, the capacity limit, on-site buffer not counted, the option comparison, no confirmed-disruption claim, no invented terms, and what would change the decision.
    - The judge uses a model that is not being compared.
  - **What the evaluations caught and fixed:**
    - The agent wrote the supplier as "Harbor Fiber Works (fictional), Penang, Malaysia". Prompt v2 adds a "company name only" rule.
    - The first judge prompt hard-coded the baseline contract's facts. Judge v2 scores each case against its own expected answer.
  - **Model comparison** (same prompt and judge, 3 contracts each):

| Model | Contract facts (4 exact checks) | Reasoning judge | Duration |
|---|---|---|---|
| **Claude Sonnet 5 (chosen)** | 100 / 100 / 100 / 100 % | 97 % | 44.9 s |
| Claude Opus 5 (Premium) | 100 / 100 / 100 / 100 % | 99 % | 55.8 s |
| GPT-5.6 Terra | 100 / 100 / **33** / 100 % | 93 % | 47.2 s |
| Gemini 3.7 Flash (newest Gemini offered) | 100 / 100 / 100 / 100 % | 82 % | 100.9 s |
| Gemini 3.1 Pro Preview | 100 / 100 / 100 / 100 % (1 of 3 cases errored) | 84 % | 87.4 s |
| **Claude Sonnet 5 + Advanced harness (Preview) — final** | 100 / 100 / 100 / 100 % | **99 %** | 52.3 s |

  - **Final choice: Claude Sonnet 5 on UiPath's new Advanced harness (Preview).** It ties Opus 5 on reasoning (99%) at Standard tier, and advanced usage is discounted 50% during the preview.
  - Every model got the contract facts right. GPT-5.6 Terra ignored the supplier-name rule in 2 of 3 cases, and the newest Gemini models scored lower on reasoning.
  - The model was chosen by evidence, not by release date. Debug run #42 confirmed the full flow on the Advanced harness. Evidence: `screens/11_eval_runs_model_comparison.jpg`.
  - **Harder test set (eval runs 13–14):** 4 more contracts: terms written in words, an amendment that overrides §2, a scanned image-only PDF, and an expedite clause that has expired. Run 13 caught a real bug: on the expired clause the agent used the old terms. One prompt rule ("use only terms in force today") fixed it; run 14 passed all 28 exact checks on 7 contracts (judge 75–98%, one judge error on the evaluator side).
  - **Re-checked after the final changes (eval run 12):** contract facts still 100% on all 3 contracts; judge 98% and 85%, and on the third row the judge itself errored (evaluator side, not the agent).

**Known limit:** the live Quick Form task fails on my Community tenant with Orchestrator error **170042** ("Failed to register the task schema … NotFound"). It fails in Debug and also in a deployed production run in the Shared folder (v1.0.1, row 38), so it is a tenant-level issue, not a flow error. The approve and reject paths were therefore tested with a Static mock of the planner's decision (runs #33, #34 and the v1.0.1 regression). The deployed version uses the live form, because production should never auto-approve. Studio does not allow an error handle on the Quick Form (row 39), so on this tenant a run that reaches approval stops with a visible incident instead of an audit row.

### From prototype data to real data
Suppliers, contracts and purchase orders are synthetic; only the earthquake is real. In production the same Data Fabric entities (Supplier, MitigationRequest, AuditLog) would be filled from the ERP and supplier master (purchase orders, stock on hand, lead times, contract text), so the flow itself does not change. The demo PO book and the line-stop cost per day held in the Business impact script would come from the ERP and finance instead.

## 6. Planner Console (UiPath Apps)
- "SupplierPulse Planner Console" was built in the browser-based UiPath Apps service.
- It shows live Data Fabric tables: the AuditLog (every run's outcome, latest first) and the monitored Suppliers.
- Planners can follow every run without opening Studio. Screenshot: `screens/12_planner_console_app.jpg`.
- **Published as v1.0.0 and deployed to the Shared folder** (`screens/14_planner_console_published.jpg`); the production app shows the loop's PROPOSAL_FOR_REVIEW row.

## 7. Demo video · screenshot · files
- **Presentation:** `SupplierPulse_presentation.pptx` (19 slides, incl. how the coding agent was used).
- **Presenter video:** `SupplierPulse_presenter_video.mp4` (5:29, no sound) with `PRESENTER_SCRIPT.md`: play it while screen sharing with FaceCam and read the script.
- **Debugging walkthrough video:** `SupplierPulse_debug_walkthrough.mp4` (2:27, captions, no voice) with `NARRATION_SCRIPT.md` for the voice-over.
- **Deployment evidence:** `screens/13_deploy_successful.jpg`, `screens/15_scheduled_job_orchestrator.jpg`.
- **Demo video:** `SupplierPulse_demo.mp4`, one end-to-end story: quake → exposure → contract reasoning → business impact → planner approval → verified request → audit, then the exception and failure cases. Upload it and paste the link.
- **Canvas screenshot:** `screens/01_canvas.jpg`. **Architecture:** `architecture.png`.
- **Solution file:** downloaded from Studio Web (Explorer → SupplierPulse → Download).

## 8. What I liked / what surprised me
**Liked:**
- Static mocks on any node make every branch testable.
- Typed agent outputs plug straight into deterministic code.
- Error handles turn failures into a normal, audited path.
- Inserting a step on an existing edge kept the flow intact.

**Surprised:**
- Data Fabric query outputs are live queries, so a downstream Decision re-reads the data and ignores a mock on the query node.
- Undo restores the canvas but not every node setting.
- A Query entity records node keeps the field list from when the entity was picked; a new field appears only after re-selecting the entity.
- Nodes can't be dragged or pasted into a Loop body; the body is built with the inner "+".
- LLM wording varies run to run, so the safety text check needed real negation handling, not keywords.
