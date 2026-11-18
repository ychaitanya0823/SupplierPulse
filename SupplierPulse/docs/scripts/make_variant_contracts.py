# Builds synthetic contract variants for the agent evaluation dataset (fictional parties).
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import sys

HEAD = "SYNTHETIC TEST DOCUMENT - FICTIONAL PARTIES - NOT A REAL CONTRACT"
PARTIES = ("Buyer: Northwind Assembly Ltd. (fictional) &nbsp;&nbsp; Supplier: Lotus Ridge Packaging Co. (fictional), "
           "Hsinchu site, Taiwan<br/>Effective date: 1 January 2024 &nbsp;&nbsp; Term: 36 months &nbsp;&nbsp; "
           "Material: Molded pulp inserts, part no. LRP-MP-220")
NOTICE = ("The Supplier shall notify the Buyer in writing within 36 hours of becoming aware of any event that may delay "
          "delivery, including natural hazards, and shall state the expected impact on open purchase orders.")
FM = ("Neither party is liable for delay caused by events beyond its reasonable control, including earthquakes, provided "
      "the affected party has complied with Section 3. Force majeure relief does not extend beyond 45 days.")

VARIANTS = {
 "SP-TEST-0418": [
  ("1. Standard Lead Time", "The Supplier shall deliver each purchase order within 35 calendar days of order acceptance."),
  ("2. Expedited Delivery", "On written request, the Supplier shall make reasonable efforts to deliver within 15 calendar days. "
     "Expedited orders carry a surcharge of 12% of the order value, capped at USD 6,000 per purchase order. Expedite capacity "
     "is limited to 50% of the Supplier's normal weekly output for this part."),
  ("3. Notification of Disruption", NOTICE),
  ("4. Force Majeure", FM),
  ("5. Alternate Sourcing", "If the Supplier cannot confirm a delivery date within 5 business days of a Section 3 notice, the "
     "Buyer may source up to 25% of the affected volume from an approved alternate supplier without penalty. Approved "
     "alternate: Northbay Paper Mills (fictional), Johor, Malaysia."),
  ("6. Safety Stock", "The Supplier shall hold a consignment buffer of 7 days of the Buyer's average usage at its own warehouse."),
 ],
 "SP-TEST-0419": [
  ("1. Standard Lead Time", "The Supplier shall deliver each purchase order within 30 calendar days of order acceptance."),
  ("2. Expedited Delivery", "The Supplier does not offer expedited delivery under this agreement. Requests to shorten the lead "
     "time are not binding on the Supplier and carry no agreed price."),
  ("3. Notification of Disruption", NOTICE),
  ("4. Force Majeure", FM),
  ("5. Alternate Sourcing", "If the Supplier cannot confirm a delivery date within 3 business days of a Section 3 notice, the "
     "Buyer may source up to 40% of the affected volume from an approved alternate supplier without penalty. Approved "
     "alternate: Harbor Fiber Works (fictional), Penang, Malaysia."),
  ("6. Safety Stock", "The Supplier shall hold a consignment buffer of 10 days of the Buyer's average usage at its own warehouse."),
 ],
 "SP-TEST-0420": [
  ("1. Standard Lead Time", "The Supplier shall deliver each purchase order within thirty (30) calendar days of order acceptance."),
  ("2. Expedited Delivery", "On written request, the Supplier shall make reasonable efforts to deliver within two (2) weeks. "
     "Expedited orders carry a surcharge of fifteen percent (15%) of the order value, capped at nine thousand five hundred "
     "United States dollars (USD 9,500) per purchase order. Expedite capacity is limited to 40% of the Supplier's normal weekly output."),
  ("3. Notification of Disruption", NOTICE),
  ("4. Force Majeure", FM),
  ("5. Alternate Sourcing", "If the Supplier cannot confirm a delivery date within 5 business days of a Section 3 notice, the "
     "Buyer may source up to 30% of the affected volume from an approved alternate supplier without penalty. Approved "
     "alternate: Harbor Fiber Works (fictional), Penang, Malaysia."),
  ("6. Safety Stock", "The Supplier shall hold a consignment buffer of 9 days of the Buyer's average usage at its own warehouse."),
 ],
 "SP-TEST-0421": [
  ("1. Standard Lead Time", "The Supplier shall deliver each purchase order within 28 calendar days of order acceptance."),
  ("2. Expedited Delivery", "On written request, the Supplier shall make reasonable efforts to deliver within 10 calendar days. "
     "Expedited orders carry a surcharge of 17.5% of the order value, capped at USD 9,400 per purchase order."),
  ("3. Notification of Disruption", NOTICE),
  ("4. Force Majeure", FM),
  ("5. Alternate Sourcing", "If the Supplier cannot confirm a delivery date within 5 business days of a Section 3 notice, the "
     "Buyer may source up to 30% of the affected volume from an approved alternate supplier without penalty. Approved "
     "alternate: Harbor Fiber Works (fictional), Penang, Malaysia."),
  ("6. Safety Stock", "The Supplier shall hold a consignment buffer of 9 days of the Buyer's average usage at its own warehouse."),
  ("Amendment No. 1 (effective 1 July 2025)", "This amendment replaces Section 2 in full. On written request, the Supplier shall "
     "make reasonable efforts to deliver within 18 calendar days. Expedited orders carry a surcharge of 20% of the order value, "
     "capped at USD 7,000 per purchase order. Where this amendment and Section 2 differ, this amendment prevails."),
 ],
 "SP-TEST-0425": [
  ("1. Standard Lead Time", "The Supplier shall deliver each purchase order within 28 calendar days of order acceptance."),
  ("2. Expedited Delivery", "Until 31 December 2025 only, the Supplier shall make reasonable efforts to deliver within 12 calendar "
     "days on written request, for a surcharge of 17.5% capped at USD 9,400 per purchase order. This expedite option expired on "
     "31 December 2025 and has not been renewed; no expedited delivery is available after that date."),
  ("3. Notification of Disruption", NOTICE),
  ("4. Force Majeure", FM),
  ("5. Alternate Sourcing", "If the Supplier cannot confirm a delivery date within 5 business days of a Section 3 notice, the "
     "Buyer may source up to 30% of the affected volume from an approved alternate supplier without penalty. Approved "
     "alternate: Harbor Fiber Works (fictional), Penang, Malaysia."),
  ("6. Safety Stock", "The Supplier shall hold a consignment buffer of 9 days of the Buyer's average usage at its own warehouse."),
 ],
}

out = sys.argv[1]
ss = getSampleStyleSheet()
for ref, secs in VARIANTS.items():
    doc = SimpleDocTemplate(f"{out}/{ref}_contract.pdf", pagesize=A4, title=f"Supply Agreement {ref} (synthetic)")
    story = [Paragraph(HEAD, ss["Heading4"]), Paragraph(f"Supply Agreement - Ref. {ref}", ss["Title"]),
             Paragraph(PARTIES, ss["Normal"]), Spacer(1, 10)]
    for h, t in secs:
        story += [Paragraph(h, ss["Heading3"]), Paragraph(t, ss["Normal"])]
    story += [Spacer(1, 10), Paragraph("Signed for and on behalf of each party (synthetic signatures omitted).", ss["Normal"])]
    doc.build(story)
    print("built", ref)
