import { C, FONT } from "../../theme/tokens.js";

function SectionHead({ icon: Icon, title, sub, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        {Icon && (
          <div style={{ width: 34, height: 34, borderRadius: 10, background: C.blueSoft, display: "grid", placeItems: "center" }}>
            <Icon size={17} color={C.blue} />
          </div>
        )}
        <div>
          <div style={{ fontFamily: FONT.display, fontSize: 16.5, fontWeight: 700, color: C.ink, letterSpacing: "-.01em" }}>{title}</div>
          {sub && <div style={{ fontSize: 12.5, color: C.ink3, marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}


export default SectionHead;
