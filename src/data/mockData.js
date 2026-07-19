import {
  LayoutDashboard, ClipboardList, Stethoscope, Pill, FlaskConical, Receipt, BedDouble, ShieldCheck, Boxes, Wallet, BarChart3, FileText, Building2, Users, Settings, UserRound
} from "lucide-react";

// Color palette for charts and UI
export const C = {
  blue: "#3b82f6",
  emerald: "#10b981",
  violet: "#8b5cf6",
  cyan: "#06b6d4",
  amber: "#f59e0b",
  pink: "#ec4899",
  red: "#ef4444",
};

export const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "frontdesk", label: "Front Desk", icon: ClipboardList },
  { id: "patients", label: "Patients", icon: UserRound },
  { id: "emr", label: "Clinical EMR", icon: Stethoscope },
  { id: "pharmacy", label: "Pharmacy", icon: Pill },
  { id: "lab", label: "Laboratory", icon: FlaskConical },
  { id: "billing", label: "Billing & Revenue", icon: Receipt },
  { id: "ward", label: "Ward Management", icon: BedDouble },
  { id: "hmo", label: "HMO Management", icon: ShieldCheck },
  { id: "supply", label: "Supply Chain", icon: Boxes },
  { id: "finance", label: "Finance", icon: Wallet },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "facilities", label: "Facilities", icon: Building2 },
  { id: "users", label: "Users & Roles", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

export const revTrend = Array.from({ length: 12 }, (_, i) => ({
  m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  rev: Math.round(120 + Math.sin(i / 1.5) * 40 + i * 12),
  proj: Math.round(130 + Math.sin(i / 1.5) * 38 + i * 14),
}));
export const deptVol = [
  { d: "Cardio", v: 320 }, { d: "Ortho", v: 280 }, { d: "Peds", v: 240 },
  { d: "OB/GYN", v: 360 }, { d: "Derma", v: 140 }, { d: "ENT", v: 180 },
];
