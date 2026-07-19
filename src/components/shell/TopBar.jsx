import { useState, useEffect } from "react";
import { Search, Sparkles, Bell, ChevronDown, Plus, Wifi, WifiOff, RefreshCw, Menu } from "lucide-react";
import { C, FONT } from "../../theme/tokens.js";
import { iconBtn } from "../ui/styles.js";

function initials(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}

function TopBar({ onPalette, onMenuClick, title, sub, user, onLogout }) {
  const [sync, setSync] = useState("connected");
  const [clock, setClock] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  
  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })), 1000);
    return () => clearInterval(t);
  }, []);
  
  useEffect(() => {
    const cycle = ["connected", "syncing", "connected", "connected"];
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % cycle.length; setSync(cycle[i]); }, 4200);
    return () => clearInterval(t);
  }, []);
  
  const syncMeta = {
    connected: { c: C.emerald, label: "Connected", Icon: Wifi },
    syncing: { c: C.blue, label: "Syncing…", Icon: RefreshCw },
    offline: { c: C.ink3, label: "Offline Mode", Icon: WifiOff },
  }[sync];

  const handleAIAssistant = () => {
    console.log("AI Assistant clicked");
    alert("Opening AI Assistant...");
  };

  const handleQuickAction = () => {
    console.log("Quick action clicked");
    alert("Quick Actions Menu...");
  };

  const handleNotifications = () => {
    console.log("Notifications clicked");
    alert("Opening Notifications...");
  };


  return (
    <header className="ava-topbar" style={{
      height: 64, position: "sticky", top: 0, zIndex: 25, display: "flex", alignItems: "center",
      gap: 16, padding: "0 22px", background: "rgba(255,255,255,.78)", backdropFilter: "blur(14px)",
      borderBottom: `1px solid ${C.border}`,
    }}>
      <button onClick={onMenuClick} title="Menu" className="ava-hamburger" style={{ ...iconBtn, flexShrink: 0 }}>
        <Menu size={18} color={C.ink2} />
      </button>

      <div style={{ minWidth: 0, overflow: "hidden", flex: "1 1 auto" }}>
        <div style={{ fontFamily: FONT.display, fontSize: 17, fontWeight: 700, color: C.ink, letterSpacing: "-.02em", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        <div style={{ fontSize: 11.5, color: C.ink3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>
      </div>

      {/* search */}
      <button onClick={onPalette} className="ava-topbar-search" style={{
        marginLeft: 18, flex: 1, maxWidth: 440, display: "flex", alignItems: "center", gap: 10,
        padding: "9px 14px", borderRadius: 11, border: `1px solid ${C.border}`, background: C.surface2,
        cursor: "text", color: C.ink3, transition: ".16s", transform: "scale(1)"
      }} onMouseEnter={(e) => { e.currentTarget.style.background = C.border; }} onMouseLeave={(e) => { e.currentTarget.style.background = C.surface2; }}>
        <Search size={15} style={{ flexShrink: 0 }} />
        <span className="ava-topbar-search-label" style={{ fontSize: 13, flex: 1, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Search patients, orders, records…</span>
        <kbd className="ava-topbar-search-kbd" style={{ fontFamily: FONT.mono, fontSize: 10.5, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 6, padding: "2px 6px", color: C.ink3 }}>⌘K</kbd>
      </button>

      <div style={{ flex: 1 }} />

      {/* clock display */}
      <div className="ava-topbar-clock" style={{ fontSize: 12.5, fontWeight: 600, color: C.ink2, minWidth: 85 }}>
        {clock || "--:--:--"}
      </div>

      {/* sync */}
      <div className="ava-topbar-sync" style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 11px", borderRadius: 10, background: syncMeta.c + "12" }}>
        <syncMeta.Icon size={14} color={syncMeta.c} className={sync === "syncing" ? "ava-spin" : ""} />
        <span className="ava-topbar-sync-label" style={{ fontSize: 12, fontWeight: 600, color: syncMeta.c }}>{syncMeta.label}</span>
      </div>

      {/* AI assistant */}
      <button onClick={handleAIAssistant} className="ava-topbar-ai" style={{
        display: "flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: 10, cursor: "pointer",
        border: "none", background: `linear-gradient(135deg,${C.blue},${C.violet})`, color: "#fff", fontWeight: 600, fontSize: 12.5,
        boxShadow: "0 4px 14px rgba(47,107,255,.3)", transition: ".16s", transform: "scale(1)"
      }} onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}>
        <Sparkles size={14} /> <span className="ava-topbar-ai-label">AI Assistant</span>
      </button>

      {/* quick action */}
      <button onClick={handleQuickAction} title="Quick actions" className="ava-topbar-quickaction" style={{...iconBtn, transition: ".16s", transform: "scale(1)"}} onMouseEnter={(e) => { e.currentTarget.style.background = C.surface2; e.currentTarget.style.transform = "scale(1.1)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "scale(1)"; }}><Plus size={17} color={C.ink2} /></button>
      
      {/* notifications */}
      <button onClick={handleNotifications} title="Notifications" style={{ ...iconBtn, position: "relative", transition: ".16s", transform: "scale(1)" }} onMouseEnter={(e) => { e.currentTarget.style.background = C.surface2; e.currentTarget.style.transform = "scale(1.1)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "scale(1)"; }}>
        <Bell size={17} color={C.ink2} />
        <span style={{ position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: 99, background: C.red, border: "1.5px solid #fff" }} />
      </button>

      <div style={{ position: "relative" }}>
        <button onClick={() => setMenuOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 8px 4px 4px", borderRadius: 99, border: `1px solid ${C.border}`, cursor: "pointer", transition: ".16s", background: "transparent", transform: "scale(1)" }} onMouseEnter={(e) => { e.currentTarget.style.background = C.surface2; e.currentTarget.style.transform = "scale(1.05)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "scale(1)"; }}>
          <div style={{ width: 28, height: 28, borderRadius: 99, background: `linear-gradient(135deg,${C.violet},${C.blue})`, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 11 }}>{initials(user?.name)}</div>
          <ChevronDown size={14} color={C.ink3} />
        </button>
        {menuOpen && (
          <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: 180, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 8px 24px rgba(16,24,40,.12)", padding: 8, zIndex: 40 }}>
            <div style={{ padding: "6px 10px 10px", borderBottom: `1px solid ${C.borderSoft}`, marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{user?.name || "Unknown user"}</div>
              <div style={{ fontSize: 11.5, color: C.ink3 }}>{user?.email}</div>
            </div>
            <button
              onClick={() => {
                setMenuOpen(false);
                onLogout?.();
              }}
              style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8, border: "none", background: "transparent", color: C.red, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.redSoft; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}


export default TopBar;
