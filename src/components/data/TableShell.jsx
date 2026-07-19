import React from "react";
import { Filter } from "lucide-react";
import { C, FONT } from "../../theme/tokens.js";
import { chipBtn } from "../ui/styles.js";
import Card from "../ui/Card.jsx";

function TableShell({ cols, children, title, sub, icon, right }) {
  return (
    <Card pad={0}>
      <div style={{ padding: "15px 18px", borderBottom: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          {icon && <div style={{ width: 32, height: 32, borderRadius: 9, background: C.blueSoft, display: "grid", placeItems: "center" }}>{React.createElement(icon, { size: 16, color: C.blue })}</div>}
          <div><div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700, color: C.ink }}>{title}</div>{sub && <div style={{ fontSize: 11.5, color: C.ink3 }}>{sub}</div>}</div>
        </div>
        {right || <button style={chipBtn}><Filter size={13} style={{ verticalAlign: "-2px" }} /> Filter</button>}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr>{cols.map((c) => <th key={c} style={{ textAlign: "left", padding: "11px 18px", fontSize: 10.5, fontWeight: 700, color: C.ink3, letterSpacing: ".06em", borderBottom: `1px solid ${C.borderSoft}`, whiteSpace: "nowrap" }}>{c.toUpperCase()}</th>)}</tr></thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </Card>
  );
}


export default TableShell;
