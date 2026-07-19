import React from "react";
import { Sparkles } from "lucide-react";
import { C, FONT } from "../theme/tokens.js";
import { NAV } from "../data/mockData.js";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";

function Placeholder({ id }) {
  const item = NAV.find((n) => n.id === id);
  const blurbs = {
    emr: "Clinical timeline, vitals trending, AI-assisted differential diagnosis, drug-interaction checks and lab/imaging history in one encounter view.",
    pharmacy: "Dispensing workflow, batch & expiry tracking, reorder-point alerts and inventory health across every facility.",
    lab: "Modern Lab Information System (LIS): sample tracking, analyzer integration, critical-value flagging and result turnaround reporting.",
    billing: "Transactions, wallets, HMO claim reconciliation and revenue reporting across the network.",
    ward: "Bed-management board across ICU, Emergency, General, Pediatrics & Private — with cleaning status, MAR timeline, and a digital audit trail of every dose.",
    hmo: "Split-layout authorization workspace: treatment plans, authorized vs denied items, approval history, coverage verification and full audit logs.",
    supply: "Warehouse overview, inventory levels, purchase orders, inter-facility transfers, vendors and requisitions — visualizing stock movement across the network.",
    finance: "CFO cockpit: P&L, cash flow, AR/AP, budget tracking, bank balances and AI financial forecasts with executive drill-downs.",
    reports: "Scheduled and ad-hoc reporting across clinical, financial and operational domains with export to PDF, Excel and regulatory formats.",
    facilities: "Facility registry, capacity planning, asset & equipment tracking, and connectivity health for every site on the network.",
    settings: "Workspace configuration, integrations, sync & offline policy, security, and AVA Intelligence tuning controls.",
  };
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
      <Card style={{ maxWidth: 520, textAlign: "center" }} pad={36}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: C.blueSoft, display: "grid", placeItems: "center", margin: "0 auto 18px" }}>{item && React.createElement(item.icon, { size: 28, color: C.blue })}</div>
        <h2 style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: "-.02em" }}>{item?.label}</h2>
        <p style={{ fontSize: 13.5, color: C.ink2, lineHeight: 1.6, marginTop: 10 }}>{blurbs[id] || "This module is part of the AVA HMS specification."}</p>
        <Badge color={C.violet} bg={C.violetSoft} style={{ marginTop: 16 }}><Sparkles size={11} /> Designed · ready for implementation</Badge>
      </Card>
    </div>
  );
}


export default Placeholder;
