# SupplierPulse — Capability Checks (Milestone 0)

Status values: VERIFIED (observed in a run), FAILED, NOT TESTED, NOT AVAILABLE.
Environment: Studio Web, Community Plan, Maestro Automate. Last updated 2026-11-11 (deployed, schedule verified, loop verified).

| # | Capability | Status | Evidence |
|---|---|---|---|
| 1 | Maestro Automate access + create project | VERIFIED | Solution SupplierPulse → Flow → new.flow; Build as switched to Maestro Automate |
| 2 | Docs/tools for my setup | VERIFIED | Studio Web; docs.uipath.com/maestro (Flow node reference) |
| 3 | Autonomous agent reads PDF via Analyze Files | VERIFIED | 8/8 contract values correct with section refs; trap question NOT FOUND (2026-10-25) |
| 3a | File input into flow | VERIFIED | Manual trigger input type File; object {ID, FullName, MimeType, Metadata.size} |
| 3b | Contract-as-text fallback | NOT NEEDED | PDF path works |
| 4 | USGS HTTP call from Maestro | VERIFIED | Status 200, id us7000m9g4, mag 7.4, coords [121.5976, 23.8356, 40] |
| 4d | USGS body path | VERIFIED | Script probe: object, FeatureCollection, count 1 |
| 5a | Data Fabric create record | VERIFIED | Returned Id + CreateTime, all fields echoed |
| 5b | Data Fabric query read-back | VERIFIED | Query by Id returned identical record |
| 5d | Unique constraint on RequestKey | NOT AVAILABLE (not set) | Only Id listed as unique field |
| 6 | Human Quick Form task creation | FAILED | Code 170042 "Schema registration failed with status NotFound" (2026-10-25, retested 2026-11-07); node-only run also fails |
| 6a | Approve/Reject output handles | VERIFIED (design) | Two handles appear on canvas |
| 6b | Branching via Mock output | VERIFIED | Static mock Approve → Script 2 {path:"approved"}; Reject → Script 3 {path:"rejected"} (2026-11-07) |
| 6c | Human wait within Automate runtime limits | NOT TESTED | Blocked by #6 |
| 7 | Minimal end-to-end flow | VERIFIED (approval mocked) | Trigger → HTTP → Script → Agent+Analyze Files → DF create → DF query → Quick Form (mock) → branch Script: Completed, both outcomes |
| 8 | Script node reads $vars | VERIFIED | Body-shape probe |
| 9 | Autonomous agent model run | VERIFIED | Model run succeeded; ~0.02 AgenticPool.UnifiedTokens per run |
| 11 | Context indexes | NOT AVAILABLE (none created) | Not needed |
| 12 | Single-node Run | VERIFIED | Run: Create entity record / Query entity records |
| 14 | Supplier entity + multi-record query | VERIFIED | Query entity records 2 → output.results (3 suppliers) |
| 15 | Exposure Script (distance/cover/risk) | VERIFIED | Run 2026-11-07: exposedCount 1 (SUP-TW-01) |
| 16 | Decision gate skips agent when nothing exposed | VERIFIED | True: agent ran (42 s); False (mocked exposedCount 0): NO_ACTION, no agent, 4 s |
| 17 | Agent structured outputs (7 variables) | VERIFIED | All contract values correct; recommendedAction expedite, confidence 0.72 |
| 18 | Validator Script in flow | VERIFIED | After negation fix: valid true, route approval, daysSaved 16 |
| 19 | Invalid proposal → manual review (no record created) | VERIFIED | Validator mock valid=false → Manual review MANUAL_REVIEW |
| 20 | Approval before request creation | VERIFIED | Run #22 order: Quick Form → Create → Query → Script 2 |
| 21 | Request record uses real values | VERIFIED | Run #23: expedite / us7000m9g4 / us7000m9g4\|SUP-TW-01 / run instance id |
| 22 | Duplicate check (dedupe by RequestKey) | VERIFIED | Run #24: existing record found → Duplicate skipped, no new record |
| 23 | Audit record on duplicate path | VERIFIED | Run #25 and #30: Audit duplicate → AuditLog create |
| 24 | Audit record on no-exposure path | VERIFIED | Run #26 (mock exposedCount 0): Outcome NO_EXPOSURE, RequestKey us7000m9g4\|none |
| 25 | Audit record on approved path | VERIFIED | Run #34: request A2F35CE3 created, read back, audited |
| 26 | Audit record on rejected path | VERIFIED | Run #33: Audit REJECTED with approver comment |
| 27 | Audit record on manual-review path | VERIFIED | Run #31 (live Validator flagged a negation false positive): Script 7 → Audit manual review → AuditLog |
| 28 | Full live run after trigger/agent repair | VERIFIED | Run #30, 32.9 s, ends in Audit duplicate |
| 29 | Validator negation fix (absent/pending/until…) | VERIFIED | Local tests + run #32 Validator passed the same agent output style |
| 30 | Mocking a Data Fabric query to bypass dedupe | FAILED | Decision re-queries live (LIVE QUERY), mock ignored — run #32 |
| 31 | Error handling → escalation + audit | VERIFIED | Runs #35/#36 (bad USGS data); HTTP retry 2 configured; agent/HTTP live failure NOT TESTED |
| 32 | Prompt fix (capacity limit, on-site buffer, citations) | VERIFIED | Run #37 agent output |
| 33 | Quick Form Reject → Continue, no pre-filled comment | VERIFIED (config) | Live task still blocked by 170042 |
| 34 | Regression after renames | VERIFIED | Run #38 |
| 35 | Business impact & options step | VERIFIED | Run #39: USD 192,000 at risk, expedite USD 9,400, net USD 182,600 |
| 36 | Agent option comparison with clauses/uncertainty | VERIFIED | Run #39 agent content |
| 37 | Exception: unapproved alternate → manual review | VERIFIED | Run #40 |
| 38 | Insert node on an existing edge | VERIFIED | Validator → impact → Proposal valid? edges confirmed |
| 39 | End nodes populate flow output variables | VERIFIED | Run #41 outputs panel (7 values) |
| 40 | Add a debug run to an evaluation dataset | VERIFIED | 'Add to evaluations' from run #41 (agent node) |
| 41 | Custom evaluators (Exact Match per key, LLM Judge Output with custom rubric) | VERIFIED | Evaluators tab; eval runs 1-7 |
| 42 | Eval runs on an agent-node dataset, per-row diffs and judge justification | VERIFIED | Eval runs 1-7 |
| 43 | Switch agent model and compare by evaluation | VERIFIED | Eval runs 5 (GPT-5.6 Terra), 6 (Claude Opus 5), 7 (Claude Sonnet 5) |
| 44 | Claude Sonnet 5.5 / Opus 5.5 in agent model list | FAILED (not offered on this tenant) | Model dropdown search 'claude' lists up to Opus 5 / Sonnet 5 |
| 45 | Second trigger (Scheduled, cron every 15 min) on the same flow; Debug lets you pick the entry trigger | VERIFIED | Debug runs from "Every 15 min: USGS check" (2026-11-10 and 2026-11-11) |
| 46 | Scheduled trigger firing on its own | VERIFIED | After deploy: Orchestrator job from Flow_TimeTrigger, Successful, 6.02 s (2026-11-11 ≈16:30 IST) |
| 47 | Query entity records returns a field added after the node was configured | VERIFIED after re-selecting the entity | "Refresh schema" alone did not add ContractText to the runtime query; re-selecting the entity did (node run 2026-11-11) |
| 48 | Create file (Preview) node | NOT USED | Needs an Orchestrator connection (OAuth grant); contract text passed in the prompt instead |
| 49 | Agent tool argument in Prompt mode (agent fills the Analyze Files attachment itself) | VERIFIED | Manual run: Analyze_Files tool call in trace; scheduled run: no file, agent reads text, no tool call |
| 50 | Eval re-run after the agent prompt change | VERIFIED | Eval run 11: 4 exact checks 100%, judge 89% (90 / 95 / 82) |
| 51 | Loop node over a collection, with agent + script + Data Fabric write in the body | VERIFIED | Loop "Each other exposed supplier", 1 iteration, AuditLog row (2026-11-11 16:08 IST) |
| 52 | Copy/paste or drag of existing nodes into a Loop body | FAILED | Nodes stayed outside the container; body built with the inner "+" instead |
| 53 | Agent output names that match flow output names | NOT ALLOWED | Studio rejects them; loop agent uses its own names |
| 54 | Deploy a Maestro Automate flow to Orchestrator | VERIFIED | v1.0.0, Shared/SupplierPulse, Active (`screens/13_deploy_successful.jpg`) |
| 55 | Publish + deploy a UiPath Apps app | VERIFIED | Planner Console v1.0.0 in Shared (`screens/14_planner_console_published.jpg`) |
| 56 | Eval run after the loop and validator changes | VERIFIED | Eval run 12: facts 100% on all rows; judge 98% / 85%; one judge error (evaluator side) |
| 57 | Add evaluation data points by hand (file upload + expected output) | VERIFIED | 4 new data points added in Studio Web (0420, 0421, 0424, 0425); contractTextForAgent must be non-empty to save |
| 58 | Analyze Files on a scanned, image-only PDF | VERIFIED | Eval runs 13–14, row 0424: all exact checks 100% |
| 59 | Live Quick Form task in a deployed (Shared folder) run | FAILED | Same Orchestrator 170042 as in Debug; instance faulted at Planner approval (v1.0.1 job, 11 Nov 18:34 IST) |
| 60 | Error handling on a Quick Form (human task) node | NOT AVAILABLE | Enabling it makes the health check report a form-outcome error and blocks Debug/Deploy |
| 61 | Redeploy a new version (Pack and upgrade) | VERIFIED | 1.0.0 → 1.0.1, Active |
| 13 | Per-node error handle | VERIFIED (exists) | "Enable error handling" toggle |

## M0 decision rule
| Condition | Result |
|---|---|
| (1) Analyze Files reads a PDF | PASSED |
| (2) Human task returns a branchable outcome | Branching VERIFIED via mock; live task blocked (170042, category User, 404) |
| (3) Writable target with read-back | PASSED |

Two of three passed fully, third passed via documented mock → proceed with SupplierPulse. Live approval task to be retried in Shared folder / via forum.
