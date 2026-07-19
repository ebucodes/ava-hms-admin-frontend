import { C } from "../../theme/tokens.js";

function Badge({ children, color = C.ink2, bg, dot, style }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600,
      color, background: bg || "transparent", padding: bg ? "3px 9px" : 0, borderRadius: 999,
      letterSpacing: ".01em", ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 99, background: color }} />}
      {children}
    </span>
  );
}


export default Badge;
