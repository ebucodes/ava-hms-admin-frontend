import { useEffect, useState } from "react";
import { Users, ClipboardList, Building2, UserRound } from "lucide-react";
import { C, FONT, shadow } from "../theme/tokens.js";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import { useAuth } from "../lib/auth/AuthContext.jsx";
import { listPatients } from "../lib/api/patients.js";
import { listUsers } from "../lib/api/users.js";
import { listQueue } from "../lib/api/queue.js";
import { getTenant } from "../lib/api/companies.js";
import { ApiError } from "../lib/api/client.js";

function Dashboard() {
  const { user, companySlug } = useAuth();
  const [dateTime, setDateTime] = useState("");
  const [stats, setStats] = useState({ patients: null, staff: null, queue: null, facilities: null });
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const day = days[now.getDay()];
      const date = now.getDate();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setDateTime(`${day} · ${String(date).padStart(2, "0")} ${String(month).padStart(2, "0")} ${year} · ${time}`);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!companySlug) return;
    setLoading(true);
    Promise.all([
      listPatients(companySlug, { per_page: 1 }).then((d) => d.pagination?.total ?? 0),
      listUsers(companySlug, { per_page: 1 }).then((d) => d.pagination?.total ?? 0),
      listQueue(companySlug).then((d) => d.items || []),
      getTenant(companySlug).then((c) => c.facilities || []),
    ])
      .then(([patientsTotal, staffTotal, queueItems, facilityList]) => {
        setStats({
          patients: patientsTotal,
          staff: staffTotal,
          queue: queueItems.length,
          facilities: facilityList.length,
        });
        setFacilities(facilityList);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, [companySlug]);

  const tiles = [
    ["Total Patients", stats.patients, C.blue, UserRound],
    ["Total Staff", stats.staff, C.violet, Users],
    ["Patients in Queue", stats.queue, C.amber, ClipboardList],
    ["Facilities", stats.facilities, C.emerald, Building2],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* hero */}
      <div className="ava-rise" style={{ borderRadius: 18, padding: "22px 24px", position: "relative", overflow: "hidden", background: `linear-gradient(115deg, ${C.ink} 0%, #18204a 55%, ${C.blueDeep} 130%)`, boxShadow: shadow.raised }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 260, height: 260, borderRadius: 999, background: "radial-gradient(circle, rgba(123,92,255,.35), transparent 70%)" }} />
        <div style={{ position: "absolute", right: 120, bottom: -60, width: 200, height: 200, borderRadius: 999, background: "radial-gradient(circle, rgba(47,107,255,.3), transparent 70%)" }} />
        <div style={{ position: "relative" }}>
          <Badge color="#bcd0ff" bg="rgba(255,255,255,.1)" dot>{dateTime || "Loading…"}</Badge>
          <h1 style={{ fontFamily: FONT.display, fontSize: 27, fontWeight: 800, color: "#fff", margin: "12px 0 4px", letterSpacing: "-.03em" }}>
            Welcome back, {user?.name || "there"} 👋
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.72)", maxWidth: 560, lineHeight: 1.5 }}>
            {companySlug} · signed in as {user?.roles?.[0] || "member"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="ava-grid-4" style={{ display: "grid", gap: 14 }}>
        {tiles.map(([label, value, color, Icon], i) => (
          <Card key={label} delay={i * 50} pad={15}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: color + "15", display: "grid", placeItems: "center" }}>
                <Icon size={15} color={color} />
              </div>
              <span style={{ fontSize: 12, color: C.ink3, fontWeight: 600 }}>{label}</span>
            </div>
            <div style={{ fontFamily: FONT.display, fontSize: 24, fontWeight: 800, color: C.ink }}>
              {loading || error ? "—" : value}
            </div>
          </Card>
        ))}
      </div>

      {error && (
        <Card pad={16}>
          <span style={{ color: C.red, fontSize: 13 }}>{error}</span>
        </Card>
      )}

      {/* Facilities */}
      <Card pad={0}>
        <div style={{ padding: "15px 18px", borderBottom: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: C.blueSoft, display: "grid", placeItems: "center" }}>
            <Building2 size={16} color={C.blue} />
          </div>
          <div>
            <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700, color: C.ink }}>Facilities</div>
            <div style={{ fontSize: 11.5, color: C.ink3 }}>Registered locations for this hospital network</div>
          </div>
        </div>
        <div>
          {loading && <div style={{ padding: 16, color: C.ink3, fontSize: 13 }}>Loading facilities…</div>}
          {!loading && !error && facilities.length === 0 && (
            <div style={{ padding: 16, color: C.ink3, fontSize: 13 }}>No facilities registered yet.</div>
          )}
          {!loading && facilities.map((f) => (
            <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 18px", borderBottom: `1px solid ${C.borderSoft}`, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink, display: "flex", alignItems: "center", gap: 8 }}>
                  {f.name}
                  {f.is_main && <Badge color={C.blue} bg={C.blueSoft}>Main</Badge>}
                </div>
                <div style={{ fontSize: 11.5, color: C.ink3, marginTop: 2 }}>
                  {f.type}{f.address ? ` · ${f.address}` : ""}
                </div>
              </div>
              <Badge color={f.status === "active" ? C.emerald : C.ink3} bg={(f.status === "active" ? C.emerald : C.ink3) + "14"} dot>
                {f.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default Dashboard;
