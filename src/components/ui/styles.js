import { C } from "../../theme/tokens.js";

export const iconBtn = {
  width: 38, height: 38, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface,
  display: "grid", placeItems: "center", cursor: "pointer",
};
export const chipBtn = { padding: "7px 12px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface, color: C.ink2, fontSize: 12, fontWeight: 600, cursor: "pointer" };
export const td = { padding: "13px 18px", borderBottom: `1px solid ${C.borderSoft}`, color: C.ink2 };
