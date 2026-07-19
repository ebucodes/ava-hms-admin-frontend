import React from "react";
import { Sparkles } from "lucide-react";
import { C, FONT } from "../theme/tokens.js";
import { NAV } from "../data/mockData.js";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";

/**
 * A lightweight, per-module "dummy" dashboard used for modules that don't yet
 * have a full implementation. Gives each module its own landing surface —
 * header, a row of placeholder KPI tiles, and a description of what's coming —
 * so a user whose permissions land them here sees a real page, not a stub.
 */

const MODULE_META = {
  emr: {
    blurb: "Clinical timeline, vitals trending, prescriptions and lab/imaging history in one encounter view.",
    tiles: ["Open Encounters", "Notes Today", "Pending Orders", "Avg. Consult"],
  },
  pharmacy: {
    blurb: "Dispensing workflow, batch & expiry tracking, reorder alerts and inventory health across facilities.",
    tiles: ["To Dispense", "Low Stock", "Expiring Soon", "Dispensed Today"],
  },
  lab: {
    blurb: "Sample tracking, worklist, critical-value flagging and result turnaround reporting.",
    tiles: ["Worklist", "Awaiting Specimen", "Critical Flags", "Results Today"],
  },
  billing: {
    blurb: "Bills, charges, payments, wallets and HMO claim reconciliation across the network.",
    tiles: ["Open Bills", "Unsettled", "Wallet Balance", "Collected Today"],
  },
  ward: {
    blurb: "Bed management across ICU, Emergency, General & Private — with admissions and drug charts.",
    tiles: ["Beds Occupied", "Free Beds", "Admissions", "Discharges"],
  },
  hmo: {
    blurb: "Authorization workspace: payers, tariffs, authorized vs denied items and claim history.",
    tiles: ["Pending Auth", "Approved", "Denied", "Active Payers"],
  },
  supply: {
    blurb: "Warehouse overview, stock levels, purchase orders and inter-facility transfers.",
    tiles: ["SKUs", "Reorder Points", "Open POs", "In Transit"],
  },
  finance: {
    blurb: "P&L, cash flow, AR/AP, budget tracking and executive financial reporting.",
    tiles: ["Revenue (MTD)", "Payables", "Receivables", "Net Position"],
  },
  reports: {
    blurb: "Scheduled and ad-hoc reporting across clinical, financial and operational domains.",
    tiles: ["Saved Reports", "Scheduled", "Run Today", "Exports"],
  },
  facilities: {
    blurb: "Facility registry, capacity planning and asset tracking for every site on the network.",
    tiles: ["Facilities", "Total Beds", "Assets", "Online"],
  },
  settings: {
    blurb: "Workspace configuration, integrations, module toggles, security and sync policy.",
    tiles: ["Modules On", "Integrations", "Members", "Roles"],
  },
};

function ModuleDashboard({ id }) {
  const item = NAV.find((n) => n.id === id);
  const meta = MODULE_META[id] || {
    blurb: "This module is part of the AVA HMS specification.",
    tiles: ["—", "—", "—", "—"],
  };
  const Icon = item?.icon;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 13, background: C.blueSoft, display: "grid", placeItems: "center" }}>
          {Icon && <Icon size={24} color={C.blue} />}
        </div>
        <div>
          <h2 style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, color: C.ink, margin: 0, letterSpacing: "-.02em" }}>
            {item?.label || "Module"}
          </h2>
          <p style={{ fontSize: 13, color: C.ink3, margin: "3px 0 0" }}>{meta.blurb}</p>
        </div>
      </div>

      <div className="ava-grid-4" style={{ display: "grid", gap: 14 }}>
        {meta.tiles.map((label, i) => (
          <Card key={label + i} pad={16}>
            <div style={{ fontSize: 12, color: C.ink3, fontWeight: 600 }}>{label}</div>
            <div style={{ fontFamily: FONT.display, fontSize: 26, fontWeight: 800, color: C.ink4, marginTop: 8 }}>—</div>
          </Card>
        ))}
      </div>

      <Card pad={36} style={{ textAlign: "center" }}>
        <Badge color={C.violet} bg={C.violetSoft}>
          <Sparkles size={11} /> Dashboard scaffold · full module coming soon
        </Badge>
        <p style={{ fontSize: 13, color: C.ink2, lineHeight: 1.6, margin: "14px auto 0", maxWidth: 520 }}>
          Live {item?.label?.toLowerCase() || "module"} data will populate these tiles once the module ships.
          You're seeing this because your role has access to it.
        </p>
      </Card>
    </div>
  );
}

export default ModuleDashboard;
