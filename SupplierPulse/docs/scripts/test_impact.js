const fs=require('fs');
const code=fs.readFileSync(__dirname+'/impact.js','utf8');
function run($vars){return new Function('$vars',code)($vars);}
const exp={suppliers:[{supplierId:"SUP-TW-01",withinRadius:true,distanceKm:121.2,daysOfCover:12,leadTimeDays:28,coverShortfallDays:16,siteStatus:"unknown"},{supplierId:"SUP-VN-01",withinRadius:false}]};
const sup={results:[{SupplierId:"SUP-TW-01",DailyUsage:150}]};
const agent={standardLeadDays:28,expediteDays:12,expediteSurchargePct:17.5,expediteCapUsd:9400,alternateSupplier:"Harbor Fiber Works",recommendedAction:"expedite",confidence:0.72};
const r=run({script4:{output:exp},autonomousAgent1:{output:agent},script6:{output:{supplierId:"SUP-TW-01",recommendedAction:"expedite"}},queryEntityRecords2:{output:sup}});
console.log(JSON.stringify(r,null,1));
const ok=r.unitsShort===2400&&r.valueAtRiskUsd===192000&&r.poValueUsd===54000&&r.options[0].costUsd===9400&&r.options[0].residualShortfallDays===0&&r.lowestTotalCostOption==="expedite"&&r.netBenefitUsd===182600&&r.disruptionStatus.startsWith("UNCONFIRMED");
console.log(ok?"IMPACT TEST OK":"IMPACT TEST FAIL");
const r2=run({script4:{output:{suppliers:[{...exp.suppliers[0],siteStatus:"reported_impacted"}]}},autonomousAgent1:{output:{...agent,recommendedAction:"monitor"}},script6:{output:{supplierId:"SUP-TW-01",recommendedAction:"monitor"}},queryEntityRecords2:{output:sup}});
console.log("monitor case:",r2.disruptionStatus,r2.agentChoiceMatchesLowestCost,r2.netBenefitUsd);
