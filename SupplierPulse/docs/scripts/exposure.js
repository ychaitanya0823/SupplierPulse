// SupplierPulse — exposure check (deterministic, no AI)
// Inputs: USGS response (httpRequest1) + suppliers (queryEntityRecords2)
// Output: which suppliers are POTENTIALLY EXPOSED (never "disrupted")

const body = $vars.httpRequest1.output.body;
const EXPECTED_EVENT_ID = "us7000m9g4";

// 1) Fail safely if the USGS data is not what we expect (never a false "all clear")
if (!body || !body.metadata || body.metadata.count !== 1 || !body.features || body.features.length !== 1) {
  throw new Error("USGS response invalid: expected exactly 1 event, got " + (body && body.metadata ? body.metadata.count : "none"));
}
const f = body.features[0];
if (f.id !== EXPECTED_EVENT_ID) {
  throw new Error("USGS returned unexpected event id: " + f.id);
}
const coords = f.geometry && f.geometry.coordinates;
if (!coords || coords.length < 2) {
  throw new Error("USGS event has no coordinates");
}

const event = {
  eventId: f.id,
  title: f.properties.title,
  mag: f.properties.mag,
  alert: f.properties.alert,
  mmi: f.properties.mmi,
  timeUtc: new Date(f.properties.time).toISOString(),
  lon: coords[0],          // GeoJSON order is [lon, lat, depth]
  lat: coords[1],
  depthKm: coords[2],
  url: f.properties.url
};

// 2) Screening radius by magnitude (published rule, configurable)
const radiusKm = event.mag >= 7 ? 300 : event.mag >= 6 ? 150 : 75;

// 3) Distance (haversine, km)
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371, toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// 4) Evaluate each supplier — copy only business fields (no CreatedBy/UpdatedBy personal data)
const rows = ($vars.queryEntityRecords2.output && $vars.queryEntityRecords2.output.results) || [];
if (rows.length === 0) {
  throw new Error("No suppliers returned from Data Fabric");
}

const suppliers = rows.map(s => {
  const d = Math.round(distanceKm(event.lat, event.lon, s.SiteLat, s.SiteLon) * 10) / 10;
  const withinRadius = d <= radiusKm;
  const daysOfCover = s.DailyUsage > 0 ? Math.round((s.OnHandUnits / s.DailyUsage) * 10) / 10 : null;
  const coverShortfallDays = daysOfCover !== null ? Math.max(0, Math.round((s.LeadTimeDays - daysOfCover) * 10) / 10) : null;

  // Risk score 0-100, only for suppliers inside the radius
  let riskScore = 0;
  if (withinRadius) {
    const proximity = (1 - d / radiusKm) * 50;                                        // up to 50
    const cover = coverShortfallDays ? Math.min(1, coverShortfallDays / s.LeadTimeDays) * 30 : 0; // up to 30
    const status = s.SiteStatus === "reported_impacted" ? 20 : s.SiteStatus === "unknown" ? 10 : 0; // up to 20
    riskScore = Math.round(proximity + cover + status);
  }

  return {
    supplierId: s.SupplierId,
    supplierName: s.SupplierName,
    country: s.Country,
    contractRef: s.ContractRef,
    siteStatus: s.SiteStatus,
    distanceKm: d,
    withinRadius,
    daysOfCover,
    leadTimeDays: s.LeadTimeDays,
    coverShortfallDays,
    riskScore,
    exposure: withinRadius ? "POTENTIALLY_EXPOSED" : "NOT_EXPOSED",
    requestKey: event.eventId + "|" + s.SupplierId
  };
});

const exposed = suppliers.filter(s => s.withinRadius);

// 5) Plain-text brief for the agent prompt (facts only, computed here, not by the AI)
const agentBrief = exposed.length === 0
  ? "No supplier is within the screening radius."
  : "Event: " + event.title + " (USGS " + event.eventId + ", " + event.timeUtc.slice(0, 10) + ", M" + event.mag + ", PAGER alert " + event.alert + ").\n" +
    exposed.map(s =>
      "Supplier " + s.supplierId + " (" + s.supplierName + "), contract " + s.contractRef +
      ": distance " + s.distanceKm + " km (screening radius " + radiusKm + " km), site status " + s.siteStatus +
      ", days of cover " + s.daysOfCover + " vs lead time " + s.leadTimeDays + " days (shortfall " + s.coverShortfallDays +
      " days), risk score " + s.riskScore + "/100. Status: POTENTIALLY EXPOSED - disruption NOT confirmed."
    ).join("\n");

return {
  event,
  radiusKm,
  suppliers,
  exposedCount: exposed.length,
  exposedSupplierIds: exposed.map(s => s.supplierId),
  agentBrief,
  note: "Proximity indicates potential exposure only; it does not confirm any disruption."
};
