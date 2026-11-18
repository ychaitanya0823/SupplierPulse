// SupplierPulse - business impact & mitigation options (deterministic, no AI)
// Inputs: exposure facts (script4), agent's contract values (autonomousAgent1), validator (script6)
// Output: what is at risk in units and USD, and a side-by-side comparison of the options.
// Exposure is GEOGRAPHIC only: a disruption is never assumed confirmed unless the site reports it.

const exp = $vars.script4.output;
const a = $vars.autonomousAgent1.output;
const v = $vars.script6.output;
const s = (exp.suppliers || []).find(x => x.supplierId === v.supplierId) || (exp.suppliers || []).find(x => x.withinRadius);

// Synthetic planning data for this demo (fictional PO book; would come from ERP in production)
const PLAN = {
  "SUP-TW-01": { poRef: "PO-TEST-4417", openUnits: 6000, unitCostUsd: 9.0, weeklyOutputUnits: 7000, lineStopCostPerDayUsd: 12000, altLeadDays: 14 }
};
// Contract terms not returned as typed agent outputs (SP-TEST-0417 sections 2, 5, 6)
const TERMS = { expediteCapacityPct: 40, altMaxVolumePct: 30, altTriggerBusinessDays: 5, onSiteBufferDays: 9 };
const MANUAL_ANALYSIS_MINUTES = 180; // assumption: planner reads news, contract, stock and PO data by hand

const p = PLAN[s.supplierId];
if (!p) throw new Error("No planning data for supplier " + s.supplierId);

const cover = s.daysOfCover;                 // days of stock on hand at our site
const row = (($vars.queryEntityRecords2.output || {}).results || []).find(r => r.SupplierId === s.supplierId);
const usagePerDay = row ? row.DailyUsage : 0;          // Supplier.DailyUsage in Data Fabric
if (!(usagePerDay > 0)) throw new Error("No daily usage for supplier " + s.supplierId);
const shortfallDays = s.coverShortfallDays;  // if the next delivery takes the normal lead time
const unitsShort = Math.round(shortfallDays * usagePerDay);
const poValueUsd = Math.round(p.openUnits * p.unitCostUsd);
const valueAtRiskUsd = Math.round(shortfallDays * p.lineStopCostPerDayUsd);

const usd = n => "USD " + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const opts = [];

// Expedite (contract section 2)
if (a.expediteDays > 0) {
  const residual = Math.max(0, a.expediteDays - cover);
  const surcharge = Math.min(Math.round(poValueUsd * a.expediteSurchargePct / 100), a.expediteCapUsd > 0 ? a.expediteCapUsd : Infinity);
  const capacityUnits = Math.round(p.weeklyOutputUnits * TERMS.expediteCapacityPct / 100);
  opts.push({ option: "expedite", arrivesInDays: a.expediteDays, residualShortfallDays: residual,
    costUsd: surcharge, residualRiskUsd: residual * p.lineStopCostPerDayUsd,
    coversShortfall: residual === 0 && capacityUnits >= unitsShort,
    note: "Expedite capacity " + capacityUnits + " units/week (40% of output) vs " + unitsShort + " units short; depends on the exposed site still producing." });
}
// Alternate source (contract section 5)
{
  const start = Math.ceil(TERMS.altTriggerBusinessDays * 7 / 5);   // 5 business days ~ 7 calendar days
  const arrives = start + p.altLeadDays;
  const residual = Math.max(0, arrives - cover);
  opts.push({ option: "alt_source", arrivesInDays: arrives, residualShortfallDays: residual,
    costUsd: null, residualRiskUsd: residual * p.lineStopCostPerDayUsd, coversShortfall: false,
    note: (a.alternateSupplier || "Alternate") + " only after " + TERMS.altTriggerBusinessDays + " business days without confirmation, max " + TERMS.altMaxVolumePct + "% of volume; price not stated in contract." });
}
// Buffer stock (contract section 6) - held at the exposed site, so not counted as safe
opts.push({ option: "buffer_stock", arrivesInDays: null, residualShortfallDays: shortfallDays, costUsd: 0,
  residualRiskUsd: valueAtRiskUsd, coversShortfall: false,
  note: TERMS.onSiteBufferDays + "-day consignment buffer sits at the supplier's own site - same exposure, not counted." });
// Monitor only
opts.push({ option: "monitor", arrivesInDays: s.leadTimeDays, residualShortfallDays: shortfallDays, costUsd: 0,
  residualRiskUsd: valueAtRiskUsd, coversShortfall: false, note: "No action; full shortfall remains if the site is disrupted." });

const best = opts.slice().sort((x, y) => (x.residualRiskUsd + (x.costUsd || 0)) - (y.residualRiskUsd + (y.costUsd || 0)))[0];
const chosen = opts.find(o => o.option === v.recommendedAction) || null;

const disruptionStatus = s.siteStatus === "reported_impacted" ? "IMPACT REPORTED BY SITE"
  : s.siteStatus === "reported_operational" ? "SITE REPORTS OPERATIONAL"
  : "UNCONFIRMED - site status unknown";

return {
  supplierId: s.supplierId,
  exposure: "GEOGRAPHICALLY EXPOSED (" + s.distanceKm + " km from epicentre)",
  disruptionStatus,
  poRef: p.poRef,
  poValueUsd,
  daysOfCover: cover,
  shortfallDays,
  unitsShort,
  valueAtRiskUsd,
  options: opts,
  lowestTotalCostOption: best.option,
  agentChoiceMatchesLowestCost: chosen ? chosen.option === best.option : false,
  netBenefitUsd: chosen ? valueAtRiskUsd - chosen.residualRiskUsd - (chosen.costUsd || 0) : null,
  timeSavedMinutes: MANUAL_ANALYSIS_MINUTES - 1,
  summary: s.supplierId + ": " + disruptionStatus + ". Shortfall " + shortfallDays + " d (" + unitsShort + " units), value at risk " + usd(valueAtRiskUsd)
    + ". Agent recommends " + v.recommendedAction + (chosen ? " (cost " + usd(chosen.costUsd || 0) + ", residual risk " + usd(chosen.residualRiskUsd) + ")" : "")
    + "; lowest total cost option: " + best.option + "."
};
