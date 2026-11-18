// SupplierPulse — validator (deterministic checks on the agent's proposal)
// Inputs: agent outputs (autonomousAgent1) + exposure facts (script4)
// Output: valid / issues / route ("approval" or "manual_review")

const a = $vars.autonomousAgent1.output;
const exp = $vars.script4.output;
const s = (exp.suppliers || []).find(x => x.supplierId === exp.primarySupplierId) || (exp.suppliers || []).find(x => x.withinRadius);   // the primary (highest-risk) exposed supplier

// Policy (published, configurable)
const ALLOWED_ACTIONS = ["expedite", "alt_source", "buffer_stock", "monitor"];
const APPROVED_ALTERNATES = ["harbor fiber works"];          // compare lower-case
const SPEND_CAP_USD = 10000;                                 // max expedite surcharge without senior sign-off
const MIN_CONFIDENCE = 0.6;

const issues = [];
const warnings = [];

if (!s) issues.push("No exposed supplier found in exposure facts.");

// 1) Required fields present and well-formed
["standardLeadDays", "expediteDays", "expediteSurchargePct", "expediteCapUsd", "confidence"].forEach(k => {
  if (typeof a[k] !== "number" || isNaN(a[k])) issues.push("Missing or non-numeric field: " + k);
});
if (typeof a.recommendedAction !== "string") issues.push("Missing recommendedAction");

// 2) Action must be from the allowed set
const action = (a.recommendedAction || "").trim().toLowerCase();
if (!ALLOWED_ACTIONS.includes(action)) issues.push("recommendedAction not allowed: " + a.recommendedAction);

// 3) Contract value consistency with system data
if (s && a.standardLeadDays !== -1 && a.standardLeadDays !== s.leadTimeDays) {
  warnings.push("Contract lead time (" + a.standardLeadDays + ") differs from supplier master data (" + s.leadTimeDays + ").");
}

// 4) Action-specific checks
let daysSaved = null;
if (action === "expedite") {
  if (a.expediteDays === -1) issues.push("Expedite recommended but contract has no expedite clause.");
  else if (a.expediteDays >= a.standardLeadDays) issues.push("Expedited lead time is not shorter than standard lead time.");
  else daysSaved = a.standardLeadDays - a.expediteDays;
  if (a.expediteCapUsd === -1) warnings.push("No surcharge cap stated; cost is unbounded.");
  else if (a.expediteCapUsd > SPEND_CAP_USD) issues.push("Expedite cap USD " + a.expediteCapUsd + " exceeds policy limit USD " + SPEND_CAP_USD + ".");
  if (s && a.expediteDays > s.daysOfCover) warnings.push("Even expedited (" + a.expediteDays + " d), delivery arrives after stock runs out (" + s.daysOfCover + " d).");
}
if (action === "alt_source") {
  const alt = (a.alternateSupplier || "").trim().toLowerCase();
  if (!APPROVED_ALTERNATES.some(n => alt === n || alt.startsWith(n + ",") || alt.startsWith(n + " ("))) issues.push("Alternate supplier not on approved list: " + a.alternateSupplier);
}
if (action === "monitor" && s && s.coverShortfallDays > 0) {
  warnings.push("Monitor recommended despite a " + s.coverShortfallDays + "-day cover shortfall.");
}

// 5) Language guard: the agent must not claim confirmed disruption
// Flags positive claims only; ignores negated phrases such as "no confirmed disruption".
const text = (a.content || "").toLowerCase().replace(/[\u2018\u2019]/g, "'");   // curly apostrophes -> straight
const CLAIMS = /\b(is|was|has been|have been|are) disrupted\b|\bconfirmed disruption\b|\bdisruption (is|has been|was) confirmed\b/g;
const NEGATION = /\b(no|not|never|without|absent|absence of|lacking|pending|until|unless|if|once|whether|should|un|unconfirmed|cannot|can't|isn't|hasn't|wasn't|doesn't|don't|didn't|won't|wouldn't|aren't|weren't|haven't|require|requires|required|requiring|need|needs|needing|awaiting|awaits|before)\b[^.]{0,40}$/;
let m;
while ((m = CLAIMS.exec(text)) !== null) {
  const before = text.slice(Math.max(0, m.index - 50), m.index);
  if (!NEGATION.test(before)) {
    issues.push("Agent text claims a confirmed disruption: \"" + m[0] + "\"");
    break;
  }
}

// 6) Confidence
if (typeof a.confidence === "number" && a.confidence < MIN_CONFIDENCE) {
  warnings.push("Low confidence (" + a.confidence + " < " + MIN_CONFIDENCE + ").");
}

const valid = issues.length === 0;
const route = valid && warnings.length === 0 ? "approval" : valid ? "approval_with_warnings" : "manual_review";

return {
  valid,
  route,
  issues,
  warnings,
  supplierId: s ? s.supplierId : null,
  requestKey: s ? s.requestKey : null,
  recommendedAction: action,
  daysSaved,
  expediteCapUsd: a.expediteCapUsd,
  confidence: a.confidence,
  policy: { allowedActions: ALLOWED_ACTIONS, spendCapUsd: SPEND_CAP_USD, minConfidence: MIN_CONFIDENCE }
};
