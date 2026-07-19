import { X } from "lucide-react";
import { C, FONT, shadow } from "../../theme/tokens.js";

function Modal({ open, onClose, title, sub, children, width = 480 }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(12,19,34,.45)", zIndex: 100,
        display: "grid", placeItems: "center", padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ava-rise"
        style={{
          width: "100%", maxWidth: width, maxHeight: "88vh", overflowY: "auto",
          background: C.surface, borderRadius: 18, boxShadow: shadow.pop,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "18px 20px", borderBottom: `1px solid ${C.borderSoft}` }}>
          <div>
            <div style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 700, color: C.ink }}>{title}</div>
            {sub && <div style={{ fontSize: 12, color: C.ink3, marginTop: 3 }}>{sub}</div>}
          </div>
          <button
            onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: 9, border: "none", background: C.surface2, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}
          >
            <X size={15} color={C.ink3} />
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
