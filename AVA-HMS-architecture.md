# AVA HMS — Production Frontend Architecture

A reference architecture for lifting the prototype into a real **Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + Framer Motion + Recharts + TanStack Table + React Hook Form + Zod + Zustand + React Query** codebase. The prototype (`AVA-HMS-prototype.jsx`) is the visual source of truth; this document is the skeleton your team builds against.

---

## 1. Folder Structure

```
ava-hms/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx                 # minimal, no shell
│   ├── (app)/
│   │   ├── layout.tsx                 # AppShell: sidebar + topbar + providers
│   │   ├── dashboard/page.tsx
│   │   ├── front-desk/
│   │   │   ├── page.tsx               # queue + analytics
│   │   │   └── register/page.tsx      # multi-step workflow
│   │   ├── emr/
│   │   │   ├── page.tsx               # patient search / worklist
│   │   │   └── [patientId]/page.tsx   # 3-column workspace
│   │   ├── pharmacy/page.tsx
│   │   ├── laboratory/page.tsx
│   │   ├── billing/page.tsx
│   │   ├── ward/page.tsx
│   │   ├── hmo/page.tsx
│   │   ├── supply-chain/page.tsx
│   │   ├── finance/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── facilities/page.tsx
│   │   ├── users/page.tsx
│   │   └── settings/page.tsx
│   ├── api/                           # route handlers / BFF (optional)
│   ├── globals.css                    # Tailwind + CSS variables (design tokens)
│   └── layout.tsx                     # root: fonts, theme, html lang
│
├── components/
│   ├── ui/                            # shadcn/ui primitives (generated)
│   │   ├── button.tsx  card.tsx  badge.tsx  dialog.tsx  table.tsx ...
│   ├── shell/
│   │   ├── app-shell.tsx
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   ├── command-palette.tsx        # cmdk
│   │   ├── facility-switcher.tsx
│   │   └── sync-indicator.tsx
│   ├── data/
│   │   ├── kpi-card.tsx
│   │   ├── smart-table.tsx            # TanStack Table wrapper
│   │   ├── status-badge.tsx
│   │   ├── timeline.tsx
│   │   ├── heatmap.tsx
│   │   ├── activity-feed.tsx
│   │   └── charts/                    # Recharts wrappers (area, bar, sparkline...)
│   ├── ai/
│   │   ├── ai-insight-card.tsx
│   │   ├── ai-recommendation-panel.tsx
│   │   ├── risk-alert-widget.tsx
│   │   ├── forecast-widget.tsx
│   │   ├── predictive-trend-card.tsx
│   │   ├── confidence-badge.tsx
│   │   └── smart-notification.tsx
│   └── clinical/
│       ├── patient-card.tsx
│       ├── vitals-panel.tsx
│       ├── soap-editor.tsx
│       └── clinical-assistant.tsx
│
├── features/                          # feature-sliced domain logic
│   ├── front-desk/{api,hooks,store,schema}.ts
│   ├── emr/{api,hooks,store,schema}.ts
│   ├── pharmacy/...  laboratory/...  billing/...  etc.
│
├── lib/
│   ├── api-client.ts                  # fetch wrapper + auth + offline queue
│   ├── query-client.ts                # React Query config
│   ├── offline/                       # IndexedDB cache + sync engine
│   │   ├── db.ts                      # Dexie schema
│   │   └── sync-engine.ts
│   ├── utils.ts                       # cn(), formatters (₦, dates)
│   └── constants.ts                   # NAV, roles, statuses
│
├── stores/                            # Zustand global stores
│   ├── use-ui-store.ts                # sidebar, palette, theme
│   ├── use-facility-store.ts          # current facility, network status
│   └── use-session-store.ts
│
├── types/                             # shared TypeScript interfaces
│   ├── patient.ts  encounter.ts  pharmacy.ts  lab.ts
│   ├── billing.ts  ai.ts  facility.ts  common.ts
│
├── styles/tokens.css                  # design tokens (see §4)
├── tailwind.config.ts
└── package.json
```

---

## 2. Component Architecture

Three layers, strictly one-directional:

1. **Primitives** (`components/ui`) — unstyled-logic shadcn/ui parts (Button, Card, Dialog, Table). No business logic.
2. **Composites** (`components/data`, `components/ai`, `components/clinical`) — opinionated, themed building blocks (`KpiCard`, `AiInsightCard`, `SmartTable`, `SoapEditor`). They consume primitives + design tokens. **These map 1:1 to the components in the prototype.**
3. **Features** (`features/*`, page files) — assemble composites, own data fetching (React Query), local UI state (component state), and domain state (Zustand).

State strategy:
- **Server state** → React Query (`useQuery`/`useMutation`), keyed by `[entity, facilityId, filters]`.
- **Global UI/session state** → Zustand (`useUiStore`, `useFacilityStore`).
- **Form state** → React Hook Form + Zod resolver (registration, SOAP, claims).
- **Offline** → React Query persisted to IndexedDB; mutations enqueued by `sync-engine.ts` and flushed when `navigator.onLine`.

Every composite is a **controlled, prop-driven** component (as in the prototype) so it can be storybooked and tested in isolation.

---

## 3. Layout Architecture

```
RootLayout (fonts, ThemeProvider, html)
└── (app)/layout.tsx  →  <AppShell>
     ├── <Sidebar/>          collapsible (Zustand: ui.sidebarCollapsed)
     │     ├── nav modules (active state from usePathname)
     │     └── footer: FacilitySwitcher · SyncIndicator · UserMenu
     ├── <Topbar/>           sticky, glass (backdrop-blur)
     │     ├── GlobalSearch  → opens CommandPalette (cmdk, ⌘K)
     │     ├── AiAssistant · Notifications · QuickActions
     │     └── SyncStatus (Connected / Syncing / Offline)
     └── <main> {children} </main>   max-w container, route-keyed transitions (Framer Motion AnimatePresence)
```

Desktop-first; breakpoints collapse the sidebar to icons at `lg`, then to a drawer at `md`. The EMR three-column grid (`300px · 1fr · 320px`) collapses to stacked tabs below `xl`.

---

## 4. Design System (tokens)

Drop into `styles/tokens.css` and reference via Tailwind theme. These are the exact values used in the prototype.

```css
:root {
  /* surfaces */
  --bg: #f5f6f9;        --bg-grad: #eef1f7;
  --surface: #ffffff;   --surface-2: #fbfcfe;
  --border: #e7eaf1;    --border-soft: #eef1f6;
  /* ink */
  --ink: #0c1322;  --ink-2: #465069;  --ink-3: #8b94a8;  --ink-4: #aab1c2;
  /* clinical accents */
  --blue: #2f6bff;     --blue-deep: #1c46c7;  --blue-soft: #eef3ff;
  --emerald: #0eb47b;  --emerald-soft: #e4f7f0;
  --amber: #f3a118;    --amber-soft: #fdf2df;
  --red: #e5484d;      --red-soft: #fdecec;
  --violet: #7b5cff;   --violet-soft: #efeaff;
  --cyan: #0bbcd6;     --cyan-soft: #e2f8fb;
  /* radii + elevation */
  --r-card: 16px;  --r-control: 10px;
  --sh-card: 0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06);
  --sh-raised: 0 4px 14px rgba(16,24,40,.08), 0 1px 3px rgba(16,24,40,.05);
  --sh-pop: 0 18px 50px rgba(16,24,40,.18), 0 4px 14px rgba(16,24,40,.10);
}
```

**Typography** (load via `next/font`):
- Display / headings: **Schibsted Grotesk** (700–800, tight tracking `-0.02em`)
- Body / UI: **Hanken Grotesk** (400–700)
- Numeric / IDs / data: **IBM Plex Mono** (tabular figures for KPIs, ledger, vitals)

**Principles:** clean white surfaces over a cool off-white gradient; one dominant blue with emerald success / amber warn / red critical; soft layered shadows; glass top bar (`backdrop-blur`); large data cards with strong hierarchy; staggered fade-in-rise on mount; never Bootstrap-grid density or generic admin chrome.

**Status color map** (reused everywhere):
`occupied→blue · vacant→emerald · cleaning→amber · inspection→violet`;
`critical→red · high→amber · medium→blue · low→ink-3`.

---

## 5. Core TypeScript Interfaces

```ts
// types/common.ts
export type FacilityStatus = "online" | "syncing" | "offline";
export type SyncState = "connected" | "syncing" | "offline";
export type Severity = "info" | "warn" | "crit";
export type Trend = { up: boolean; deltaPct: number };

// types/ai.ts
export interface ConfidenceScore { value: number; band: "low" | "medium" | "high"; }
export interface AiInsight {
  id: string;
  title: string;
  body: string;
  severity: Severity;
  confidence: number;            // 0–100
  recommendedAction: string;
  estimatedImpact: string;       // e.g. "−18 min mean wait"
  ctaHref?: string;
}
export interface Forecast<T = number> {
  metric: string;
  series: { t: string; actual?: T; projected: T }[];
  horizonDays: number;
  confidence: number;
}

// types/patient.ts
export interface Patient {
  upid: string;                  // Universal Patient ID
  firstName: string; lastName: string;
  sex: "M" | "F" | "O"; ageYears: number;
  bloodGroup?: string;
  allergies: Allergy[];
  chronicConditions: string[];
  insurance?: Insurance;
  facilityId: string;
}
export interface Allergy { substance: string; severity: "Mild" | "Moderate" | "Severe"; }
export interface Insurance { provider: string; planId: string; status: "active" | "lapsed"; }
export interface Vital { label: string; value: string; unit: string; abnormal: boolean; takenAt: string; }

// types/encounter.ts
export type TimelineKind =
  | "Consultation" | "Admission" | "LabResult" | "Prescription" | "Radiology" | "Procedure";
export interface TimelineEvent {
  id: string; kind: TimelineKind; title: string;
  note: string; author: string; occurredAt: string;
}
export interface SoapNote {
  encounterId: string;
  subjective: string; objective: string; assessment: string; plan: string;
  suggestedIcd10: string[];
  signedBy?: string; signedAt?: string;
}

// types/queue.ts
export interface QueueEntry {
  upid: string; patientName: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  aiPriorityScore: number;       // 0–100
  assignedDoctor: string; department: string;
  waitMinutes: number; status: string;
}

// types/pharmacy.ts
export interface InventoryItem {
  drug: string; batchNo: string;
  stock: number; reorderPoint: number;
  expiry: string; status: "ok" | "low" | "expiring";
}

// types/lab.ts
export interface LabSample {
  id: string; patientName: string; test: string;
  machine: string; status: "Pending" | "In Progress" | "Completed" | "Critical";
  resultValue?: string; referenceRange?: string;
}

// types/billing.ts
export interface Transaction {
  id: string; patientName: string; amountKobo: number;
  method: "Card" | "Cash" | "Wallet" | "HMO Split";
  status: "Settled" | "Pending Sync" | "Awaiting Auth";
  createdAt: string;
}
export interface Wallet { upid: string; balanceKobo: number; }

// types/facility.ts
export interface Facility {
  id: string; name: string; role: string;
  status: FacilityStatus; patientVolume: number;
  inventoryHealthPct: number; connectivityPct: number; latencyMs: number | null;
}

// types/common.ts (KPI)
export interface Kpi {
  id: string; label: string; value: string;
  trend: Trend; accentVar: string;
  spark: { x: number; v: number }[];
  aiObservation: string;
}
```

---

## 6. Implementation Notes

- **Recharts wrappers** live in `components/data/charts` so chart styling (grid, axes, tooltip card) stays consistent; pass only `data` + `dataKey`. Use `ComposedChart` for actual-vs-forecast overlays.
- **SmartTable** wraps TanStack Table v8 with column defs typed to the interfaces above; supports server-side sort/filter/pagination and a virtualized body for large worklists.
- **Forms**: each multi-step flow (registration, claims) is a single RHF form with a Zod schema per step; step validation gates `next`.
- **Offline-first**: persist React Query cache to IndexedDB (Dexie); show the `SyncIndicator` state from `useFacilityStore`; queue mutations and replay on reconnect (last-write-wins or version vector per record).
- **Motion**: keep it to high-impact moments — staggered card entrance on route mount and palette/dialog spring transitions (Framer Motion). Avoid scattered micro-animations on data-dense tables.
- **Accessibility**: shadcn/ui primitives are Radix-based (focus traps, ARIA). Maintain ≥4.5:1 contrast for clinical text; never encode status by color alone (pair with label + dot).
- **Mobile (patient app, Flutter)**: mirror this token set and the AI/clinical card patterns; screens map to `Home, Appointments, Telemedicine, Lab Results, Prescriptions, Wallet, Payments, Profile, Medical History`. The web composites translate directly to Flutter widgets sharing the same color/typography scale.
