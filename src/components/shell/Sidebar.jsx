import { ChevronRight, ChevronLeft, Activity } from "lucide-react";
import { C, FONT } from "../../theme/tokens.js";
import { NAV } from "../../data/mockData.js";
import { titleCase } from "../../lib/format.js";

function initials(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}

/**
 * Admin console sidebar — same template/styling as the customer app's Sidebar,
 * but the nav is the fixed admin NAV (not permission-derived) and the footer
 * shows the platform admin rather than a tenant facility.
 */
function Sidebar({ active, setActive, collapsed, setCollapsed, admin, mobileOpen, onMobileClose }) {
  const W = collapsed ? 76 : 248;
  const expanded = !collapsed || mobileOpen;
  return (
    <aside
      className={`ava-sidebar${mobileOpen ? " ava-sidebar-open" : ""}`}
      style={{
        width: W, minWidth: W, height: "100vh", background: C.surface, borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", transition: "width .26s cubic-bezier(.4,0,.2,1)",
        position: "sticky", top: 0, zIndex: 30,
      }}
    >
      {/* brand */}
      <div style={{ height: 64, display: "flex", alignItems: "center", gap: 11, padding: "0 18px", borderBottom: `1px solid ${C.borderSoft}` }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: `linear-gradient(135deg, ${C.ink}, ${C.violet})`, display: "grid", placeItems: "center",
          boxShadow: "0 4px 12px rgba(47,107,255,.35)",
        }}>
          <Activity size={18} color="#fff" strokeWidth={2.6} />
        </div>
        {expanded && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 17, color: C.ink, letterSpacing: "-.02em", lineHeight: 1 }}>AVA <span style={{ color: C.blue }}>Admin</span></div>
            <div style={{ fontSize: 9.5, color: C.ink3, letterSpacing: ".14em", fontWeight: 600, marginTop: 2 }}>PLATFORM</div>
          </div>
        )}
      </div>

      {/* nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 12px 8px", display: "flex", flexDirection: "column", gap: 2 }} className="ava-scroll">
        {NAV.map((n) => {
          const on = active === n.id;
          const Icon = n.icon;
          return (
            <button key={n.id} onClick={() => setActive(n.id)} title={expanded ? "" : n.label}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: expanded ? "9px 12px" : "10px",
                borderRadius: 11, border: "none", cursor: "pointer", position: "relative",
                background: on ? C.blueSoft : "transparent", justifyContent: expanded ? "flex-start" : "center",
                transition: ".16s", width: "100%",
              }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = C.surface2; }}
              onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}
            >
              {on && <span style={{ position: "absolute", left: -12, top: 8, bottom: 8, width: 3, borderRadius: 4, background: C.blue }} />}
              <Icon size={18} color={on ? C.blue : C.ink3} strokeWidth={on ? 2.4 : 2} style={{ flexShrink: 0 }} />
              {expanded && (
                <span style={{ fontFamily: FONT.body, fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? C.ink : C.ink2, flex: 1, textAlign: "left", letterSpacing: "-.005em" }}>{n.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* footer */}
      <div style={{ borderTop: `1px solid ${C.borderSoft}`, padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: expanded ? "2px 4px" : 0, justifyContent: expanded ? "flex-start" : "center" }}>
          <div style={{ width: 32, height: 32, borderRadius: 99, background: `linear-gradient(135deg,${C.violet},${C.blue})`, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{initials(admin?.name)}</div>
          {expanded && (
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{admin?.name || "—"}</div>
              <div style={{ fontSize: 11, color: C.ink3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{titleCase(admin?.role) || "System Admin"}</div>
            </div>
          )}
        </div>
        <button className="ava-collapse-btn" onClick={() => setCollapsed(!collapsed)} style={{
          marginTop: 10, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "7px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface, cursor: "pointer",
          color: C.ink3, fontSize: 12, fontWeight: 600,
        }}>
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> Collapse</>}
        </button>
        <button
          onClick={onMobileClose}
          className="ava-sidebar-close-btn"
          style={{
            marginTop: 8, width: "100%", display: "none", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "7px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface, cursor: "pointer",
            color: C.ink3, fontSize: 12, fontWeight: 600,
          }}
        >
          Close menu
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
