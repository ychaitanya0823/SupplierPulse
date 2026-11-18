# SupplierPulse — answers for the submission form

Copy each block into the matching field. Keep this file: the form can't be opened again after approval.

---

**Full name:** [your full name]

**Team name:** leave empty (solo entry)

**Team members:** leave empty (solo entry)

**Coding agent you built it with:** Other coding agent (Claude by Anthropic, working in Studio Web through the Claude in Chrome extension)

**Industry (up to 2):** Manufacturing · Logistic

**Complexity level:** Advanced

---

**Summary**

SupplierPulse is a Maestro Automate flow that turns a real earthquake into a costed, contract-backed decision in about 40 seconds, with a human in control. It reads the live USGS feed every 15 minutes, finds which suppliers are geographically exposed, has an AI agent read each exposed supplier's contract, checks the proposal against policy, works out the money at risk and the best option, and asks a planner to approve before anything is created. Every outcome is written to an audit log in Data Fabric and shown in a Planner Console app. It is deployed and its schedule has run on its own hundreds of times.

---

**The problem you are solving**

When a large earthquake strikes near a supplier, a supply-chain planner has to answer four questions fast: which suppliers are near it, how long our stock lasts, what the contract allows (expedite, alternate source, notice periods), and what acting is worth. By hand this takes hours per supplier, and it invites costly mistakes: treating "near the quake" as "disrupted", counting buffer stock that sits in the quake zone, and committing spend before anyone approves.

In the demo (real USGS event: M7.4 Hualien, Taiwan, 2 April 2024; fictional suppliers and contracts), one supplier is 121 km away with 12 days of stock against a 28-day lead time: a 16-day shortfall and about USD 192,000 of modelled line-stop exposure (16 days × an assumed USD 12,000 per day). Expediting under the contract costs at most USD 9,400, so the modelled net benefit is USD 182,600. SupplierPulse works this out in about 40 seconds.

---

**How your workflow works**

One Maestro Automate flow (41 nodes, 2 triggers, a loop, 7 End nodes with typed outputs):

1. **Triggers:** a time trigger every 15 minutes, or a manual run where the planner attaches a contract PDF.
2. **HTTP Request** reads the USGS earthquake API (retry and timeout). No new M6+ event → the flow ends quietly in about 5 seconds.
3. **Exposure check (code):** distance, magnitude radius, days of cover against lead time, risk score. Suppliers are labelled "potentially exposed", never "disrupted". Nobody in range → audited NO_EXPOSURE, no AI cost.
4. **Loop:** every exposed supplier other than the riskiest gets its own contract agent, a policy check and an audit row for review.
5. **Contract analyst agent (Claude Sonnet 5, Analyze Files):** reads the contract and returns 7 typed values (lead time, expedite days, surcharge, cost cap, alternate supplier, recommended action, confidence), with cited clauses and an options comparison.
6. **Validator (code):** allowed actions only, expedite cap ≤ USD 10,000, pre-approved alternates only, and a guard that blocks any claim of confirmed disruption. Fails → manual review, audited with reasons.
7. **Business impact (code):** units short, money at risk, cost and residual risk of each option, net benefit.
8. **Dedupe:** if a request already exists for this event and supplier, it is skipped.
9. **Planner approval (human task):** approve or reject with a comment. Only after approval is the request created in Data Fabric and read back to verify it.
10. **Errors:** failures in the HTTP call, exposure check, agent or impact step go to an Escalate path that creates nothing and writes an ESCALATED_ERROR audit row.

Every ending writes one audit row (approved, rejected, duplicate, manual review, no exposure, escalated, plus loop proposals). A published UiPath Apps "Planner Console" shows the audit log and suppliers live.

---

**How you built it with your coding agent**

I worked as the lead and Claude (Anthropic) was my coding agent. I chose the problem, set the rules and made every decision; the agent did the hands-on building in Studio Web through the Claude in Chrome extension, and I checked each result before we moved on. Every step is logged in AGENT_LOG.md.

How I worked with it:
1. **I set the ground rules.** Everything is built in UiPath only. Work one step at a time. Nothing counts as working without a run that proves it (VERIFIED / FAILED / NOT TESTED). No deploy or publish without my approval. No invented features or API fields.
2. **I designed the process.** I defined the flow: real USGS data, rules-based exposure, AI only for reading the contract, policy checks in code, and a human approval before anything is created. I asked the agent to start with a "Milestone 0" that tested each Studio capability before building.
3. **The agent built, I reviewed.** It built the canvas, the contract agent, the Data Fabric entities and the Planner Console app, and wrote and unit-tested the exposure, validator and business-impact scripts. I reviewed each step in Studio and in the run traces.
4. **I pushed it further.** After a colleague's review I added business impact and an option comparison. I asked for a scheduled trigger, a loop over every exposed supplier, a harder evaluation set and a model comparison. I chose the model from the evaluation results and approved each deploy.

What went wrong, and how we fixed it:
- The first design created the request before approval → I had it reordered: approve, then create, read back, audit.
- A mis-focused Ctrl+A / Delete wiped the canvas; undo restored the nodes but not three settings → we found them from a failed run and repaired them.
- The safety check flagged harmless phrases like "doesn't require confirmed disruption" → made negation-aware, with 15 unit tests.
- On scheduled runs the agent kept looking for a PDF that wasn't there → prompt fixed.
- Rejections were not audited → the form now continues to an audit row.
- My harder evaluation set found the agent using an expired contract clause → one prompt rule fixed it, and all 28 checks now pass.

The full story, including every mistake and the run that proved each fix, is in AGENT_LOG.md and slide 14 of the deck.

---

**How you tested it**

- **Unit tests (Node):** exposure maths, validator (15 cases), business impact, loop policy check (6 cases).
- **50+ Debug runs** covering every path: approved, rejected, duplicate, manual review, no exposure, escalated error, scheduled run with no event, and a second exposed supplier in the loop. Static mocks on single nodes simulated conditions you can't wait for. 39 scenarios are documented with the run that proves each one.
- **Agent evaluations in Studio Web:** 7 test contracts, including a trap with no expedite clause, an amendment that overrides a clause, a scanned image-only PDF, and an expired clause. 4 exact-match checks plus an LLM-judge rubric. Run 13 found a real bug: the agent used an expired clause. One prompt rule fixed it, and run 14 passed all 28 exact checks.
- **Model choice by evidence:** 6 setups compared on the same dataset; Claude Sonnet 5 on the Advanced harness scored 99% on reasoning at standard cost.
- **Production:** deployed v1.0.1; the 15-minute schedule has run 675 jobs on its own, all successful.

Known limit: on my Community tenant the live approval task fails with Orchestrator error 170042 (in Debug and in production), so approve and reject were tested with a mock of the planner's decision. Suppliers, contracts and purchase orders are fictional; only the earthquake data is real.

---

**Demo video of your workflow running:** [paste the link to SupplierPulse_final_video.mp4 — for example YouTube "Unlisted" or Google Drive set to "Anyone with the link"]

**UiPath products used (up to 4):** UiPath Maestro Automate · UiPath Agents · UiPath Data Fabric · UiPath Studio Web

**Other applications and technologies**

UiPath Apps (Planner Console), UiPath Orchestrator (deployment, time trigger, jobs), Studio Web Evaluations (datasets, exact-match and LLM-judge evaluators), Analyze Files agent tool, Claude Sonnet 5 on the Advanced harness (via UiPath Agents), USGS Earthquake Hazards API (public, real-time), JavaScript script nodes with Node.js unit tests, Claude (Anthropic) with Claude in Chrome as the coding agent.

**Workflow canvas or architecture image:** upload `SupplierPulse_architecture.png` (or `screens/01_canvas.jpg` for the real Studio canvas).

**Solution files (up to 10 MB each):** the `.uis` solution downloaded from Studio Web, and `SupplierPulse_docs.zip` (deck, submission notes, test scenarios, build log, screenshots, scripts, test contracts).

**Repository link:** leave empty.

---

**What you loved, or what surprised you**

Loved: Static mocks on any node made every branch testable without waiting for an earthquake. Typed agent outputs plug straight into plain code, so AI judgment and deterministic checks fit together naturally. Error handles turn failures into a normal, audited path. And the built-in evaluations caught a real bug (an expired contract clause) that normal testing missed.

Surprised: Data Fabric queries are re-read live, so a mock on a query node is ignored downstream. Nodes can't be dragged or pasted into a Loop body. A query node keeps the field list from when the entity was picked. And the live approval task failed on my Community tenant with error 170042, which I documented rather than hid.
