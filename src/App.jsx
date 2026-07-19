import { useState, useEffect } from "react";
import { C } from "./theme/tokens.js";
import { GLOBAL_CSS } from "./styles/globalCss.js";
import { NAV } from "./data/mockData.js";
import Sidebar from "./components/shell/Sidebar.jsx";
import TopBar from "./components/shell/TopBar.jsx";
import CommandPalette from "./components/shell/CommandPalette.jsx";
import Dashboard from "./views/Dashboard.jsx";
import FrontDesk from "./views/FrontDesk.jsx";
import EMR from "./views/EMR.jsx";
import Pharmacy from "./views/Pharmacy.jsx";
import Lab from "./views/Laboratory.jsx";
import Billing from "./views/Billing.jsx";
import Analytics from "./views/Analytics.jsx";
import Placeholder from "./views/Placeholder.jsx";

const TITLES = {
  dashboard: ["Executive Dashboard", "Network overview · real-time operations"],
  frontdesk: ["Front Desk", "Patient registration & queue management"],
  emr: ["Clinical EMR", "Chinedu Okafor · Cardiology encounter"],
  pharmacy: ["Pharmacy", "Dispensing, inventory & batch tracking"],
  lab: ["Laboratory", "Modern Lab Information System (LIS)"],
  billing: ["Billing & Revenue", "Transactions, wallets & reconciliation"],
  analytics: ["Analytics", "Executive · clinical · finance · operations"],
};


export default function App() {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); }
      if (e.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const PAGES = { dashboard: Dashboard, frontdesk: FrontDesk, emr: EMR, pharmacy: Pharmacy, lab: Lab, billing: Billing, analytics: Analytics };
  const Page = PAGES[active] || (() => <Placeholder id={active} />);
  const [title, sub] = TITLES[active] || [NAV.find((n) => n.id === active)?.label || "AVA HMS", "Hospital Management System"];

  return (
    <div className="ava-root" style={{ background: `linear-gradient(180deg, ${C.bg}, ${C.bgGrad})`, minHeight: "100vh", color: C.ink }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ display: "flex" }}>
        <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <TopBar onPalette={() => setPalette(true)} title={title} sub={sub} />
          <main key={active} className="ava-fade ava-scroll" style={{ padding: "22px 24px 60px", overflowY: "auto", maxWidth: 1480, width: "100%", margin: "0 auto" }}>
            <Page id={active} />
          </main>
        </div>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} go={setActive} />
    </div>
  );
}
