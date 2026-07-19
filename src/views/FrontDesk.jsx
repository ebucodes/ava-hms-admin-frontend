import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Users, Plus, Activity, Clock, ScanLine, CircleUserRound, ClipboardCheck } from "lucide-react";
import { C, FONT } from "../theme/tokens.js";
import { chipBtn, td } from "../components/ui/styles.js";
import Card from "../components/ui/Card.jsx";
import TableShell from "../components/data/TableShell.jsx";
import PatientRegistrationModal from "../components/frontdesk/PatientRegistrationModal.jsx";
import { useAuth } from "../lib/auth/AuthContext.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { listQueue, updateQueueStatus } from "../lib/api/queue.js";
import { getTenant } from "../lib/api/companies.js";
import { ApiError } from "../lib/api/client.js";

const STATUS_OPTIONS = ["waiting", "consulting", "completed", "cancelled"];

function timeAgo(iso) {
  if (!iso) return "—";
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  return `${Math.round(mins / 60)}h`;
}

function FrontDesk() {
  const { companySlug } = useAuth();
  const { showToast } = useToast();
  const [queue, setQueue] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadQueue = useCallback(async () => {
    try {
      const data = await listQueue(companySlug);
      setQueue(data.items || []);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load queue");
    }
  }, [companySlug]);

  useEffect(() => {
    if (!companySlug) return;
    setLoading(true);
    Promise.all([
      listQueue(companySlug).then((data) => setQueue(data.items || [])),
      getTenant(companySlug)
        .then((company) => setFacilities(company.facilities || []))
        .catch(() => setFacilities([])),
    ])
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load front desk data"))
      .finally(() => setLoading(false));
  }, [companySlug]);

  const handleStatusChange = async (queueItemId, status) => {
    try {
      await updateQueueStatus(companySlug, queueItemId, status);
      showToast("Queue status updated", "success", 2000);
      loadQueue();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to update status", "error", 4000);
    }
  };

  const stats = [
    ["Queue Length", String(queue.length), C.amber, Users],
    ["Waiting", String(queue.filter((q) => q.status === "waiting").length), C.blue, Clock],
    ["In Consultation", String(queue.filter((q) => q.status === "consulting").length), C.violet, Activity],
    ["Completed Today", String(queue.filter((q) => q.status === "completed").length), C.emerald, ClipboardCheck],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="ava-grid-4" style={{ display: "grid", gap: 14 }}>
        {stats.map(([l, v, c, I], i) => (
          <Card key={l} delay={i * 50} pad={15}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}><div style={{ width: 30, height: 30, borderRadius: 8, background: c + "15", display: "grid", placeItems: "center" }}><I size={15} color={c} /></div><span style={{ fontSize: 12, color: C.ink3, fontWeight: 600 }}>{l}</span></div>
            <div style={{ fontFamily: FONT.display, fontSize: 24, fontWeight: 800, color: C.ink }}>{v}</div>
          </Card>
        ))}
      </div>

      <div className="ava-fd-layout" style={{ display: "grid", gap: 16, alignItems: "start" }}>
        <TableShell icon={ClipboardList} title="Live Patient Queue" sub="Front desk check-in order" cols={["Patient", "Status", "Facility", "Reason", "Waited"]}
          right={<button onClick={() => setModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 9, border: "none", background: C.blue, color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}><Plus size={14} /> Register</button>}>
          {loading && (
            <tr><td style={td} colSpan={5}>Loading queue…</td></tr>
          )}
          {!loading && error && (
            <tr><td style={{ ...td, color: C.red }} colSpan={5}>{error}</td></tr>
          )}
          {!loading && !error && queue.length === 0 && (
            <tr><td style={{ ...td, color: C.ink3 }} colSpan={5}>No patients in the queue right now.</td></tr>
          )}
          {!loading && !error && queue.map((q) => {
            const patient = q.encounter?.patient;
            const facility = q.encounter?.facility;
            return (
              <tr key={q.id} className="ava-row">
                <td style={td}>
                  <div style={{ fontWeight: 700, color: C.ink }}>{patient?.full_name || "Unknown patient"}</div>
                  <div style={{ fontSize: 11, color: C.ink3, fontFamily: FONT.mono }}>{patient?.patient_number}</div>
                </td>
                <td style={td}>
                  <select
                    value={q.status}
                    onChange={(e) => handleStatusChange(q.id, e.target.value)}
                    style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 8px", fontSize: 12, fontWeight: 600, color: C.ink2, background: C.surface2, cursor: "pointer" }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td style={td}>{facility?.name || "—"}</td>
                <td style={td}>{q.encounter?.reason || "—"}</td>
                <td style={{ ...td, fontFamily: FONT.mono, color: C.ink }}>{timeAgo(q.checked_in_at)}</td>
              </tr>
            );
          })}
        </TableShell>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card pad={16}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.ink3, letterSpacing: ".06em", marginBottom: 12 }}>QUICK ACTIONS</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...chipBtn, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><ScanLine size={13} /> OCR Upload</button>
              <button style={{ ...chipBtn, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><CircleUserRound size={13} /> Biometric</button>
            </div>
          </Card>
        </div>
      </div>

      <PatientRegistrationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        facilities={facilities}
        onRegistered={loadQueue}
      />
    </div>
  );
}

export default FrontDesk;
