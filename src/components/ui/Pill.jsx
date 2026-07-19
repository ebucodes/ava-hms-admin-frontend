import { C, FONT } from "../../theme/tokens.js";

function Pill_({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: FONT.body, fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 10,
      border: `1px solid ${active ? C.blue : C.border}`, cursor: "pointer",
      background: active ? C.blue : C.surface, color: active ? "#fff" : C.ink2,
      transition: ".18s", boxShadow: active ? "0 2px 10px rgba(47,107,255,.25)" : "none",
    }}>{children}</button>
  );
}


export default Pill_;
