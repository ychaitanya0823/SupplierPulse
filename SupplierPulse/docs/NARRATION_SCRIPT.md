# SupplierPulse debugging video: narration script

The video is 2 min 27 s, silent, 1920x1080. Read each block while its scene is on screen (times are mm:ss). Use your own words; the numbers match the screen.

## 00:00  SupplierPulse
Hi, I'm Jagadeesh. This is SupplierPulse, built entirely in UiPath: Maestro Automate, Agents, Data Fabric and Apps. I'll walk you through how I debug it.

## 00:06  The whole flow on one canvas
This is the whole process on one canvas. Two triggers: a manual demo trigger and a schedule every 15 minutes. Every ending returns the same seven typed results.

## 00:13  Detect: USGS event and supplier exposure
First it detects. The HTTP node reads the USGS earthquake feed. If there is no new M6+ event, it ends quietly. Exposure is pure rules, not AI: distance, radius and days of cover.

## 00:21  Every other exposed supplier: the loop
New this week: a loop. If more than one supplier is exposed, each extra supplier gets its own agent analysis from the contract text in Data Fabric, a policy check and an audit row.

## 00:29  Highest-risk supplier: agent, validator, business impact
For the highest-risk supplier, the contract analyst agent reads the contract PDF, and two deterministic scripts check the proposal and calculate the business impact.

## 00:37  Human in the loop and audited endings
Nothing is ordered automatically. Valid proposals go to the planner for approval, duplicates are skipped, and every ending writes an audit row.

## 00:45  Start a Debug run from the manual trigger
Now a debug run. I start from the manual trigger with the supplier contract attached.

## 00:51  The execution trace fills in live
The trace fills in live; you can see each node and how long it took.

## 00:57  Exposure check output
The exposure check found our Taiwan supplier 121 kilometres from the M7.4 Hualien earthquake, risk 57 out of 100. No other supplier is exposed, so the loop is skipped.

## 01:05  The agent calls Analyze Files and returns contract facts
Here the agent calls Analyze Files on the PDF and returns the contract facts: 28-day lead time, 12-day expedite, a 9,400 dollar cap, and Harbor Fiber Works as the alternate.

## 01:13  Validator: deterministic policy checks
The validator re-checks the AI's proposal with fixed rules: allowed actions, spend cap, approved alternates, and it blocks any claim that the site is disrupted. This one passes.

## 01:21  Business impact
Business impact: a 16-day shortfall is 2,400 units and 192,000 dollars at risk. Expediting costs at most 9,400, so the net benefit is 182,600.

## 01:29  Run result: 7 typed outputs
The run ends at End: duplicate, because a request for this event already exists. The flow never asks the planner twice.

## 01:37  Loop test: a second exposed supplier
To test the loop I mocked a second supplier near the quake. The loop agent read the Vietnam contract and proposed monitor, because that supplier has 40 days of cover.

## 01:46  Scheduled path with no new event
The scheduled path: no new M6+ event in the last 15 minutes, so it ends in three seconds without calling the agent.

## 01:54  Agent evaluations
Quality: I evaluate the agent on three contracts, including a trap with no expedite clause. Fact checks stay at 100 percent; a judge model scores the reasoning.

## 02:02  Deployed
It is deployed as version 1.0.0.

## 02:08  The schedule runs on its own
And the schedule runs on its own: this job was started by the time trigger.

## 02:14  Planner Console (UiPath Apps, published)
The planner sees everything in the Planner Console app, live from Data Fabric.

## 02:21  Thank you
That's SupplierPulse: from an earthquake to a contract-grounded mitigation, with a human in the loop. Thank you.
