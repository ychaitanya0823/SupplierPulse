# SupplierPulse — presenter script

For `SupplierPulse_presenter_video.mp4` (5:32). The video has no sound. Play it full screen while you share your screen, turn your FaceCam on, and read each block when its scene appears. The right-hand panel of the video shows the scene number and start time, so you can see where you are. The empty box at the bottom right is the spot for your FaceCam.

Tips:
- Read at a calm pace. Each scene is timed for about 2.4 words per second, with a short pause at the end.
- If you fall behind, pause the video (space bar), finish the sentence, then resume. Most recorders keep recording while the video is paused.
- Replace [your-name] in scene 1 with your name.
- Say numbers the way they are written here; they match what is on screen.
- Total length stays under the 7-minute limit even with a few pauses.

## Part 1 · The problem

**Scene 1 — 0:00 — SupplierPulse**

Hi, I'm [your-name]. This is SupplierPulse, my Maestro Automate Challenge entry: one flow that turns a real earthquake into a costed, contract-backed decision, with a human in control.

**Scene 2 — 0:13 — Four questions after an earthquake**

When an earthquake hits near a supplier, a planner needs four answers fast: who is near it, how long our stock lasts, what the contract allows, and what acting is worth. By hand that takes hours, and it is easy to treat near as disrupted, or to spend money before anyone approves.

**Scene 3 — 0:36 — The demo scenario**

My demo uses a real USGS event, the magnitude 7.4 Hualien earthquake in Taiwan, with fictional suppliers and contracts. SupplierPulse works out the answers in about 40 seconds.

## Part 2 · How it is built

**Scene 4 — 0:49 — One Maestro flow**

Here is the whole flow in Studio Web: 41 nodes, two triggers, a loop and seven End nodes. Failures have error paths, and every outcome is audited.

**Scene 5 — 1:02 — Rules, AI and a human**

The design rule: AI only reads the contract and weighs options. Distances, money and policy are plain code, so the numbers are repeatable. A human approves before anything is created.

**Scene 6 — 1:16 — Two triggers and a loop**

A schedule checks USGS every 15 minutes, and a manual trigger runs it with a contract PDF. The riskiest supplier gets the full path; every other exposed supplier goes through a loop.

**Scene 7 — 1:31 — Guardrails**

Near a quake means exposed, never disrupted. A validator checks every proposal: allowed actions, a 10,000 dollar cap, approved backup suppliers, and no claim of confirmed disruption.

## Part 3 · A real run

**Scene 8 — 1:44 — Start a Debug run**

Now a real run. I start Debug from the manual trigger and attach the supplier contract.

**Scene 9 — 1:52 — The trace fills in live**

The execution trace fills in step by step. First the HTTP request reads the real earthquake from USGS.

**Scene 10 — 2:01 — Exposure check**

The exposure check is code: the Taiwan supplier is 121 kilometres away, risk 57 out of 100, potentially exposed. No other supplier is in range, so the loop is skipped.

**Scene 11 — 2:16 — The contract agent**

The AI agent reads the PDF with Analyze Files and returns typed values: 28 days lead time, 12 days if expedited, capped at 9,400 dollars, and a backup supplier. It recommends expedite.

**Scene 12 — 2:30 — Validator**

The validator checks that proposal. Valid, route to approval. The AI can never approve its own proposal.

**Scene 13 — 2:39 — Business impact**

Business impact is code too: 16 days short, at an assumed 12,000 dollars per day of line stoppage, is 192,000 dollars of modelled exposure. Expediting costs at most 9,400, the cheapest option, matching the agent.

**Scene 14 — 2:55 — Result**

A request for this quake already exists, so the flow ends at duplicate skipped instead of asking the planner twice.

## Part 4 · Other paths

**Scene 15 — 3:05 — Every ending is audited**

I tested every ending: approved, rejected, duplicate, manual review, no exposure and error. Each writes an audit row in Data Fabric.

**Scene 16 — 3:16 — Loop: a second supplier**

For the loop, I mocked a second supplier in Vietnam. Its agent read the contract, proposed monitor because the site has 40 days of stock, and logged it for review.

**Scene 17 — 3:30 — Exceptions**

Here the agent was forced to suggest an unapproved supplier. The validator blocked it and sent it to manual review.

**Scene 18 — 3:40 — Scheduled run, no new quake**

On the schedule, with no new earthquake, the flow ends quietly in three seconds.

## Part 5 · Quality

**Scene 19 — 3:47 — Model chosen by evaluation**

I chose the model with UiPath evaluations: exact checks on contract facts plus an AI judge. Claude Sonnet 5 on the advanced harness scored best at standard cost.

**Scene 20 — 4:00 — A harder test finds a real bug**

Then I grew the test set to seven contracts: a scanned PDF, terms written in words, an amendment that overrides a clause, and an expired clause. The expired one failed. The agent used the old expedite terms.

**Scene 21 — 4:17 — Fixed and re-tested**

I added one rule to the prompt: use only terms in force today. In the re-run, all 28 exact checks passed on all seven contracts.

**Scene 22 — 4:29 — Built with a coding agent**

I built this with Claude as a coding agent, working in Studio Web through Chrome. It made mistakes: it created the request before approval, it once wiped the canvas, its safety check was too strict. Each was caught from a failed run, fixed, and logged.

## Part 6 · In production

**Scene 23 — 4:50 — Deployed and scheduled**

It is deployed to Orchestrator, and the schedule runs on its own. This job was started by the time trigger, not by me.

**Scene 24 — 5:01 — Planner Console**

Planners follow every run in the Planner Console, a published UiPath app showing the live audit log.

**Scene 25 — 5:10 — Honest limits**

Limits: the live approval task fails on my community tenant, in Debug and in production, so approve and reject were tested with a mock. Supplier data is synthetic.

## Part 7 · Close

**Scene 26 — 5:23 — Thank you**

SupplierPulse: exposure in seconds, decisions with evidence, a human in control, and every outcome audited. Thank you.
