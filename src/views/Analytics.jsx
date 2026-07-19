import { useState } from "react";
import { BarChart3, Sparkles, TrendingUp } from "lucide-react";
import { Area, Line, BarChart, Bar, ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { C, FONT, shadow } from "../theme/tokens.js";
import { revTrend, deptVol } from "../data/mockData.js";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Pill_ from "../components/ui/Pill.jsx";
import SectionHead from "../components/ui/SectionHead.jsx";

function Analytics() {
  const [view, setView] = useState("Executive");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>{["Executive", "Clinical", "Finance", "Operations"].map((v) => <Pill_ key={v} active={view === v} onClick={() => setView(v)}>{v}</Pill_>)}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        <Card>
          <SectionHead icon={TrendingUp} title="Revenue Trend & Forecast" sub="Actuals vs AI projection · 12 months" right={<Badge color={C.violet} bg={C.violetSoft}><Sparkles size={11} /> Forecast on</Badge>} />
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revTrend}>
                <defs>
                  <linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.blue} stopOpacity={0.28} /><stop offset="100%" stopColor={C.blue} stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderSoft} vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: C.ink3 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.ink3 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12, boxShadow: shadow.raised }} />
                <Area type="monotone" dataKey="rev" stroke={C.blue} strokeWidth={2.5} fill="url(#ar)" name="Actual (₦M)" />
                <Line type="monotone" dataKey="proj" stroke={C.violet} strokeWidth={2} strokeDasharray="5 4" dot={false} name="Forecast (₦M)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <SectionHead icon={BarChart3} title="Patient Throughput" sub="By department · this week" />
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptVol} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderSoft} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: C.ink3 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="d" tick={{ fontSize: 11, fill: C.ink2 }} axisLine={false} tickLine={false} width={56} />
                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} cursor={{ fill: C.surface2 }} />
                <Bar dataKey="v" radius={[0, 6, 6, 0]} barSize={16}>{deptVol.map((_, i) => <Cell key={i} fill={[C.blue, C.violet, C.cyan, C.emerald, C.amber, C.pink][i]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[["Avg. Wait Time", "14m", "−3m WoW", C.blue], ["Bed Turnover", "2.4d", "−0.3d", C.emerald], ["Drug Consumption", "8.2k", "+6%", C.violet], ["Claim Rejection", "9.1%", "+1.4pts", C.amber]].map(([l, v, d, c], i) => (
          <Card key={l} delay={i * 50} pad={16}>
            <div style={{ fontSize: 12, color: C.ink3, fontWeight: 600 }}>{l}</div>
            <div style={{ fontFamily: FONT.display, fontSize: 24, fontWeight: 800, color: C.ink, margin: "4px 0" }}>{v}</div>
            <Badge color={c} bg={c + "12"}>{d}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}


export default Analytics;
