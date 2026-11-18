// SupplierPulse — check one additional exposed supplier (runs inside the loop "Each other exposed supplier")
// Inputs: loop item (exposure facts + contract text for this supplier) + the loop agent's proposal
// Output: one audit-ready summary; the planner reviews it in the Planner Console
const it = $vars.loop1.currentItem || {};
const a = ($vars.autonomousAgent2 && $vars.autonomousAgent2.output) || {};

const ALLOWED_ACTIONS = ["expedite", "alt_source", "buffer_stock", "monitor"];
const APPROVED_ALTERNATES = ["harbor fiber works"];
const SPEND_CAP_USD = 10000;

const issues = [];
const action = String(a.proposedAction || "").trim().toLowerCase();
if (!action) issues.push("Agent returned no proposal (agent error or empty output).");
else if (!ALLOWED_ACTIONS.includes(action)) issues.push("Action not allowed: " + a.proposedAction);
if (!it.contractText) issues.push("No contract text in Data Fabric for this supplier.");

if (action === "expedite") {
  if (a.expediteLeadDays === -1) issues.push("Expedite proposed but the contract has no expedite clause.");
  else if (typeof a.expediteLeadDays === "number" && typeof a.standardLeadDays === "number" && a.expediteLeadDays >= a.standardLeadDays) issues.push("Expedited lead time is not shorter than standard.");
  if (typeof a.expediteCostCapUsd === "number" && a.expediteCostCapUsd > SPEND_CAP_USD) issues.push("Expedite cap USD " + a.expediteCostCapUsd + " exceeds policy limit USD " + SPEND_CAP_USD + ".");
}
if (action === "alt_source") {
  const alt = String(a.altSupplier || "").trim().toLowerCase();
  if (!APPROVED_ALTERNATES.some(n => alt === n || alt.startsWith(n + ",") || alt.startsWith(n + " ("))) issues.push("Alternate supplier not on approved list: " + a.altSupplier);
}

// Same language guard as the main Validator: no claim of confirmed disruption
const text = String(a.content || "").toLowerCase().replace(/[‘’]/g, "'");
const CLAIMS = /\b(is|was|has been|have been|are) disrupted\b|\bconfirmed disruption\b|\bdisruption (is|has been|was) confirmed\b/g;
const NEGATION = /\b(no|not|never|without|absent|absence of|lacking|pending|until|unless|if|once|whether|should|un|unconfirmed|cannot|can't|isn't|hasn't|wasn't|doesn't|don't|didn't|won't|wouldn't|aren't|weren't|haven't|require|requires|required|requiring|need|needs|needing|awaiting|awaits|before)\b[^.]{0,40}$/;
let m;
while ((m = CLAIMS.exec(text)) !== null) {
  const before = text.slice(Math.max(0, m.index - 50), m.index);
  if (!NEGATION.test(before)) { issues.push("Agent text claims a confirmed disruption."); break; }
}

const valid = issues.length === 0;
const outcome = valid ? "PROPOSAL_FOR_REVIEW" : "MANUAL_REVIEW";
const facts = action === "expedite"
  ? "expedite " + a.expediteLeadDays + " d vs " + a.standardLeadDays + " d standard, cap USD " + a.expediteCostCapUsd
  : action === "alt_source" ? "alt_source via " + a.altSupplier
  : action || "no proposal";
const detail = ("Other exposed supplier " + it.supplierId + " (" + it.contractRef + ", risk " + it.riskScore + "/100, shortfall " + it.coverShortfallDays + " d): proposed " + facts +
  ", confidence " + a.confidence + ". " + (valid ? "Policy checks passed; awaiting planner review." : "Needs manual review: " + issues.join(" "))).slice(0, 900);

return {
  supplierId: it.supplierId || "",
  requestKey: it.requestKey || "",
  outcome,
  valid,
  issues,
  proposedAction: action,
  detail
};
