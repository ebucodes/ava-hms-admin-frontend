import { useState } from "react";
import { FlaskConical, ShieldCheck, Sparkles, Command, Plus, ArrowRight } from "lucide-react";
import { C, FONT, shadow } from "../../theme/tokens.js";
import { NAV } from "../../data/mockData.js";

function CommandPalette({ open, onClose, go }) {
  const [q, setQ] = useState("");
  const cmds = [
    ...NAV.map((n) => ({ ...n, group: "Navigate" })),
    { id: "newpatient", label: "Register New Patient", icon: Plus, group: "Actions" },
    { id: "neworder", label: "Create Lab Order", icon: FlaskConical, group: "Actions" },
    { id: "claim", label: "Submit HMO Claim", icon: ShieldCheck, group: "Actions" },
    { id: "askai", label: "Ask AVA Intelligence…", icon: Sparkles, group: "AI" },
  ];
  const filt = cmds.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(12,19,34,.42)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", paddingTop: "12vh" }} className="ava-fade">
      <div onClick={(e) => e.stopPropagation()} style={{ width: 600, maxWidth: "92vw", height: "fit-content", background: C.surface, borderRadius: 18, boxShadow: shadow.pop, overflow: "hidden", border: `1px solid ${C.border}` }} className="ava-pop">
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: `1px solid ${C.borderSoft}` }}>
          <Command size={18} color={C.blue} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a command or search…"
            style={{ flex: 1, border: "none", outline: "none", fontSize: 15, fontFamily: FONT.body, color: C.ink, background: "transparent" }} />
          <kbd style={{ fontFamily: FONT.mono, fontSize: 11, color: C.ink3, border: `1px solid ${C.border}`, borderRadius: 6, padding: "2px 7px" }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 380, overflowY: "auto", padding: 8 }} className="ava-scroll">
          {["AI", "Actions", "Navigate"].map((grp) => {
            const items = filt.filter((c) => c.group === grp);
            if (!items.length) return null;
            return (
              <div key={grp} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: C.ink3, letterSpacing: ".1em", padding: "8px 12px 4px" }}>{grp.toUpperCase()}</div>
                {items.map((c) => (
                  <button key={c.id} onClick={() => { go(c.id); onClose(); }} className="ava-cmd"
                    style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: grp === "AI" ? C.violetSoft : C.surface2, display: "grid", placeItems: "center" }}>
                      <c.icon size={15} color={grp === "AI" ? C.violet : C.ink2} />
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: C.ink, flex: 1 }}>{c.label}</span>
                    <ArrowRight size={14} color={C.ink4} />
                  </button>
                ))}
              </div>
            );
          })}
          {!filt.length && <div style={{ padding: 30, textAlign: "center", color: C.ink3, fontSize: 13 }}>No matches for "{q}"</div>}
        </div>
      </div>
    </div>
  );
}


export default CommandPalette;
