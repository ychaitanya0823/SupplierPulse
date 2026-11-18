// SupplierPulse presentation - orange theme, structured deck (pptxgenjs)
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const path = require("path");
const { applyTheme } = require("/root/.claude/skills/synced/c728111a-2958-4bec-b177-4c5ad976ca2d_2f6eb98a-2a67-4dca-8db0-32ac4b353c0c/pptx/scripts/apply_theme.js");

const THEME = {
  name: "SupplierPulse Orange",
  headFontFace: "Arial",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1F1F1F", lt1: "FFFFFF", dk2: "262626", lt2: "FFF1EA",
    accent1: "FA4616", accent2: "C2410C", accent3: "FF9E7A", accent4: "6B7280",
    accent5: "FDBA94", accent6: "7C2D12", hlink: "C2410C", folHlink: "7C2D12",
  },
};
const HEX = THEME.colors;
const IMG = (n) => path.join(__dirname, "img", n);
const OUT = path.join(__dirname, "SupplierPulse_presentation.pptx");

async function icon(name, color, size = 256) {
  const Comp = fa[name];
  if (!Comp) throw new Error("missing icon " + name);
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: String(size) }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.title = "SupplierPulse";
  pres.author = "SupplierPulse team";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const W = 13.333;

  // ---------- Layouts ----------
  pres.defineSlideMaster({
    title: "DARK_TITLE",
    background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.2, w: 8.6, h: 1.4, fontSize: 54, bold: true, color: C.background1, valign: "bottom", align: "left", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 3.75, w: 8.2, h: 1.3, fontSize: 22, color: C.accent3, valign: "top", align: "left", margin: 0 }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "CONTENT",
    background: { color: C.background1 },
    margin: [0.5, 0.6, 0.6, 0.6],
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.35, w: 12.1, h: 0.9, fontSize: 30, bold: true, color: C.text1, valign: "middle", align: "left", margin: 0 }, text: "" } },
      { text: { text: "SupplierPulse  |  UiPath Maestro Automate Challenge", options: { x: 0.6, y: 7.0, w: 8, h: 0.3, fontSize: 10, color: C.accent4, margin: 0 } } },
    ],
    slideNumber: { x: 12.2, y: 7.0, w: 0.5, h: 0.3, fontSize: 10, color: C.accent4, align: "right" },
  });

  // ---------- helpers ----------
  const title = (s, t) => s.addText(t, { placeholder: "title" });
  const iconTile = async (s, name, x, y, sz, fill, fg, objectName) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: sz, h: sz, rectRadius: 0.12, fill: { color: fill }, line: { color: fill }, objectName: objectName + " tile" });
    s.addImage({ data: await icon(name, fg), x: x + sz * 0.22, y: y + sz * 0.22, w: sz * 0.56, h: sz * 0.56, objectName: objectName + " icon", altText: objectName });
  };
  const card = (s, x, y, w, h, fill, objectName) =>
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.1, fill: { color: fill }, line: { color: fill }, objectName });
  const txt = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, margin: 0, valign: "top", color: C.text1, fontSize: 14 }, o));

  // ===== 1. Title =====
  pres.addSection({ title: "Introduction" });
  let s = pres.addSlide({ masterName: "DARK_TITLE", sectionTitle: "Introduction" });
  s.addText("SupplierPulse", { placeholder: "title" });
  s.addText("Agentic supplier-risk response, orchestrated end to end in UiPath Maestro", { placeholder: "body" });
  txt(s, "Agents at Work: The Maestro Automate Challenge  |  2026", { x: 0.8, y: 6.4, w: 8, h: 0.4, fontSize: 14, color: C.background2 });
  s.addShape(pres.shapes.OVAL, { x: 9.6, y: 1.3, w: 3.6, h: 3.6, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "Hero circle" });
  s.addImage({ data: await icon("FaBolt", HEX.lt1), x: 10.55, y: 2.25, w: 1.7, h: 1.7, objectName: "Hero icon", altText: "Lightning bolt" });
  txt(s, [{ text: "~40 s", options: { bold: true, fontSize: 40, color: C.accent1, breakLine: true } }, { text: "from earthquake to a costed, contract-backed recommendation", options: { fontSize: 14, color: C.background2 } }], { x: 9.4, y: 5.1, w: 3.6, h: 1.4, align: "center" });
  s.addNotes("SupplierPulse turns a real earthquake event into a contract-backed, costed mitigation proposal in about 40 seconds, keeps a human in control, and audits every outcome. Everything runs inside UiPath: Maestro, Agents, Data Fabric, Apps and Evaluations.");

  // ===== 2. Problem =====
  pres.addSection({ title: "Problem" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Problem" });
  title(s, "When an earthquake hits, planners need four answers fast");
  const qs = [
    ["FaMapMarkerAlt", "Who is near it?", "Which supplier sites fall inside the impact radius"],
    ["FaBoxes", "How long does stock last?", "Days of cover against the normal lead time"],
    ["FaFileContract", "What does the contract allow?", "Expedite terms, alternate sources, notice periods"],
    ["FaDollarSign", "What is acting worth?", "Value at risk against the cost of each option"],
  ];
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + i * 3.06;
    card(s, x, 1.5, 2.86, 2.9, C.background2, "Question card " + (i + 1));
    await iconTile(s, qs[i][0], x + 0.3, 1.8, 0.8, C.accent1, HEX.lt1, "Question " + (i + 1));
    txt(s, qs[i][1], { x: x + 0.3, y: 2.8, w: 2.3, h: 0.7, fontSize: 18, bold: true, fontFace: "Arial" });
    txt(s, qs[i][2], { x: x + 0.3, y: 3.5, w: 2.3, h: 0.8, fontSize: 14, color: C.accent4 });
  }
  card(s, 0.6, 4.75, 12.1, 1.55, C.text2, "Cost of doing it by hand");
  txt(s, [{ text: "By hand: about 3 hours per supplier", options: { bold: true, fontSize: 20, color: C.accent3, breakLine: true } },
           { text: "and three costly mistakes: treating \"near the quake\" as \"disrupted\", counting buffer stock that sits in the quake zone, and committing spend before anyone approves it.", options: { fontSize: 16, color: C.background1 } }],
      { x: 0.95, y: 4.95, w: 11.4, h: 1.2 });
  s.addNotes("The 3-hour figure is our working assumption for manual analysis per supplier. The three mistakes are what SupplierPulse is designed to prevent.");

  // ===== 3. Headline numbers =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Problem" });
  title(s, "SupplierPulse answers them in about 40 seconds");
  const stats = [
    ["~40 s", "end to end, vs ~3 h manual analysis (assumption)"],
    ["121 km", "Taiwan supplier from the M7.4 Hualien epicentre (real USGS event)"],
    ["USD 192,000", "modelled line-stop exposure: 16 days × USD 12,000 per day (assumed)"],
    ["USD 182,600", "modelled exposure avoided, minus the max expedite cost (USD 9,400)"],
  ];
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + (i % 2) * 6.15, y = 1.55 + Math.floor(i / 2) * 2.6;
    card(s, x, y, 5.95, 2.35, i === 3 ? C.accent1 : C.background2, "Stat card " + (i + 1));
    txt(s, stats[i][0], { x: x + 0.4, y: y + 0.3, w: 5.2, h: 1.0, fontSize: 48, bold: true, fontFace: "Arial", color: i === 3 ? C.background1 : C.accent2 });
    txt(s, stats[i][1], { x: x + 0.4, y: y + 1.4, w: 5.2, h: 0.8, fontSize: 16, color: i === 3 ? C.background1 : C.text1 });
  }
  s.addNotes("Demo scenario: real USGS event us7000m9g4, fictional suppliers and contract. The supplier has 12 days of cover against a 28-day lead time, so 16 days are short. Value at risk is a model: 16 days × an assumed USD 12,000 per day of line stoppage = USD 192,000 (2,400 units at 150 per day). Net benefit = exposure avoided by expediting (all 16 days are covered) minus the maximum surcharge, USD 9,400.");

  // ===== 4. Canvas =====
  pres.addSection({ title: "Solution" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Solution" });
  title(s, "One Maestro flow controls the whole process");
  s.addImage({ path: IMG("canvas.png"), x: 0.6, y: 1.4, w: 12.1, h: 12.1 / 3.476, objectName: "Maestro canvas", altText: "SupplierPulse Maestro Automate flow canvas in Studio Web" });
  const chips = ["41 nodes", "2 triggers", "Loop over exposed suppliers", "Every outcome audited", "Human approval first"];
  for (let i = 0; i < chips.length; i++) {
    const x = 0.6 + i * 2.45;
    card(s, x, 5.35, 2.3, 0.5, C.background2, "Chip " + (i + 1));
    txt(s, chips[i], { x, y: 5.35, w: 2.3, h: 0.5, fontSize: 13, bold: true, color: C.accent2, align: "center", valign: "middle" });
  }
  txt(s, "Error handles on 4 steps lead to one escalation path. 7 End nodes, each returning 7 typed results.", { x: 0.6, y: 6.1, w: 12.1, h: 0.5, fontSize: 15, color: C.accent4 });
  s.addNotes("The canvas in Studio Web after Tidy up nodes: 41 nodes including the Analyze Files tool and the loop body. Every branch except the quiet no-new-event ending writes an audit row.");

  // ===== 5. Process =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Solution" });
  title(s, "Rules where precision matters, AI where judgment matters");
  const steps = [
    ["FaGlobeAsia", "USGS event", "Every 15 min or manual; retry + timeout", "rules"],
    ["FaRulerCombined", "Exposure check", "Distance, radius, days of cover", "rules"],
    ["FaRobot", "Contract agent", "Reads the PDF, compares options", "ai"],
    ["FaShieldAlt", "Validator", "Policy + language guard", "rules"],
    ["FaChartLine", "Business impact", "USD at risk, option costs", "rules"],
    ["FaUserCheck", "Planner approval", "Approve or reject + comment", "human"],
    ["FaClipboardCheck", "Create, verify, audit", "Read back, audit row, End", "rules"],
  ];
  const sw = 1.6, gap = 0.15;
  for (let i = 0; i < steps.length; i++) {
    const x = 0.6 + i * (sw + gap) + 0.05;
    const fill = steps[i][3] === "ai" ? C.accent1 : steps[i][3] === "human" ? C.text2 : C.background2;
    const fg = steps[i][3] === "rules" ? HEX.accent2 : HEX.lt1;
    card(s, x, 1.6, sw, 3.3, fill, "Step " + (i + 1));
    s.addImage({ data: await icon(steps[i][0], fg), x: x + 0.5, y: 1.9, w: 0.6, h: 0.6, objectName: "Step icon " + (i + 1), altText: steps[i][1] });
    const tc = steps[i][3] === "rules" ? C.text1 : C.background1;
    txt(s, steps[i][1], { x: x + 0.12, y: 2.75, w: sw - 0.24, h: 0.8, fontSize: 15, bold: true, align: "center", color: tc, fontFace: "Arial" });
    txt(s, steps[i][2], { x: x + 0.12, y: 3.6, w: sw - 0.24, h: 1.1, fontSize: 12, align: "center", color: tc });
  }
  const legend = [["Deterministic rules", C.background2, C.accent2], ["AI agent", C.accent1, C.background1], ["Human", C.text2, C.background1]];
  for (let i = 0; i < 3; i++) {
    card(s, 0.65 + i * 2.6, 5.3, 2.4, 0.5, legend[i][1], "Legend " + (i + 1));
    txt(s, legend[i][0], { x: 0.65 + i * 2.6, y: 5.3, w: 2.4, h: 0.5, fontSize: 14, bold: true, align: "center", valign: "middle", color: legend[i][2] });
  }
  txt(s, "The AI only does what needs judgment: reading the contract and weighing options. Distances, money and policy are fixed code, so numbers are repeatable and the AI can never approve its own proposal.", { x: 0.65, y: 6.0, w: 12, h: 0.8, fontSize: 15, color: C.accent4 });
  s.addNotes("Seven stages. Only one is AI. Each deterministic step is unit-tested locally and verified in Debug runs.");

  // ===== 5b. Loop + triggers =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Solution" });
  title(s, "Every exposed supplier is covered, on a schedule");
  s.addImage({ path: IMG("loop.png"), x: 0.6, y: 1.4, w: 12.1, h: 12.1 / 4.206, objectName: "Loop on canvas", altText: "Loop node Each other exposed supplier with agent, check and audit in its body" });
  const lp = [
    ["FaClock", "Two triggers", "A schedule checks USGS every 15 minutes; a manual trigger runs the demo with a contract PDF."],
    ["FaSyncAlt", "Loop over the others", "The highest-risk supplier gets the full path. Each other exposed supplier gets its own contract agent, policy check and audit row."],
    ["FaDatabase", "Contracts in Data Fabric", "On scheduled runs there is no file, so the agent reads the contract text stored on the Supplier record."],
  ];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 4.07;
    card(s, x, 4.55, 3.87, 2.2, C.background2, "Loop point " + (i + 1));
    await iconTile(s, lp[i][0], x + 0.3, 4.8, 0.6, C.accent1, HEX.lt1, "Loop point " + (i + 1));
    txt(s, lp[i][1], { x: x + 1.05, y: 4.88, w: 2.6, h: 0.45, fontSize: 16, bold: true, fontFace: "Arial" });
    txt(s, lp[i][2], { x: x + 0.3, y: 5.55, w: 3.3, h: 1.1, fontSize: 13, color: C.text1 });
  }
  s.addNotes("Verified with a mocked second exposed supplier (Vietnam, 96 km): the loop agent read contract SP-TEST-0502 (lead 21 days, expedite 10 days, cap USD 7,500), proposed monitor because the site has 40 days of cover, and wrote a PROPOSAL_FOR_REVIEW audit row.");

  // ===== 6. Agent =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Solution" });
  title(s, "The contract agent cites clauses and shows its trade-offs");
  txt(s, [
    { text: "Returns 7 typed values", options: { bold: true, fontSize: 18, color: C.accent2, breakLine: true } },
    { text: "Lead time 28 d, expedite 12 d at 17.5% capped at USD 9,400, alternate Harbor Fiber Works, action, confidence", options: { fontSize: 15, breakLine: true } },
    { text: " ", options: { fontSize: 8, breakLine: true } },
    { text: "Explains like an analyst", options: { bold: true, fontSize: 18, color: C.accent2, breakLine: true } },
    { text: "Contract facts with section numbers, kept apart from its own inferences", options: { fontSize: 15, breakLine: true } },
    { text: " ", options: { fontSize: 8, breakLine: true } },
    { text: "Compares the options", options: { bold: true, fontSize: 18, color: C.accent2, breakLine: true } },
    { text: "Clause, time to relief, cost limit and main uncertainty for each, plus what would change the decision", options: { fontSize: 15, breakLine: true } },
    { text: " ", options: { fontSize: 8, breakLine: true } },
    { text: "Avoids the traps", options: { bold: true, fontSize: 18, color: C.accent2, breakLine: true } },
    { text: "Does not count on-site buffer stock as safe, reports the 40% capacity limit, invents no penalty clause", options: { fontSize: 15 } },
  ], { x: 0.6, y: 1.5, w: 5.4, h: 5.2 });
  s.addImage({ path: IMG("agent.png"), x: 6.4, y: 1.5, w: 6.3, h: 6.3 / 1.597, objectName: "Agent output", altText: "Agent output in run 39 with Options compared" });
  txt(s, "Live agent output, Debug run #39 (Claude Sonnet 5, Analyze Files tool)", { x: 6.4, y: 5.55, w: 6.3, h: 0.4, fontSize: 11, color: C.accent4 });
  s.addNotes("The agent reads the synthetic contract PDF with the Analyze Files tool. Its numeric outputs feed the deterministic steps directly.");

  // ===== 7. Guardrails =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Solution" });
  title(s, "Exposure is never reported as a confirmed disruption");
  card(s, 0.6, 1.5, 5.9, 2.6, C.background2, "Exposure card");
  await iconTile(s, "FaMapMarkerAlt", 0.9, 1.8, 0.7, C.accent1, HEX.lt1, "Exposure");
  txt(s, "Geographic exposure", { x: 1.8, y: 1.85, w: 4.5, h: 0.6, fontSize: 20, bold: true, fontFace: "Arial" });
  txt(s, "From distance and magnitude radius only.\n\"GEOGRAPHICALLY EXPOSED (121.2 km from epicentre)\"", { x: 0.9, y: 2.75, w: 5.3, h: 1.2, fontSize: 15 });
  card(s, 6.8, 1.5, 5.9, 2.6, C.background2, "Disruption card");
  await iconTile(s, "FaExclamationTriangle", 7.1, 1.8, 0.7, C.text2, HEX.lt1, "Disruption");
  txt(s, "Disruption status", { x: 8.0, y: 1.85, w: 4.5, h: 0.6, fontSize: 20, bold: true, fontFace: "Arial" });
  txt(s, "Only from the site's own report.\nUNCONFIRMED  |  SITE REPORTS OPERATIONAL  |  IMPACT REPORTED BY SITE", { x: 7.1, y: 2.75, w: 5.3, h: 1.2, fontSize: 15 });
  txt(s, "The Validator enforces policy before any human sees the proposal", { x: 0.6, y: 4.4, w: 12, h: 0.5, fontSize: 18, bold: true, color: C.accent2, fontFace: "Arial" });
  const checks = ["Allowed actions only", "Expedite cap ≤ USD 10,000", "Alternate supplier must be pre-approved", "Negation-aware guard blocks \"disruption confirmed\""];
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + i * 3.06;
    card(s, x, 5.05, 2.86, 1.55, C.accent1, "Check " + (i + 1));
    s.addImage({ data: await icon("FaCheckCircle", HEX.lt1), x: x + 0.25, y: 5.3, w: 0.4, h: 0.4, objectName: "Check icon " + (i + 1), altText: "check" });
    txt(s, checks[i], { x: x + 0.25, y: 5.8, w: 2.4, h: 0.75, fontSize: 14, bold: true, color: C.background1 });
  }
  s.addNotes("The language guard handles negations and conditions, so 'no confirmed disruption', 'doesn't require confirmed disruption' or 'if the site confirms damage' pass, while 'disruption confirmed' is blocked. The 'doesn't require' case was a false positive found in testing and fixed (run #50).");

  // ===== 8. Business impact =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Solution" });
  title(s, "Expediting closes the gap at the lowest total cost");
  s.addChart(pres.charts.BAR, [{ name: "Cost + residual risk (USD)", labels: ["Expedite (§2)", "Alternate source (§5)", "Buffer stock (§6)", "Monitor only"], values: [9400, 108000, 192000, 192000] }], {
    x: 0.6, y: 1.4, w: 7.6, h: 5.3, barDir: "bar", catAxisOrientation: "maxMin",
    showTitle: true, title: "Cost plus residual risk after each option (USD)", titleFontSize: 14, titleColor: HEX.dk1, titleFontFace: "+mj-lt",
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "#,##0", dataLabelFontSize: 12, dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt",
    chartColors: [HEX.accent1, HEX.accent3, HEX.accent5, HEX.accent5], invertedColors: [HEX.accent1],
    catAxisLabelColor: HEX.dk1, catAxisLabelFontSize: 13, catAxisLabelFontFace: "+mn-lt",
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false, barGapWidthPct: 60,
  });
  const bi = [["16 days", "shortfall: 12 days of cover vs 28-day lead time"], ["USD 12,000/day", "assumed line-stop cost (demo PO book); 16 d → USD 192,000"], ["USD 9,400", "maximum expedite surcharge (17.5%, capped)"]];
  for (let i = 0; i < 3; i++) {
    const y = 1.5 + i * 1.75;
    card(s, 8.6, y, 4.1, 1.55, i === 2 ? C.accent1 : C.background2, "Impact stat " + (i + 1));
    txt(s, bi[i][0], { x: 8.9, y: y + 0.2, w: 3.6, h: 0.65, fontSize: 30, bold: true, fontFace: "Arial", color: i === 2 ? C.background1 : C.accent2 });
    txt(s, bi[i][1], { x: 8.9, y: y + 0.88, w: 3.6, h: 0.6, fontSize: 13, color: i === 2 ? C.background1 : C.text1 });
  }
  s.addNotes("Deterministic business-impact step. The alternate source arrives on day 21 (trigger after 5 business days plus 14-day lead), leaving 9 days uncovered; its price is not stated in the contract. Buffer stock sits at the exposed site, so it is not counted. PO book and line-stop cost are fictional demo data.");

  // ===== 9. Human + audit =====
  pres.addSection({ title: "Trust" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Trust" });
  title(s, "A human approves first, and every ending is audited");
  const ends = [
    ["FaCheckCircle", "APPROVED_REQUEST_CREATED", "Request created only after approval, then read back", "Run #34"],
    ["FaTimesCircle", "REJECTED", "No request; approver's comment stored", "Run #33"],
    ["FaCopy", "DUPLICATE_SKIPPED", "Same event and supplier already requested", "Runs #38, #41, #42"],
    ["FaSearch", "MANUAL_REVIEW", "Proposal failed policy; reasons logged", "Runs #31, #40"],
    ["FaBan", "NO_EXPOSURE", "Nobody in range; agent never called (~5 s)", "Run #26"],
    ["FaExclamationTriangle", "ESCALATED_ERROR", "A step failed; nothing created", "Runs #35, #36"],
  ];
  for (let i = 0; i < 6; i++) {
    const x = 0.6 + (i % 3) * 4.07, y = 1.5 + Math.floor(i / 3) * 2.6;
    card(s, x, y, 3.87, 2.35, C.background2, "Ending " + (i + 1));
    await iconTile(s, ends[i][0], x + 0.3, y + 0.3, 0.65, i === 0 ? C.accent1 : C.text2, HEX.lt1, "Ending " + (i + 1));
    txt(s, ends[i][1], { x: x + 0.3, y: y + 1.05, w: 3.4, h: 0.4, fontSize: 14, bold: true, color: C.accent2, fontFace: "Arial" });
    txt(s, ends[i][2], { x: x + 0.3, y: y + 1.45, w: 3.4, h: 0.55, fontSize: 13 });
    txt(s, ends[i][3], { x: x + 1.15, y: y + 0.45, w: 2.5, h: 0.4, fontSize: 12, color: C.accent4, align: "right" });
  }
  s.addNotes("Each ending writes one AuditLog row in Data Fabric and reaches an End node with seven typed outputs. Run numbers are the Debug runs that verified each path.");

  // ===== 10. Exceptions =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Trust" });
  title(s, "Exceptions are caught and escalated, never hidden");
  s.addImage({ path: IMG("exception.png"), x: 0.6, y: 1.5, w: 6.2, h: 6.2 / 1.797, objectName: "Exception run", altText: "Run 40 manual review: alternate supplier not on approved list" });
  txt(s, "Run #40: agent forced to propose \"Acme Pulp Co.\" is stopped by the Validator", { x: 0.6, y: 5.05, w: 6.2, h: 0.5, fontSize: 12, color: C.accent4 });
  const ex = [
    ["FaBolt", "Unapproved supplier", "Blocked by the Validator, sent to manual review, audited. No request created."],
    ["FaGlobeAsia", "Bad or empty USGS data", "Exposure check fails loudly instead of giving a false all-clear (runs #35, #36)."],
    ["FaRedoAlt", "Network or step failure", "HTTP retry ×2 with timeout; error handles on 4 steps lead to Escalate failure."],
  ];
  for (let i = 0; i < 3; i++) {
    const y = 1.5 + i * 1.75;
    await iconTile(s, ex[i][0], 7.2, y, 0.7, C.accent1, HEX.lt1, "Exception " + (i + 1));
    txt(s, ex[i][1], { x: 8.1, y: y - 0.02, w: 4.6, h: 0.45, fontSize: 18, bold: true, fontFace: "Arial" });
    txt(s, ex[i][2], { x: 8.1, y: y + 0.45, w: 4.6, h: 1.0, fontSize: 14, color: C.accent4 });
  }
  s.addNotes("Real HTTP network failure and agent runtime failure use the same verified escalation path but were not induced live.");

  // ===== 11. Model choice =====
  pres.addSection({ title: "Evidence" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Evidence" });
  title(s, "We chose the model by evaluation, not by release date");
  s.addChart(pres.charts.BAR, [{ name: "Reasoning judge score (%)", labels: ["Claude Sonnet 5 + Advanced harness", "Claude Opus 5 (Premium)", "Claude Sonnet 5", "GPT-5.6 Terra", "Gemini 3.1 Pro Preview", "Gemini 3.7 Flash"], values: [99, 99, 97, 93, 84, 82] }], {
    x: 0.6, y: 1.4, w: 7.4, h: 5.3, barDir: "bar", catAxisOrientation: "maxMin",
    showTitle: true, title: "Reasoning rubric score, 3 contracts (%)", titleFontSize: 14, titleColor: HEX.dk1, titleFontFace: "+mj-lt",
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 12, dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt",
    chartColors: [HEX.accent1], catAxisLabelColor: HEX.dk1, catAxisLabelFontSize: 12, catAxisLabelFontFace: "+mn-lt",
    valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 110, valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false, barGapWidthPct: 50,
  });
  card(s, 8.4, 1.5, 4.3, 2.35, C.accent1, "Winner card");
  txt(s, [{ text: "Chosen", options: { fontSize: 14, color: C.background1, breakLine: true } },
           { text: "Claude Sonnet 5 + Advanced harness (Preview)", options: { fontSize: 20, bold: true, color: C.background1, breakLine: true } },
           { text: "100% on all 4 contract facts, 99% reasoning, Standard tier", options: { fontSize: 14, color: C.background1 } }], { x: 8.7, y: 1.7, w: 3.8, h: 2.0 });
  txt(s, [{ text: "How we tested", options: { bold: true, fontSize: 16, color: C.accent2, breakLine: true } },
           { text: "3 contracts, including a trap with no expedite clause; 4 exact checks plus a rubric judge on a model outside the comparison.", options: { fontSize: 14, breakLine: true } },
           { text: " ", options: { fontSize: 6, breakLine: true } },
           { text: "What the newest models showed", options: { bold: true, fontSize: 16, color: C.accent2, breakLine: true } },
           { text: "Every model got the facts right. GPT-5.6 Terra broke the supplier-name rule in 2 of 3 cases; Gemini 3.1 Pro errored on 1 case.", options: { fontSize: 14 } }], { x: 8.4, y: 4.1, w: 4.3, h: 2.7 });
  s.addNotes("All runs used the same prompt v2 and judge v2 in Studio Web Evaluations. Differences of 1-2 points on 3 cases are within run-to-run noise; tier, speed and rule-following decided the choice. The Advanced harness is UiPath's newest agent runtime, 50% discounted during preview.");

  // ===== 12. Eval fixes =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Evidence" });
  title(s, "Evaluations found real issues, and we fixed them");
  const fixes = [
    ["Supplier name with location", "Agent returned \"Harbor Fiber Works (fictional), Penang\"", "Prompt v2: company name only"],
    ["Judge tied to one contract", "Rubric hard-coded the baseline facts", "Judge v2 scores each case vs its own answer"],
    ["Wrong expected value", "Our trap case expected 0; the prompt says -1", "Dataset corrected; the model was right"],
  ];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 4.07;
    card(s, x, 1.5, 3.87, 2.5, C.background2, "Fix card " + (i + 1));
    txt(s, fixes[i][0], { x: x + 0.3, y: 1.7, w: 3.3, h: 0.5, fontSize: 17, bold: true, fontFace: "Arial", color: C.accent2 });
    txt(s, fixes[i][1], { x: x + 0.3, y: 2.25, w: 3.3, h: 0.8, fontSize: 13 });
    txt(s, [{ text: "Fix: ", options: { bold: true } }, { text: fixes[i][2] }], { x: x + 0.3, y: 3.1, w: 3.3, h: 0.8, fontSize: 13, color: C.text1 });
  }
  s.addImage({ path: IMG("evals.png"), x: 0.6, y: 4.25, w: 2.55 * 3.28, h: 2.55, objectName: "Eval runs table", altText: "Studio Web Eval runs table, runs 1 to 10" });
  txt(s, "Run 1 (before fixes) scored 33-67% on exact checks. With 7 contracts (scanned PDF, amendment, expired clause), run 13 caught the agent using an expired clause; one prompt rule fixed it and run 14 passed all 28 exact checks.", { x: 9.2, y: 4.35, w: 3.5, h: 2.4, fontSize: 14, color: C.accent4 });
  s.addNotes("This is the evaluation loop working as intended: run, read the diffs and judge justification, fix the prompt or the dataset, re-run.");

  // ===== 12b. Coding agent =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Evidence" });
  title(s, "Built with a coding agent: mistakes and fixes");
  txt(s, "Claude (Anthropic) worked in Studio Web through the Claude in Chrome extension, with my approval for each risky step. Every change, mistake and fix is in AGENT_LOG.md.", { x: 0.6, y: 1.3, w: 12.1, h: 0.6, fontSize: 14, color: C.accent4 });
  const ca = [
    ["Request before approval", "First design created the request, then asked the planner.", "Reordered: approve, then create, read back, audit."],
    ["Canvas wiped", "A mis-focused Ctrl+A / Delete removed the canvas. Undo restored nodes, not 3 settings.", "Found via failed run #27, repaired; run #30 passed."],
    ["Safety check too strict", "Guard flagged \"no / absent / doesn't require confirmed disruption\".", "Negation-aware guard, 15 unit tests; runs #32, #50."],
    ["Agent looped", "Scheduled runs hit max iterations looking for a PDF that wasn't there.", "Prompt: use Analyze Files only when a file is attached."],
    ["Mock ignored", "A mock on a Data Fabric query was bypassed by a live re-query.", "Mocked the step upstream instead; learning logged."],
    ["Rejects not audited", "Form schema ended the flow on Reject.", "Reject now continues to an audit row (run #33)."],
  ];
  for (let i = 0; i < 6; i++) {
    const x = 0.6 + (i % 3) * 4.07, y = 2.05 + Math.floor(i / 3) * 2.05;
    card(s, x, y, 3.87, 1.85, C.background2, "Iteration " + (i + 1));
    txt(s, ca[i][0], { x: x + 0.25, y: y + 0.15, w: 3.4, h: 0.4, fontSize: 15, bold: true, fontFace: "Arial", color: C.accent2 });
    txt(s, ca[i][1], { x: x + 0.25, y: y + 0.58, w: 3.4, h: 0.6, fontSize: 12 });
    txt(s, [{ text: "Fix: ", options: { bold: true } }, { text: ca[i][2] }], { x: x + 0.25, y: y + 1.2, w: 3.4, h: 0.55, fontSize: 12 });
  }
  card(s, 0.6, 6.2, 12.1, 0.6, C.accent1, "Where I stepped in");
  txt(s, "Where I stepped in: a colleague review added business impact and option comparison; I approved deploy and publish; models were chosen by evaluation.", { x: 0.85, y: 6.2, w: 11.6, h: 0.6, fontSize: 13, bold: true, color: C.background1, valign: "middle" });
  s.addNotes("All six iterations are logged with dates and run numbers in AGENT_LOG.md. The agent started with Milestone 0: probing each capability and marking it VERIFIED, FAILED or NOT TESTED before building.");

  // ===== 13. Planner console =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Evidence" });
  title(s, "The published Planner Console shows every run");
  s.addImage({ path: IMG("app.png"), x: 1.17, y: 1.35, w: 11, h: 11 / 2.954, objectName: "Planner console", altText: "SupplierPulse Planner Console built in UiPath Apps" });
  const pc = [["FaDatabase", "Live Data Fabric", "AuditLog and Supplier tables, no copies"], ["FaTable", "Latest run first", "Outcome, detail, event and request key"], ["FaRocket", "Published v1.0.0", "Deployed to the Shared folder; planners need no Studio access"]];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 4.07;
    await iconTile(s, pc[i][0], x, 5.5, 0.6, C.accent1, HEX.lt1, "Console point " + (i + 1));
    txt(s, pc[i][1], { x: x + 0.8, y: 5.45, w: 3.1, h: 0.4, fontSize: 16, bold: true, fontFace: "Arial" });
    txt(s, pc[i][2], { x: x + 0.8, y: 5.85, w: 3.1, h: 0.6, fontSize: 13, color: C.accent4 });
  }
  s.addNotes("Built in the browser-based UiPath Apps service and bound to the same Data Fabric entities the flow writes.");

  // ===== 13b. Deployed =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Evidence" });
  title(s, "Deployed, and the schedule runs on its own");
  const dp = [["v1.0.1", "deployed to Shared/SupplierPulse, Active"], ["Every 15 min", "Orchestrator time trigger checks USGS"], ["6 s", "a scheduled run with no new M6+ event, no agent cost"]];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 4.07;
    card(s, x, 1.5, 3.87, 1.9, i === 0 ? C.accent1 : C.background2, "Deploy stat " + (i + 1));
    txt(s, dp[i][0], { x: x + 0.3, y: 1.7, w: 3.3, h: 0.8, fontSize: 36, bold: true, fontFace: "Arial", color: i === 0 ? C.background1 : C.accent2 });
    txt(s, dp[i][1], { x: x + 0.3, y: 2.6, w: 3.3, h: 0.7, fontSize: 14, color: i === 0 ? C.background1 : C.text1 });
  }
  s.addImage({ path: IMG("job.png"), x: 0.6, y: 3.9, w: 12.1, h: 12.1 / 7.429, objectName: "Orchestrator job", altText: "Orchestrator job started by Flow_TimeTrigger, Successful, 6 seconds" });
  txt(s, "Orchestrator, Shared/SupplierPulse > Jobs: the job was started by Flow_TimeTrigger, not by a person.", { x: 0.6, y: 5.65, w: 12.1, h: 0.5, fontSize: 13, color: C.accent4 });
  s.addNotes("Deployed on 11 Nov 2026 with the user's approval (v1.0.0, then v1.0.1 with the 'terms in force' rule and live approval). About 13 minutes later the schedule fired by itself; the job ended Successful in 6.02 seconds because there was no new M6+ event.");

  // ===== 14. Evidence stats =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Evidence" });
  title(s, "Built in UiPath, tested with evidence at every step");
  const ev = [["50+", "Debug runs covering every branch"], ["14", "evaluation runs; 7 test contracts"], ["39", "documented test scenarios"], ["4", "local unit-test suites (exposure, validator, impact, loop check)"]];
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + i * 3.06;
    card(s, x, 1.5, 2.86, 2.4, i === 0 ? C.accent1 : C.background2, "Evidence stat " + (i + 1));
    txt(s, ev[i][0], { x: x + 0.3, y: 1.7, w: 2.3, h: 1.0, fontSize: 54, bold: true, fontFace: "Arial", color: i === 0 ? C.background1 : C.accent2 });
    txt(s, ev[i][1], { x: x + 0.3, y: 2.8, w: 2.3, h: 0.9, fontSize: 14, color: i === 0 ? C.background1 : C.text1 });
  }
  txt(s, "Everything in one platform", { x: 0.6, y: 4.3, w: 12, h: 0.5, fontSize: 18, bold: true, fontFace: "Arial", color: C.accent2 });
  const plat = [["FaProjectDiagram", "Maestro Automate"], ["FaRobot", "Agents"], ["FaDatabase", "Data Fabric"], ["FaFlask", "Evaluations"], ["FaThLarge", "Apps"]];
  for (let i = 0; i < 5; i++) {
    const x = 0.6 + i * 2.45;
    card(s, x, 4.95, 2.25, 1.6, C.background2, "Platform " + (i + 1));
    s.addImage({ data: await icon(plat[i][0], HEX.accent1), x: x + 0.82, y: 5.15, w: 0.6, h: 0.6, objectName: "Platform icon " + (i + 1), altText: plat[i][1] });
    txt(s, plat[i][1], { x, y: 5.9, w: 2.25, h: 0.45, fontSize: 15, bold: true, align: "center" });
  }
  s.addNotes("Every claim in the submission maps to a run or test listed in TEST_SCENARIOS.md and the agent log.");

  // ===== 15. Limits & next =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Evidence" });
  title(s, "Honest limits and what comes next");
  card(s, 0.6, 1.5, 5.9, 4.2, C.background2, "Limits card");
  txt(s, [{ text: "Known limits", options: { bold: true, fontSize: 20, color: C.accent2, breakLine: true } },
           { text: "Live approval task fails on our Community tenant (Orchestrator 170042), in Debug and in production; approve and reject were tested with a mock of the planner's decision", options: { bullet: true, breakLine: true } },
           { text: "Suppliers, contracts and PO data are synthetic; only the earthquake is real", options: { bullet: true, breakLine: true } },
           { text: "Network and agent runtime failures share the verified escalation path but were not induced live", options: { bullet: true, breakLine: true } },
           { text: "Studio shows about 49 \"possibly null\" type warnings on scripts; runs and deploy are unaffected", options: { bullet: true } }],
      { x: 0.9, y: 1.75, w: 5.3, h: 3.8, fontSize: 15, paraSpaceAfter: 10 });
  card(s, 6.8, 1.5, 5.9, 4.2, C.accent1, "Next card");
  txt(s, [{ text: "Next steps", options: { bold: true, fontSize: 20, color: C.background1, breakLine: true } },
           { text: "Approval through an Action app in the Planner Console, once the tenant issue is resolved", options: { bullet: true, breakLine: true } },
           { text: "Planner sign-off for loop proposals in the app, not only in the audit log", options: { bullet: true, breakLine: true } },
           { text: "Real data: ERP purchase orders, stock levels and supplier master synced into the same Data Fabric entities, so the flow does not change", options: { bullet: true, breakLine: true } },
           { text: "Scheduled runtime evaluations to watch agent quality over time", options: { bullet: true } }],
      { x: 7.1, y: 1.75, w: 5.3, h: 3.8, fontSize: 15, color: C.background1, paraSpaceAfter: 10 });
  txt(s, "Every capability is marked VERIFIED, FAILED or NOT TESTED in CAPABILITIES.md, with the run that proves it.", { x: 0.6, y: 6.0, w: 12.1, h: 0.6, fontSize: 15, italic: true, color: C.accent4 });
  s.addNotes("We report limits openly: every capability is marked verified, failed or not tested in CAPABILITIES.md.");

  // ===== 16. Close =====
  pres.addSection({ title: "Close" });
  s = pres.addSlide({ masterName: "DARK_TITLE", sectionTitle: "Close" });
  s.addText("Exposure in seconds. Decisions with evidence.", { placeholder: "title", fontSize: 44 });
  s.addText("A human stays in control, and every outcome is audited.", { placeholder: "body" });
  s.addShape(pres.shapes.OVAL, { x: 9.6, y: 1.3, w: 3.6, h: 3.6, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "Closing circle" });
  s.addImage({ data: await icon("FaUserCheck", HEX.lt1), x: 10.55, y: 2.25, w: 1.7, h: 1.7, objectName: "Closing icon", altText: "Human approval" });
  txt(s, "SupplierPulse  |  UiPath Maestro Automate", { x: 0.8, y: 6.4, w: 8, h: 0.4, fontSize: 14, color: C.background2 });
  s.addNotes("Thank you. Questions welcome.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("written", OUT);
})().catch((e) => { console.error(e); process.exit(1); });
