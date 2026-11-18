# SupplierPulse — short video script

For `SupplierPulse_short_video.mp4` (2:36). The video has no sound. Play it full screen while you share your screen, turn your FaceCam on, and read each block when its scene appears. The right-hand panel of the video shows the scene number and start time, so you can see where you are. The empty box at the bottom right is the spot for your FaceCam.

Tips:
- Read at a calm pace. Each scene is timed for about 2.4 words per second, with a short pause at the end.
- If you fall behind, pause the video (space bar), finish the sentence, then resume. Most recorders keep recording while the video is paused.
- Replace [your-name] in scene 1 with your name.
- Say numbers the way they are written here; they match what is on screen.
- At about 2.5 minutes it leaves plenty of room under the 7-minute limit, so you can pause and add a sentence anywhere.

## Part 1 · Problem

**Scene 1 — 0:00 — SupplierPulse**

Hi, I'm [your-name]. This is SupplierPulse, built in UiPath Maestro Automate. It turns a real earthquake into a costed, contract-backed decision, with a human in control.

**Scene 2 — 0:12 — Why it matters**

When an earthquake hits near a supplier, a planner must quickly know who is exposed, how long stock lasts, what the contract allows, and what acting is worth. By hand, that takes hours.

## Part 2 · Design

**Scene 3 — 0:27 — Rules, AI and a human**

One Maestro flow does it. AI only reads the contract. Distances, money and policy are plain code. And a planner approves before anything is created.

**Scene 4 — 0:39 — The whole flow**

It runs every 15 minutes on the live USGS feed, or on demand. A loop covers every exposed supplier, every failure has an error path, and every outcome is audited.

## Part 3 · Live run

**Scene 5 — 0:53 — Exposure check**

Here is a real run on the 7.4 Hualien earthquake. The Taiwan supplier is 121 kilometres away: potentially exposed, not disrupted.

**Scene 6 — 1:04 — The contract agent**

The agent reads the contract PDF: 28 days normal lead time, 12 days if expedited, capped at 9,400 dollars. It recommends expedite, and a validator checks that against policy.

**Scene 7 — 1:17 — Business impact**

Code works out the impact: 16 days short, about 192,000 dollars of modelled exposure, against at most 9,400 dollars to expedite.

**Scene 8 — 1:28 — Safe result**

This request already existed, so the flow skips the duplicate instead of asking the planner twice.

## Part 4 · Every path

**Scene 9 — 1:36 — Every ending is audited**

I tested every path: approved, rejected, duplicate, manual review, no exposure, errors, and a second supplier in the loop. Each one leaves an audit row.

## Part 5 · Quality

**Scene 10 — 1:48 — Evaluations found a real bug**

UiPath evaluations on seven contracts found a real bug: with an expired clause, the agent used old terms. One prompt rule fixed it, and all 28 checks now pass.

**Scene 11 — 2:02 — Built with a coding agent**

I built it with Claude as a coding agent. It made mistakes, like creating the request before approval. We caught each one from a failed run and fixed it.

## Part 6 · Production

**Scene 12 — 2:15 — Deployed and running**

It is deployed, and the schedule has run by itself hundreds of times. The live approval form fails on my community tenant, so approval was tested with a mock.

**Scene 13 — 2:29 — Thank you**

SupplierPulse: exposure in seconds, decisions with evidence, a human in control. Thank you.
