# SupplierPulse — Agent Collaboration Log

Record of decisions, evidence and corrections while building SupplierPulse for the UiPath Maestro Automate Challenge.
Environment: UiPath Studio Web (browser), Community Plan, project built as **Maestro Automate**.
Privacy rule: never paste account names, emails or tokens into this log or into screenshots used for the submission.

---

## 2026-10-24 — Decision 1: probe one capability at a time
- Original plan: give the coding agent one Milestone 0 prompt covering all probes and scaffolding.
- Change: run each probe step by step with guidance, recording evidence before moving on.
- Reason: I'm new to Maestro; I need to verify each capability myself rather than trust generated scaffolding.

## 2026-10-24 — Finding 1: licence
- Community Plan (expires 2027-01-21), Automation Developer named user.
- Forum info conflicted on whether Maestro is available on Community, so access had to be tested, not assumed.

## 2026-10-24 — Finding 2: two "Flow" options
- Studio Web → Create New shows Maestro Orchestrate (Case, Flow, BPMN) and Maestro Automate (Flow).
- Chose Maestro Automate → Flow (matches the challenge name).

## 2026-10-24 — Decision 2: switch "Build as" to Maestro Automate
- The project opened with "Build as: Maestro Orchestrate" by default. Switched to Maestro Automate via the toolbar dropdown.
- Docs: same canvas and nodes, convertible; Automate is for short-running workflows.
- New risk logged: a Human approval pause must work within Automate's runtime limits.

## 2026-10-24 — Finding 3–5: node inventory (Maestro Automate)
- Agent: Autonomous agent; Conversational/Voice (Preview); In this solution; Published; Third-party.
- Human: Quick Form, Action App. (Plan said "Human Task"; actual UI label is Human → Quick Form.)
- Control: Mock, Decision, Switch, Loop, Merge, End, Terminate.
- Data: Batch transform, Filter, Group by, Map, Transform; Data Fabric Create/Query/Update/Delete entity record.
- Tool: Script; Queue tools; Conversational/Voice tools (Preview).
- Connector: generic HTTP Request at top of list. Wait for event: Delay, Connector event, HTTP Webhook.
- Change vs plan: Data Fabric nodes exist → candidate writable store instead of a Script constant.

## 2026-10-24 — Decision 3: run USGS probe before the PDF probe
- Simplest single-node test, to learn Debug and Executions before the agent test.
- Demo event verified in the USGS catalog: us7000m9g4, M7.4, 2024-04-02 23:58:12 UTC, 23.836°N 121.598°E, 40 km.

## 2026-10-24 — Probe 4: USGS
- Browser, eventid query: single GeoJSON Feature. Verified fields: mag, magType, place, time (epoch ms), alert "yellow", mmi 7.99, sig 1420, tsunami 1, status "reviewed", felt, cdi, url. geometry.coordinates = [lon, lat, depthKm] = [121.5976, 23.8356, 40].
- Findings: response is very large (products section); USGS still revises the event (updated = 2026), so tests may only assert stable fields (id, mag, coordinates, time), never felt/updated.
- Decision 4: never pass `products` downstream; exclude impact-text (real casualty/damage text) from agent input so the agent can't claim a supplier was disrupted.
- Decision 5: use the time-window query (starttime/endtime/minmagnitude=7): FeatureCollection, count 1, no products. Normalizer must assert count === 1 and features[0].id === eventId, else fail safely (never a false "all clear").
- In Maestro: HTTP Request (GET) → status 200. Executions viewer displayed a Feature, unlike the browser's FeatureCollection.
- Correction: did not assume either shape; added a Script probe. Result: bodyKind object, topType FeatureCollection, count 1, firstId us7000m9g4 → the viewer was showing features[0].
- Paths confirmed: $vars.httpRequest1.output.body.features[0].properties.* and .geometry.coordinates.

## 2026-10-25 — Probe 3: agent reads the contract PDF
- Created synthetic contract SP-TEST-0417 (fictional parties, marked as test) with non-guessable values so answers can be checked for real reading vs hallucination.
- Wiring: Manual trigger input `contractFile` (type File) → Autonomous agent with Analyze Files tool.
- Decision 6: Analyze Files Attachments mode = Variable bound to the trigger's contractFile (deterministic, auditable), not Prompt (model decides).
- Correction caught before running: leftover default text "the current date?" in the user prompt.
- Added a trap question (late-delivery penalty, absent from the contract).
- Result: 8/8 values correct with section numbers; trap answered NOT FOUND; agent also surfaced the 40% expedite capacity and the 5-business-day trigger unprompted.
- Gap found: output is free-form markdown → plan structured output variables for the validator.
- Observed file input shape: { ID, FullName, MimeType, Metadata.size (string) }.

## 2026-10-25 — Probe 5: Data Fabric write + read-back
- Created entity MitigationRequest (RequestKey, EventId, SupplierId, ActionType, Status, RunInstanceId; all Text).
- Create entity record with fixed test values → returned system Id, CreateTime, UpdateTime.
- Query entity records (single record by Id) → identical record returned.
- Findings: Id is UPPERCASE from create and lowercase from query → compare case-insensitively. Single-record query only filters on unique fields (Id), so RequestKey dedupe needs Multiple records mode or a unique constraint. Node-level Run works (avoids re-running the agent).
- Privacy finding: outputs include RecordOwner/CreatedBy/UpdatedBy with account name and email → audit design must never copy these.

## 2026-10-25 — Probe 6: Human Quick Form
- Outcomes Approve and Reject create two output handles on the canvas. Error handling tab has an "Enable error handling" toggle (adds error handle).
- Schema review: Reject was set to action "End" → design correction: must be "Continue" so rejections still produce an audit record. "Reason" had gone in as a default value, not a label.
- Failure: Quick Form fails ~0.4 s after start, code 170042: "Schema registration failed with status NotFound. Response could not be parsed…". actionCenterTaskLink empty → task never created.
- Ruled out: upstream data (fails in node-only run), missing variable (vars.comments exists), malformed schema (JSON structurally normal).
- Suspect: personal-workspace folder or Action Center setup. Tenant also has a Shared folder.

## 2026-11-07 — Resumed after a 13-day gap
- Retest: full Debug run #9 still fails at Quick Form with the same 170042 (same personal-workspace FolderKey). Upstream nodes all succeed; agent model run cost shown as 0.02 AgenticPool.UnifiedTokens.
- Decision 7: compress plan — feature freeze Nov 21, submit by Nov 28; cut senior-approver tier and extra outcomes; tests 14 → about 8.
- Decision 8: build approve/reject branching on Mock output now so the build continues; keep testing the real task in the Shared folder and via the forum in parallel. Log as "branching verified with mock; live task blocked by platform error 170042" until resolved.

## 2026-11-07 — Mock fallback found and both branches verified
- Double-click node → expanded view; OUTPUT "Live" dropdown → "Static mock".
- Static mock pre-fills the last live output: Error code 404, category "User", message "Failed to register the task schema with Orchestrator" → classified as configuration/setup, not a platform crash.
- Quick Form output shape: output { comments, Action, Error }, status.
- Run A: mock status/Action = Approve → Approve handle → Script 2 → {path:"approved", outcome:"Approve"}. Instance Completed.
- Run B: mock status/Action = Reject → Reject handle → Script 3 → {path:"rejected", outcome:"Reject"}; Script 2 not run. Instance Completed.
- Still open: Quick Form input comments = "Reason" (schema default not yet removed); live task creation (170042).
- Milestone 0 closed. Next: M1/M2 — Supplier entity with 3 fictional suppliers, normalizer, exposure Script, Decision gate.

## 2026-11-07 — M1/M2: supplier data + exposure check
- Created Data Fabric entity Supplier (10 fields; SiteLat/SiteLon Number keep decimals — 24.78 stored correctly, -83 kept its sign).
- Added 3 fictional suppliers: SUP-TW-01 (Hsinchu area), SUP-VN-01, SUP-US-01.
- Query entity records 2 (Multiple records) → output.results[3]. Output includes CreatedBy/UpdatedBy personal data → exposure Script copies business fields only.
- Exposure Script (deterministic): validates USGS count === 1 and id, else throws (no false "all clear"); haversine distance; radius by magnitude (M≥7 → 300 km); days of cover vs lead time; risk score 0–100 (proximity 50, cover shortfall 30, site status 20); requestKey = eventId|supplierId; labels POTENTIALLY_EXPOSED / NOT_EXPOSED only.
- Tested locally against real data shapes (incl. fail-safe case), then in Maestro: run Completed, exposedCount 1, exposedSupplierIds [SUP-TW-01], radius 300 km. Matches expected TW 121.2 km / VN 2145.6 km / US 12476.8 km.

## 2026-11-07 — Decision gate: agent runs only when a supplier is exposed
- Added Decision after Exposure check (script4): condition `$vars.script4.output.exposedCount > 0`. True → Autonomous agent; False → Script "No exposure" returning {result:"NO_ACTION", reason, exposedCount}.
- True test (live data, run #14): Completed in ~42 s; agent ran (3 model calls ≈ 0.01 + 0.01 + 0.02 AgenticPool tokens).
- False test (Exposure check Static mock, exposedCount 0): Completed in ~4 s; "No exposure" returned NO_ACTION; agent not run → no AI cost when nothing is exposed.
- Reminder: Exposure check switched back to Live after the test; Quick Form mock currently Reject (set to Approve for demo runs).

## 2026-11-07 — M3: structured agent outputs
- Added 7 agent output variables: standardLeadDays, expediteDays, expediteSurchargePct, expediteCapUsd (Number); alternateSupplier, recommendedAction (String); confidence (Number). Missing values must be -1 / NOT FOUND.
- Exposure Script now also returns `agentBrief` (plain-text facts) inserted into the agent prompt; system prompt forbids recalculating facts or implying disruption.
- Correction: first run failed (AGENT_RUNTIME.TERMINATION_LLM_RAISED_ERROR, 502) because the new user prompt dropped the contractFile reference. Agent refused rather than inventing values. Re-inserted "Contract file: {contractFile}".
- Run Completed: standardLeadDays 28, expediteDays 12, expediteSurchargePct 17.5, expediteCapUsd 9400, alternateSupplier "Harbor Fiber Works", recommendedAction "expedite", confidence 0.72 — all contract values correct.
- Human review of the agent's reasoning (where I stepped in):
  1. It counted the 9-day consignment buffer as available cover, but that buffer is held at the supplier's own warehouse — the same potentially exposed site. Optimistic assumption.
  2. It omitted the 40% expedite capacity limit (§2), so expediting may not cover the full order.
  3. It cited §2 for the standard lead time; the contract states it in §1.
  → Planned prompt fix: treat on-site buffer as at risk; always report the expedite capacity limit; cite each fact's own section.
- Validator Script (deterministic) written and tested locally on 7 cases: real output → approval; disallowed action, unapproved alternate, cap above USD 10,000 policy, text claiming confirmed disruption, missing expedite clause → manual_review; low confidence → approval_with_warnings.

## 2026-11-07 — Validator false positive (correction round)
- First in-flow validator run: valid=false, route=manual_review, issue "Agent text claims a confirmed disruption".
- Checked the agent text instead of trusting the flag: it said "no confirmed disruption" — a negated phrase. My keyword rule ignored negation → false positive.
- Fix: rule now flags only positive claims ("is disrupted", "confirmed disruption", "disruption has been confirmed") and skips matches preceded by a negation within the same sentence. Re-tested 11 cases locally: real text passes; three positive claims still caught; "without assuming the supplier is disrupted" passes.
- Note on LLM variance: in this run the agent cited §1 correctly and no longer counted the on-site buffer as extra cover, but still omitted the 40% expedite capacity limit → still to be fixed in the prompt.
- In-flow re-run with fixed validator: valid=true, route="approval", issues [], warnings [], daysSaved 16, requestKey us7000m9g4|SUP-TW-01.

## 2026-11-08 — Validation gate: invalid proposals go to manual review
- Added Decision 2 after Validator (script6): `$vars.script6.output.valid===true`. True → Create entity record; False → Script "Manual review" returning {result:"MANUAL_REVIEW", reason, requestKey, issues, warnings}.
- False test (Validator Static mock valid=false): run Completed; Manual review returned MANUAL_REVIEW with the mock issue; no request record created.
- Validator switched back to Live after the test.
- Design gap spotted for next session: the request record is currently created BEFORE human approval. Correct order: Validator → Quick Form approval → (Approve) create request + read-back → audit; (Reject) audit only.

## 2026-11-08 — Agent worked directly in Studio Web (via Claude in Chrome)
- Took the edit lock after the user closed their own Studio tab.
- Correction of the earlier ordering gap: rewired so a request is only created AFTER approval.
  Removed edges: Decision 2 True → Create entity record; Query entity records → Quick Form; Quick Form Approve → Script 2.
  Added edges: Decision 2 True → Quick Form; Quick Form Approve → Create entity record; Query entity records → Script 2.
  Quick Form Reject → Script 3 and Decision 2 False → Manual review (script7) unchanged.
- Slip and recovery: one Delete keypress removed the Script 3 node instead of an edge (the edge ran underneath the node). Undone immediately; node and its Reject edge restored and verified in the edge list. Afterwards I moved Script 3 aside and confirmed each edge selection with a zoomed screenshot before deleting.
- Verified run #22: … Validator → Decision 2 → Quick Form (mock Approve) → Create entity record → Query entity records → Script 2. Successful.
- Create entity record now uses real values instead of probe constants:
  ActionType = $vars.script6.output.recommendedAction; EventId = $vars.script4.output.event.eventId;
  RequestKey = $vars.script6.output.requestKey; RunInstanceId = $metadata.InstanceId;
  SupplierId = $vars.script6.output.supplierId; Status = "requested" (fixed).
- Verified run #23: record created with ActionType "expedite", EventId "us7000m9g4", RequestKey "us7000m9g4|SUP-TW-01", RunInstanceId = the run's own instance id; read-back query returned the same record (matching CreateTime).

## 2026-11-08 — Duplicate check (agent via browser)
- Removed edge Decision 2 True → Quick Form (verified selection with zoom before deleting).
- Added on Decision 2 True: Query entity records 3 (MitigationRequest, Multiple records, filter RequestKey Equals $vars.script6.output.requestKey).
- Added Decision 3: `($vars.queryEntityRecords3.output.results || []).length === 0`; branch labels "New request" → Quick Form, "Duplicate" → Script "Duplicate skipped" returning {result:"DUPLICATE_SKIPPED", reason, requestKey, existingCount}.
- Checked the "New request" edge really starts at the top handle with a zoomed canvas view (first zoom was ambiguous).
- Verified run #24: Validator → Decision 2 → Query entity records 3 (1 existing record from run #23) → Decision 3 → Duplicate skipped. Quick Form and Create entity record did not run → no second request for the same event+supplier. Successful.
- Demo note: delete existing MitigationRequest rows for us7000m9g4|SUP-TW-01 before recording, so the first run creates a request and a second run shows the duplicate being skipped.

## 2026-11-08/09 — Audit trail on every terminal path (agent via browser)
- New tenant-level Data Fabric entity AuditLog (RunInstanceId, EventId, Outcome, RequestKey, Detail — Text, max 200).
- Added a "Create entity record → AuditLog" node after each end of the flow (no other data in the record; CreatedBy/UpdatedBy are not copied anywhere):
  | Node | After | Outcome | Detail | RequestKey |
  |---|---|---|---|---|
  | Audit duplicate (createEntityRecord2) | Duplicate skipped | DUPLICATE_SKIPPED | script8 reason | script8 requestKey |
  | Audit approved (createEntityRecord3) | Script 2 | APPROVED_REQUEST_CREATED | "Request <Id> read back; action <ActionType>" from the read-back query | read-back RequestKey |
  | Audit rejected (createEntityRecord4) | Script 3 | REJECTED | "Rejected by approver: " + Quick Form comments (or "no reason given") | script6 requestKey |
  | Audit no exposure (createEntityRecord5) | No exposure | NO_EXPOSURE | script5 reason | eventId + "\|none" |
  | Audit manual review (createEntityRecord6) | Manual review (Script 7) | MANUAL_REVIEW | JSON of issues, cut to 200 chars | script7 requestKey |
  All five use EventId = $vars.script4.output.event.eventId and RunInstanceId = $metadata.InstanceId.
- Verified run #25: … Duplicate skipped → Audit duplicate → AuditLog record created.
- Verified run #26 (Exposure check Static mock, exposedCount 0, eventId us7000m9g4): Decision → No exposure → Audit no exposure → AuditLog record with Outcome NO_EXPOSURE, RequestKey "us7000m9g4|none", EventId "us7000m9g4", Detail = the no-exposure reason, RunInstanceId = run #26 instance id. Agent did not run (5.2 s). Mock switched back to Live afterwards.

### Slip and recovery (my mistake)
- While editing a field, the cursor was not inside the editor, so my Ctrl+A / Delete selected and deleted the whole canvas. I clicked Undo straight away: all 23 nodes and all edges came back (checked by listing every edge label).
- Undo did NOT bring back three settings. Found them because run #27 failed in the agent ("Invalid attachment id", 170002):
  1. Manual trigger input argument contractFile (File) was gone → re-added with the same name and type.
  2. Agent user prompt "Contract file:" pointed at $vars.manualTrigger1.output instead of …output.contractFile → re-inserted the contractFile variable.
  3. Analyze Files Attachments binding was empty → set to Variable $vars.manualTrigger1.output.contractFile.
  The Debug configuration then lost its stored PDF → re-uploaded SP-TEST-0417_contract.pdf.
- Lesson applied from here on: click inside the field and check the selection with a zoom before any Ctrl+A; after any Undo, check node settings, not only the node/edge list.
- Runs #28 and #29 (manual-review test with Validator mock) were stopped by me: #28 paused at the trigger before the file was re-bound; #29 hung in the agent for more than 5 minutes with no LLM span. Validator mock switched back to Live.
- Verified run #30 (all Live, after the repairs): Trigger → HTTP → Script → Supplier query → Exposure check → Decision → Agent (LLM + Analyze Files) → Validator → Decision 2 → Query entity records 3 → Decision 3 → Duplicate skipped → Audit duplicate. Successful, 32.9 s. Confirms the trigger/agent repair.
- Health analyzer shows 15 warnings of the form "'$vars.scriptN.output' is possibly 'null'" on nodes that read script outputs. They are type hints, not errors: runs #25, #26 and #30 succeeded with the same expressions.
- Not yet run-tested: Audit approved, Audit rejected (both blocked by the duplicate check until the existing MitigationRequest rows for us7000m9g4|SUP-TW-01 are deleted, and by the live Quick Form error 170042), Audit manual review (run #29 hung).

## 2026-11-09 — Approve/Reject test attempt, live manual-review path, Validator fix
- User asked me to delete the existing request row(s) and run the Approve/Reject tests.
- Data Fabric → MitigationRequest has 13 rows. Only ONE has the exact key us7000m9g4|SUP-TW-01 (Id C518788A…, Status "requested"); the other 12 are old "TEST|…" probe rows that the duplicate check (RequestKey Equals) does not match. (My earlier message said "two rows" — that was wrong.)
- I selected only that one row, but the Delete click was blocked by the session's safety check. I did not try to get around it. Nothing was deleted.
- Fallback tried: Static mock on Query entity records 3 with results []. Did NOT work — run #32 still went to Duplicate skipped, because Decision 3 re-queries Data Fabric itself (the query output is a "LIVE QUERY" reference), so the mock is ignored. Mock switched back to Live.
- Found during this: Quick Form output was Live again (the Static mock was lost in the canvas wipe/undo on 11-08). Set it back to Static mock, currently Action/status "Reject" with comment "TEST MOCK: surcharge too high this quarter". The live task still fails with 170042, so keep the mock.
- Verified run #31 (all Live except Quick Form mock): the live Validator sent the run to manual review → Script 7 → Audit manual review → AuditLog record (Outcome MANUAL_REVIEW, Detail = the issue). Real live test of the manual-review audit.
- The reason was a false positive: agent text said "…premature absent confirmed disruption." "absent" was not in the negation list.
  Fix (local validator.js and flow Validator, same single line): NEGATION now also includes absent, absence of, lacking, pending, until, unless. Re-ran local tests: all 11 earlier cases unchanged; new cases "absent/pending/until confirmed disruption" pass; positive claims still flagged. Change confirmed saved on the node after closing and reopening it.
- Verified run #32: same live agent → Validator passed (valid) → Decision 2 True → dedupe → Duplicate skipped → Audit duplicate.
- Also seen in run #31: the agent now states the 40% expedite capacity limit (§2) and cites §1 for lead time — the earlier omission did not recur this time (LLM variance; prompt fix still planned).
- Still not tested: Audit approved, Audit rejected. Blocked only by row C518788A. Once that row is removed, one Debug run with the current Reject mock tests the reject path; then switch the Quick Form mock to Approve and run again to test approve (that run creates a new request row).

## 2026-11-09 (evening) — Finishing the build (user: "do everything by yourself")
- Deleted MitigationRequest row C518788A (the only row with key us7000m9g4|SUP-TW-01) after the user re-approved it. The 12 old TEST|… probe rows were left untouched.
- Verified run #33: Quick Form mock Reject → Rejected result → Audit REJECTED, Detail "Rejected by approver: TEST MOCK: surcharge too high this quarter".
- Verified run #34: Quick Form mock Approve → Create request (A2F35CE3…) → Read back → Approved result → Audit APPROVED_REQUEST_CREATED. All six end paths now have live audit evidence.
- Error handling:
  - HTTP Request: retry count 2, timeout PT1M, error handle on.
  - Error handles on Exposure check and Contract analyst agent.
  - All three error handles → new Script "Escalate failure" (script9) → new "Audit escalation" (AuditLog, Outcome ESCALATED_ERROR, RequestKey us7000m9g4|error).
  - Checked the handle types in the edge ids: "httpRequest1-error", "script4error", "autonomousAgent1error".
- Verified runs #35/#36 (HTTP mocked to 0 events): Exposure check error → BoundaryEvent → Escalate failure → Audit escalation. #36 reason: "USGS response invalid: expected exactly 1 event, got 0" (script now prefers error.detail over the generic message). HTTP set back to Live.
- Prompt fix (system prompt, 2 lines added): always report the expedite capacity limit and cite each fact's section; stock held at the supplier's own site is at the same risk, do not count it as safe cover. Verified run #37: agent cited §1, stated the 40% limit (§2), excluded the on-site buffer; Validator passed.
- Quick Form definition fixed: Reject outcome action End → Continue (so live rejects reach the audit); comment no longer pre-filled with "Reason"; title "SupplierPulse mitigation approval". Approve/Reject edges unchanged (checked).
- Renamed generic nodes for readability (display names only; node ids and expressions unchanged): Parse USGS response, Load suppliers, Any supplier exposed?, Contract analyst agent, Proposal valid?, Find existing request, Already requested?, Planner approval, Read back request, Create request, Approved result, Rejected result, Manual review.
- Slip: on the canvas (side panel closed) a Ctrl+A selected all nodes. Nothing was typed or deleted; selection cleared and the edge count re-checked (26 at the time). From then on, renames were done only inside the expanded node view.
- Regression run #38 after all changes: full live path → Duplicate skipped → Audit duplicate. Successful, 46 s.
- Final state: 27 nodes, 28 edges. HTTP / Exposure check / Validator / Find existing request are Live. Quick Form uses a Static mock (Approve) because the live task fails with 170042.
- Solution downloaded from Studio Web (Explorer → SupplierPulse → Download) to the user's browser downloads.
- Submission package built: SUBMISSION.md (form answers), TEST_SCENARIOS.md, architecture.png, screens/, SupplierPulse_demo.mp4 (captioned walkthrough of real run screens).
- Known behaviour noted: the Validator matches the alternate supplier exactly ("harbor fiber works"). A longer name such as "Harbor Fiber Works, Penang" would go to manual review if the agent ever recommends alt_source. That is safe-fail, but could be relaxed to startsWith.

## 2026-11-09 (late) — Colleague review → business impact, option comparison, live exception
Review asked for: business impact, option comparison with clauses and uncertainty, visible decision points, a live exception scenario, measurable value, one end-to-end demo story, and a clear split between geographic exposure and confirmed disruption.
- New deterministic node **Business impact & options** (script10). Inserted on the edge Validator → Proposal valid? with the edge's "+" control, so no edge was deleted.
  - Computes units short, PO value, USD at risk (line-stop cost/day × shortfall days), and expedite / alt_source / buffer_stock / monitor with cost, arrival day, residual shortfall and residual risk.
  - Also returns the lowest total-cost option, whether the agent picked it, net benefit, time saved (assumption: 180 min manual), and **disruptionStatus**, kept separate from geographic exposure.
  - The PO book (PO-TEST-4417, 6,000 units × USD 9, 7,000 units/week, USD 12,000/day line-stop cost, 14-day alternate lead time) is fictional demo data held in the script and labelled as such.
  - Local test (scripts/test_impact.js) passes.
  - Fixed one editor type error (`row.DailyUsage` on a `|| {}` fallback).
  - Error handle on → Escalate failure, which now names "Business impact calculation".
- Audit approved Detail now includes the value at risk and the net benefit.
- Agent system prompt: added an "Options compared" part (clause, time until stock arrives, cost limit, main uncertainty for each option, why the recommendation wins, what would change it), up to 180 words.
- Validator:
  - The language guard now treats if / once / whether / should as conditions, so "switch if disruption is confirmed" is not flagged.
  - Alternate supplier matching accepts the approved name followed by a location ("Harbor Fiber Works, Penang"); other names are still blocked.
  - Local tests pass.
- Verified run #39 (all live except the form mock):
  - Agent "Options compared" cites Sec.2/5/6 with uncertainties and says site damage or an expedite-capacity refusal would shift the decision to alt_source.
  - Business impact: 16 d / 2,400 units, USD 192,000 at risk, expedite USD 9,400 with residual 0, lowest-cost option = expedite = agent choice, net benefit USD 182,600, disruption UNCONFIRMED.
  - Validator passed; run ended at Duplicate skipped (a request already exists from run #34).
- Verified run #40 (exception): agent mocked to recommend alt_source "Acme Pulp Co." → Validator issue "Alternate supplier not on approved list" → Manual review → Audit manual review. No request created. Agent set back to Live.
- Flow now: 28 nodes, 30 edges. Updated solution downloaded again from Studio Web (Explorer → SupplierPulse → Download).
- Submission re-cut: SUBMISSION.md leads with the business story and numbers; TEST_SCENARIOS rows 14–16; new screens 08–10; architecture diagram with the impact step; demo video re-cut (2:03) around one end-to-end scenario plus the exception and failure cases.

## 2026-11-10 — Flow outputs, evaluations and model comparison (all inside Studio Web)
User direction: "we do everything in uipath only". No external site or tool was used for this work.
- **End nodes:** six End nodes were added, one after each audit step: End: approved / rejected / duplicate / manual review / no exposure / escalated.
  - Each End node maps the 7 flow output variables: outcome, recommendedAction, alternateSupplier, disruptionStatus, expediteDays, expediteCapUsd, valueAtRiskUsd.
  - No-exposure and escalation endings return empty strings and 0 because the agent never ran on those paths.
  - Regression run #41 succeeded (duplicate path). Outputs: DUPLICATE_SKIPPED, expedite, Harbor Fiber Works, UNCONFIRMED, 12, 9400, 192000.
- **Evaluation dataset** "Contract analyst agent dataset" (target: Contract analyst agent node):
  - 0417 baseline, captured from run #41 with "Add to evaluations".
  - 0418 variant: new synthetic contract with 35 d lead time, 15 d expedite at 12%, USD 6,000 cap, alternate Northbay Paper Mills.
  - 0419 trap: contract with no expedite clause, so the expected action is alt_source and expedite values are -1, following the prompt's "not stated = -1" rule.
  - The variant PDFs come from scripts/make_variant_contracts.py and are fictional.
  - Each data point's agentBrief was edited to name its own contract and lead time.
  - The Analyze Files static mock was removed, so every case reads its PDF live.
- **Evaluators:**
  - Four Exact Match checks: expediteCapUsd, expediteDays, alternateSupplier, recommendedAction.
  - One LLM judge, "Contract reasoning rubric judge", with a 7-item, 100-point rubric:
    - facts and sections
    - capacity limit
    - on-site buffer not counted
    - options compared
    - no confirmed-disruption claim
    - no invented terms
    - why the option wins and what would change it
  - The judge model is Claude Opus 4.8, which is not one of the models being compared.
  - The default evaluators were switched off for this dataset.
- **Findings from evaluation:**
  - Eval run 1 showed the agent returning "Harbor Fiber Works (fictional), Penang, Malaysia". Prompt v2 adds a rule that alternateSupplier is the company name only.
  - My first 0419 expectations used 0, but the prompt specifies -1 for values that are not stated. The model was right and the dataset was corrected.
  - Judge v1 hard-coded the 0417 facts, which unfairly penalised the variant contracts. Judge v2 scores facts against each data point's ExpectedOutput, and all three models were re-run with it.
- **Model comparison**, 3 contracts each, same prompt v2 and judge v2 (Eval runs 5–7):

| Model | Cap | Days | Alternate | Action | Reasoning judge | Duration |
|---|---|---|---|---|---|---|
| Claude Sonnet 5 (Standard) | 100% | 100% | 100% | 100% | 97% | 44.9 s |
| Claude Opus 5 (Premium) | 100% | 100% | 100% | 100% | 99% | 55.8 s |
| GPT-5.6 Terra (Standard) | 100% | 100% | 33% | 100% | 93% | 47.2 s |

  - GPT-5.6 Terra kept "(fictional)" in the supplier name despite the rule.
  - **Decision:** keep Claude Sonnet 5. It ties Opus 5 on every exact check and is within 2 points on reasoning. With one run of 3 cases, that gap is within run-to-run noise. Sonnet 5 is also Standard tier and faster.
  - Studio Web shows an "Out of region (US)" badge on Sonnet 5, which matters if data residency is required; Opus 5 has no such badge.
- Screenshot: submission/screens/11_eval_runs_model_comparison.jpg.

## 2026-11-10 (evening) — Newest models and UiPath's newest agent feature, tested by evaluation
- Checked the UiPath Agents release notes for Aug–Oct 2026.
  - New models: gemini-3.5-flash (Aug 7).
  - New features: Advanced agents / Advanced harness (Preview, Sep 22; 50% off during preview), runtime evaluations (Preview, Oct 20), Autopilot agent review (Preview, Oct 8), LLM-as-Judge guardrail (Preview, Sep 7).
- Newest models in this tenant's agent dropdown: Gemini 3.7 Flash, Gemini 3.1 Pro Preview, GPT-5.6 Luna/Sol/Terra. No GPT-6 or Claude 5.5 models are offered.
- Same dataset, prompt v2 and judge v2:

| Eval run | Model / harness | Cap | Days | Action | Alternate | Judge | Duration |
|---|---|---|---|---|---|---|---|
| 8 | Gemini 3.7 Flash | 100% | 100% | 100% | 100% | 82% | 100.9 s |
| 9 | Gemini 3.1 Pro Preview | 100% | 100% | 100% | 100% | 84% | 87.4 s (1 of 3 cases errored) |
| 10 | Claude Sonnet 5 + Advanced harness (Preview) | 100% | 100% | 100% | 100% | 99% | 52.3 s |

- **Decision:** Claude Sonnet 5 with the Advanced harness. It ties Opus 5 on the judge (99%) at Standard tier, and advanced usage is 50% off during the preview.
- Debug regression run #42 with the Advanced harness: successful, 48.4 s, DUPLICATE_SKIPPED, expedite, Harbor Fiber Works.

## 2026-11-10 (evening) — Planner front end, approval retest
- Studio Web "App" (RPA app) and "Action app" projects need UiPath Assistant on the user's machine to edit ("Install UiPath Robot to continue"). A "Coded app" needs `uip codedapp push` from an IDE, and this cloud workspace cannot reach cloud.uipath.com (proxy 403).
  - Two empty placeholder projects ("App", "App 1") were created in the SupplierPulse solution during this check. They are left in place; deleting them is the user's call.
- Built the front end in the browser-based **UiPath Apps** service instead: "SupplierPulse Planner Console" (VB app).
  - Header and subtitle in orange (#FA4616 / #C2410C) on a warm white page.
  - Table bound to Data Fabric **AuditLog**, sorted by CreateTime descending: every run's outcome, detail, event and request key.
  - Table bound to **Supplier**, showing the monitored sites, stock, lead time and site status.
  - Verified in Preview with live rows (DUPLICATE_SKIPPED ×2, MANUAL_REVIEW "Alternate supplier not on approved list: Acme Pulp Co.", 3 suppliers). Screenshot: screens/12_planner_console_app.jpg.
  - Not published: publishing needs the user's go-ahead.
  - The MitigationRequest entity is not listed at tenant level in Apps (only AuditLog, Supplier, SystemUser), so request details are shown through AuditLog.
- Live approval retest (single step "Planner approval", 17:32): still Orchestrator 170042 "Schema registration failed with status NotFound". The Static mock stays; the limitation is documented.

## 2026-11-10 (evening) — Improvement 1, step A: scheduled USGS trigger
- Added the Scheduled trigger "Every 15 min: USGS check" (cron `0 0/15 * * * ? *`; input lookbackMinutes = 15, informational) and connected it to HTTP Request. The Manual trigger stays for the demo.
- HTTP Request URL is now an expression:
  - Manual run (contract file present): the fixed demo query for us7000m9g4.
  - Scheduled run: the USGS query for M6+ events in the last 15 minutes, ordered by magnitude.
- Exposure check: in a manual run it still requires exactly 1 event with the demo id (escalation behaviour unchanged). In a scheduled run it accepts 1 or more events and uses the strongest.
- New Decision "New M6+ event?" (count > 0, or a manual run) between Parse USGS response and Load suppliers. No new event → "End: no new event" (outcome NO_NEW_EVENT). No audit row, so there is no audit spam every 15 minutes.
- Debug packing failed (run #44) because of the two empty app projects created earlier ("App 1" coded app has no build). With the user's go-ahead, both empty projects were deleted.
- Verified:
  - Run #45 (Debug from the Scheduled trigger, live USGS): no M6+ event in the window → End: no new event, 8 s.
  - Run #46 (Manual demo regression): End: duplicate, 45 s. The demo path is unchanged.
- Note: the Scheduled trigger fires on its own only after the flow is deployed. Deploy is waiting for the user's OK.
- Found: MitigationRequest is a solution-scoped entity, which is why the tenant-level Apps entity picker did not list it.

## 2026-11-10 ~19:30 IST — Improvement 1, step B (partial; stopped by the usage limit)
- Supplier.ContractText (Multi-line Text) added and filled for 3 suppliers (verified after reload).
- Exposure check returns primarySupplierId / primaryContractRef / primaryContractText.
- "Create file" node inserted before the agent; file name expression set. Content is NOT yet set, so the flow currently has a validation error until it is completed (see STATUS.md).

## 2026-11-11 15:30 IST — Improvement 1, step B finished (VERIFIED)
- Create file node removed: it needs an Orchestrator connection (an OAuth grant), which I did not create. Contract text is passed in the agent prompt instead (`$vars.script4.output.contractTextForAgent`, empty on manual runs).
- Load suppliers returned no ContractText even after "Refresh schema". Cause: the node keeps the field list from when the entity was picked. Fix: re-select the entity (AuditLog, then Supplier). Verified by a node run (ContractText 1706 / 1648 / 1638 chars). A temporary ContractClauses field was added during diagnosis and deleted again.
- Scheduled run, first try (HTTP Static mock): FAILED at agent startup, AGENT_STARTUP.INPUT_VALIDATION_ERROR (analyzeFiles1 attachment bound to a null file). The flow routed it to End: escalated as designed.
- Fix 1: Analyze Files Attachments → Prompt mode. Second try: FAILED, AGENT_RUNTIME.TERMINATION_MAX_ITERATIONS (the system prompt still told the agent to always use Analyze Files).
- Fix 2: system prompt line 2 and user task 1 now say: use Analyze Files only when a file is attached, otherwise read the contract text.
- Scheduled run, third try: SUCCESS, 27 s. Agent values from the text: expediteDays 12, cap USD 9,400, alternate Harbor Fiber Works (match SP-TEST-0417). Ended at End: manual review: the Validator flagged "confirmed disruption" (a negated mention in the agent text). Conservative guardrail, left as is. This run wrote one MANUAL_REVIEW row to AuditLog.
- HTTP Request reverted to Live. Manual regression: SUCCESS, 37 s, End: duplicate (DUPLICATE_SKIPPED), Analyze_Files tool call in the trace, same values.
- Next: eval re-run (agent prompt and tool binding changed), then docs (step D).

## 2026-11-11 16:20 IST — Validator fix + Step C (multi-supplier loop), VERIFIED
User approved: validator fix, step C, deploy + publish, then final deck, docs and a debugging video.
- Validator: the negation list now includes doesn't/don't/didn't/won't/aren't/require(s)/need(s)/awaiting/before, and curly apostrophes are normalised. It now checks the primary (highest-risk) supplier. Unit tests (scripts/test_validator.js) pass, including the exact phrase from the false positive.
- Exposure check: agentBrief covers only the primary supplier; new otherExposed[] lists every other exposed supplier with its brief and contract text from Data Fabric.
- Step C: Loop "Each other exposed supplier" over otherExposed, inserted before the main agent. Body: Contract analyst (other supplier) agent (text only; error handle routed to the check) → Check other proposal (policy + language guard, scripts/other_supplier_check.js, 6 local tests pass) → Audit other supplier (AuditLog, outcome PROPOSAL_FOR_REVIEW or MANUAL_REVIEW).
- Findings: copy/paste of nodes did not work in this browser, so the body was built new. Agent output names that match flow output names (expediteDays, ...) are rejected, so the loop agent uses its own names. A Static mock on "Load suppliers" is bypassed because Exposure check runs its own live query; the test mocked Exposure check instead.
- Test (Exposure check mocked so SUP-VN-01 is 96 km away): loop ran 1 iteration (18.5 s). Loop agent: lead 21, expedite 10, 15%, cap 7,500, Harbor Fiber Works, proposed monitor (40 d cover vs 21 d lead), confidence 0.85 → PROPOSAL_FOR_REVIEW, AuditLog row written. Main path: End: duplicate. Mock removed.
- Live regression: manual End: duplicate (36.8 s); scheduled End: no new event (3.1 s).
- Eval run 12: facts 100% on all rows; judge 98% / 85%; judge errored on one row (evaluator exception).

## 2026-11-11 16:17–17:30 IST — Deploy, publish, schedule, video, final docs
- Deploy (user-approved): SupplierPulse v1.0.0 → Shared/SupplierPulse, Active (screens/13). VERIFIED.
- Planner Console (user-approved): published v1.0.0 in App Studio, then "Deploy app" in Orchestrator to Shared; the production app shows AuditLog rows including the loop's PROPOSAL_FOR_REVIEW row (screens/14). VERIFIED.
- Schedule: at ≈16:30 IST Orchestrator ran a job from Flow_TimeTrigger without anyone starting it: Successful, 6.02 s (screens/15). VERIFIED. CAPABILITIES row 46 changed from NOT TESTED to VERIFIED.
- Manual run #50 (16:32): validator valid = true, route approval (the "doesn't require confirmed disruption" false positive is gone), End: duplicate, 45.7 s.
- Debugging video: 20 captioned scenes from real screenshots, 2:27, no voice (video/). Narration script for the user's voice-over: NARRATION_SCRIPT.md.
- Node count re-checked on the canvas after fit-view: 41 nodes (incl. the Analyze Files tool node and the 4 loop nodes), 7 End nodes. The video caption said 37 (pre-loop count); corrected and that scene re-rendered.
- Final docs: deck 18 slides (new: loop + triggers, deployed + schedule), TEST_SCENARIOS rows 27–33, CAPABILITIES rows 51–56, SUBMISSION/README updated, zip rebuilt.
- Not synced: scripts/exposure.js is the version before `otherExposed` was added; the live code is in the flow's Exposure check node (solution file).

## 2026-11-11 18:00–18:30 IST — Review feedback: coding-agent slide, money wording, harder evals
- An outside review (ChatGPT, shared by the user) asked for: a coding-agent story in the deck, clearer money figures, a larger evaluation set, live approval, and a narrated FaceCam video.
- Deck: new slide "Built with a coding agent: mistakes and fixes" (six logged iterations); USD 192,000 now described as modelled exposure = 16 days × assumed USD 12,000/day line-stop cost (the review guessed USD 80/unit; the script uses a per-day cost); ERP data path added to next steps.
- Evaluations: 4 new synthetic contracts (scripts/make_variant_contracts.py + a scanned copy of 0417). Eval run 13 (7 contracts): the agent used an EXPIRED expedite clause in 0425 (expedite 12 d instead of -1, action expedite instead of alt_source). Real bug.
- Fix: one sentence added to the main agent's system prompt after "Never guess.": "Use only terms in force today: if a clause has expired or was replaced by an amendment, ignore the old terms (an expired expedite option means expedite values are -1)."
- Eval run 14: 28/28 exact checks pass (100% on all 7); judge 75–98%, one judge error on 0418 (evaluator side).
- Not done yet: the deployed v1.0.0 does not have this prompt change (needs a redeploy, user's call). The loop agent's prompt was not changed.
- Live approval test: needs the existing MitigationRequest row us7000m9g4|SUP-TW-01 removed first; asked the user to delete it (I do not delete tenant data).
- Presenter video (5:29, silent, FaceCam corner) + PRESENTER_SCRIPT.md built from video/presenter_scenes.py.

## 2026-11-11 18:25–18:45 IST — Debug, redeploy 1.0.1, live approval test
- User deleted the MitigationRequest row us7000m9g4|SUP-TW-01 and asked: debug, redeploy, make it submission ready.
- Debug run (manual trigger, contract PDF): Planner approval mock switched from Approve to Reject first, so the Debug run would not re-create the request row before the production test. Result: REJECTED, 52.9 s, agent values unchanged (12 d, USD 9,400, Harbor Fiber Works, expedite). Confirms the new prompt rule does not change the baseline.
- Planner approval switched from Static mock to Live (production should never auto-approve), then Pack and upgrade 1.0.0 → 1.0.1 with release notes. Deployment successful, Active.
- Production job (Orchestrator, Manual trigger + SP-TEST-0417): reached Planner approval and FAULTED with 170042 "Failed to register the task schema with Orchestrator ... NotFound". So the error is not limited to the personal workspace; it is a tenant-level issue.
- Tried to route this failure to Escalate failure: enabled error handling on the Quick Form and wired the Error handle. The health check then reported an error ("A connection from this form points to an outcome that has been deleted. Remove it.") and Debug/Deploy were disabled. Undone (edge, toggle and a matching Escalate-failure script change), health check back to 6 warnings, Studio matches v1.0.1 again.
- State now: v1.0.1 deployed with live approval. On this tenant a run that reaches approval faults (visible as an incident in Maestro); scheduled runs with no new event are unaffected. In Studio, Planner approval is Live too, so a Debug run that reaches approval will also fault; switch it to the Static mock for demos.
