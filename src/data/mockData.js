import { LayoutDashboard, Hospital } from "lucide-react";

/**
 * Admin console navigation — the single source of nav items, shared by the
 * Sidebar and the ⌘K command palette (mirrors the customer app's data/NAV).
 */
export const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "hospitals", label: "Hospitals", icon: Hospital },
];
