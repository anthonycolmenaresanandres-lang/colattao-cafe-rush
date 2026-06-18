// Project data for the Colattao Community Market board (/market public showcase
// and /market/ops internal board). Single source for both views — fields tagged
// "internal" are only rendered on the PIN-gated ops board.

export type StageStatus = "done" | "next" | "todo";

export type Stage = {
  n: number;
  name: string;
  note: string;
  status: StageStatus;
};

export type Role = {
  who: string;
  owns: string;
  cadence: string;
  pay?: string; // internal only
};

export type Scenario = {
  size: string;
  gross: number;
  expenses: number; // internal only
  net: number; // internal only
};

export const MARKET = {
  name: "Colattao Community Market",
  tagline: "Monthly community bazaar · Virginia Beach",
  status: "Planning",
  updated: "Updated June 2026",

  facts: [
    "2nd Saturday, monthly",
    "9:00 AM – 1:00 PM",
    "8–12 vendors (pilot)",
    "1115 Independence Blvd",
  ],

  about:
    "A small monthly arts-and-crafts bazaar anchored by Colattao Coffee House. Local makers, crafts, flowers, and gifts set up in the marked parking patch beside the café. It runs on a fixed monthly rhythm with a hired lead — built to grow toward a coffee fest and expo.",

  theOneRule:
    "No public date is announced until four approvals are in: landlord, city / zoning, fire, and health.",

  stages: [
    { n: 1, name: "Landlord approval", note: "Send the approval packet + permission letter to the property manager.", status: "next" },
    { n: 2, name: "Site walk & map", note: "Count parking; mark drive aisles, fire lanes, and the vendor zone.", status: "todo" },
    { n: 3, name: "Neighbor tenant sign-off", note: "Support or no-objection from the surrounding stores.", status: "todo" },
    { n: 4, name: "City · zoning · fire · health", note: "Confirm permits and the food path by phone.", status: "todo" },
    { n: 5, name: "Insurance", note: "Event-liability quote — the landlord will require it.", status: "todo" },
    { n: 6, name: "Final landlord sign-off", note: "Approve the map, date, vendor count, and rules.", status: "todo" },
    { n: 7, name: "Announce & launch", note: "Go public, recruit vendors, sell a sponsor, run month one.", status: "todo" },
  ] as Stage[],

  winning: [
    "Approvals secured in order before any public date",
    "Parking, fire lanes, ADA, and tenant doors kept clear",
    "Neighbor tenants on board",
    "City sees it as a small private-property pilot",
    "Cooked food kept off the tables",
    "At least one sponsor per market",
    "Vendors pre-pay online — no cash",
    "A hired Market Manager runs it, not the owner",
  ],

  losing: [
    "Announcing a date before approvals",
    "Blocking aisles, fire lanes, or tenant entrances",
    "Cooked food with no health approval",
    "Competing with neighbor tenants without their OK",
    "No event insurance",
    "Cash handling and unclear parking",
    "The market depending on the owner",
    "No sponsor — staff costs eat the profit",
  ],

  roles: [
    { who: "Market software", owns: "Applications, approvals, reminders, QR directory, check-in, reporting", cadence: "Automated" },
    { who: "Market Manager (hired)", owns: "Runs the monthly loop end to end", cadence: "~3–4 hrs/mo + event morning", pay: "~$200 / market" },
    { who: "Parking / entry guide", owns: "Directs parking; walks customers into the bazaar", cadence: "Event morning", pay: "~$100 / market (or off-duty police ~$200–250)" },
    { who: "Owner", owns: "Approvals + sponsor relationships only", cadence: "Minutes / month" },
  ] as Role[],

  booth: [
    { label: "Pilot booth", price: "$35" },
    { label: "Standard booth", price: "$50" },
    { label: "Premium / food truck", price: "$75" },
    { label: "Sponsor", price: "$150–300" },
  ],

  // Net/expenses are internal only; public shows gross + the self-sustaining note.
  scenarios: [
    { size: "8 vendors", gross: 510, expenses: 460, net: 50 },
    { size: "12 vendors", gross: 790, expenses: 525, net: 265 },
    { size: "20 vendors (future)", gross: 1700, expenses: 1210, net: 490 },
  ] as Scenario[],

  moneyPublic:
    "The market is self-sustaining: vendor booth fees plus one sponsor cover the day's staff and supplies. Vendors pre-pay online, so there is no cash to handle.",

  moneyInternal:
    "With paid staff the small pilot runs near break-even — sell at least one sponsor per market to cover labor. Keep market money in its own ledger, separate from the $900 setup + $150/mo Fina Calle OS fee.",

  launchBudget:
    "$250–$700 to launch. Insurance + any city permit are the swing — confirm both by phone.",

  // Internal only.
  risks: [
    { risk: "Landlord says no or stalls", mitigation: "Lead with the low-risk one-page packet and small-pilot framing." },
    { risk: "City requires an event permit", mitigation: "Call first; keep it a small private-property pilot." },
    { risk: "Insurance cost unknown", mitigation: "Get a quote early — it's required for the landlord anyway." },
    { risk: "Low vendor turnout", mitigation: "Standing roster + always-open application; start at 8." },
    { risk: "Weather", mitigation: "Fixed rain date — the 3rd Saturday." },
  ],

  // Internal only.
  blockedOnOwner: [
    "Property-manager contact",
    "Site-walk photos / map with the vendor patch marked",
    "City / zoning / fire / health confirmations",
    "Insurance requirements",
    "Hire the Market Manager; line up the parking guide",
  ],

  docs: [
    "00 — Landlord approval packet",
    "01 — Site launch plan",
    "02 — Landlord permission request",
    "03 — Neighbor support package",
    "04 — Site walk checklist",
    "05 — Permit call scripts",
    "06 — Vendor layout plan",
    "07 — Winning factor checklists",
    "08 — Pilot revenue model",
    "09 — Fina Calle OS market module spec",
    "10 — Codex handoff summary",
    "11 — Approval evidence log",
    "12 — Risk register",
    "13 — Site map",
    "14 — Satellite site plan prompt",
    "15 — Monthly operating system",
    "16 — Operator role card",
    "17 — One-page summary",
    "18 — Plain-language guide",
  ],
};
