# SupplierPulse — submission package

UiPath Maestro Automate flow: earthquake (every 15 min or manual) → supplier exposure → contract agent → policy validator → planner approval → request + read-back → audit trail, plus a loop over every other exposed supplier. Deployed as v1.0.1; the Planner Console app is published.

| File | What it is |
|---|---|
| `SUBMISSION.md` | Answers for every field of the challenge form (copy into the forum form) |
| `SupplierPulse_presentation.pptx` | Final presentation (19 slides, speaker notes) |
| `SupplierPulse_final_video.mp4` | **Final narrated demo video with FaceCam (2:39) — submit this one** |
| `SupplierPulse_short_video.mp4`, `SHORT_SCRIPT.md` | Short presenter video (2:36, no sound) and its script — the recommended one to record over |
| `SupplierPulse_presenter_video.mp4`, `PRESENTER_SCRIPT.md` | Presenter video (5:29, no sound) to play while you screen share with FaceCam, and the script to read over it |
| `SupplierPulse_debug_walkthrough.mp4`, `NARRATION_SCRIPT.md` | Debugging walkthrough video (2:27, captions, no voice) and the timed script for your voice-over |
| `SupplierPulse_demo.mp4` | Demo video (≈2 min, one end-to-end scenario from real Debug runs, plus exception and failure cases) |
| `architecture.png` / `architecture.mmd` | Architecture diagram (and its Mermaid source) |
| `screens/` | Canvas screenshot and run evidence (agent reasoning, business impact, approve, reject, exception, escalation, audit log, deploy, scheduled job, published app) |
| `TEST_SCENARIOS.md` | 39 scenarios with expected result, outcome and run numbers |
| `scripts/` | Exposure (pre-loop version; the live code is in the flow), validator, business-impact and loop-check scripts, plus local Node tests (`node scripts/test.js`, `test_validator.js`, `test_impact.js`, `test_other_supplier.js`) |
| `SP-TEST-0417_contract.pdf` | Fictional supplier contract used as the trigger input |
| `logs/AGENT_LOG.md`, `logs/CAPABILITIES.md` | Full build log with the coding agent, and the capability evidence table |

The solution file itself (.uis) is downloaded from Studio Web: Explorer → SupplierPulse → right-click → Download.

All suppliers, contracts and companies are fictional. Earthquake data comes from the public USGS API (event us7000m9g4).
