import { useCallback, useEffect, useRef, useState } from "react";
import { UserRound, Plus, Pencil, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { C, FONT } from "../theme/tokens.js";
import { td } from "../components/ui/styles.js";
import Badge from "../components/ui/Badge.jsx";
import TableShell from "../components/data/TableShell.jsx";
import PatientFormModal from "../components/patients/PatientFormModal.jsx";
import { useAuth } from "../lib/auth/AuthContext.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { listPatients, getPatient } from "../lib/api/patients.js";
import { getTenant } from "../lib/api/companies.js";
import { ApiError } from "../lib/api/client.js";

function age(dob) {
  if (!dob) return "—";
  const diff = Date.now() - new Date(dob).getTime();
  return `${Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))}y`;
}

function Patients() {
  const { companySlug } = useAuth();
  const { showToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const debounceRef = useRef(null);

  const load = useCallback(async (q, p) => {
    setLoading(true);
    try {
      const data = await listPatients(companySlug, { q, per_page: 15, page: p });
      setPatients(data.items || []);
      setPagination(data.pagination || { current_page: 1, last_page: 1, total: 0 });
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, [companySlug]);

  useEffect(() => {
    if (!companySlug) return;
    getTenant(companySlug)
      .then((company) => setFacilities(company.facilities || []))
      .catch(() => setFacilities([]));
  }, [companySlug]);

  useEffect(() => {
    if (!companySlug) return;
    load(search, page);
  }, [companySlug, page, load]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      load(value, 1);
    }, 400);
  };

  const openCreate = () => {
    setEditingPatient(null);
    setModalOpen(true);
  };

  const openEdit = async (patient) => {
    try {
      const fresh = await getPatient(companySlug, patient.id);
      setEditingPatient(fresh);
      setModalOpen(true);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to load patient", "error", 4000);
    }
  };

  const refresh = () => load(search, page);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <TableShell
        icon={UserRound}
        title="Patients"
        sub="Patient directory & records"
        cols={["Patient", "Contact", "Blood Group", "Facility", "Status", "Actions"]}
        right={
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 160px", minWidth: 140 }}>
              <Search size={14} color={C.ink3} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input
                value={search}
                onChange={handleSearchChange}
                placeholder="Search patients…"
                style={{ width: "100%", boxSizing: "border-box", padding: "7px 10px 7px 30px", borderRadius: 9, border: `1px solid ${C.border}`, fontSize: 12.5 }}
              />
            </div>
            <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 9, border: "none", background: C.blue, color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              <Plus size={14} /> Add Patient
            </button>
          </div>
        }
      >
        {loading && (
          <tr><td style={td} colSpan={6}>Loading patients…</td></tr>
        )}
        {!loading && error && (
          <tr><td style={{ ...td, color: C.red }} colSpan={6}>{error}</td></tr>
        )}
        {!loading && !error && patients.length === 0 && (
          <tr><td style={{ ...td, color: C.ink3 }} colSpan={6}>No patients found.</td></tr>
        )}
        {!loading && !error && patients.map((p) => (
          <tr key={p.id} className="ava-row">
            <td style={td}>
              <div style={{ fontWeight: 700, color: C.ink }}>{p.full_name}</div>
              <div style={{ fontSize: 11, color: C.ink3, fontFamily: FONT.mono }}>{p.patient_number} · {p.gender} · {age(p.date_of_birth)}</div>
            </td>
            <td style={td}>
              <div style={{ color: C.ink }}>{p.phone}</div>
              <div style={{ fontSize: 11, color: C.ink3 }}>{p.email || "—"}</div>
            </td>
            <td style={td}>{p.blood_group || "—"}</td>
            <td style={td}>{p.registered_facility?.name || "—"}</td>
            <td style={td}>
              <Badge color={p.status === "active" ? C.emerald : C.ink3} bg={(p.status === "active" ? C.emerald : C.ink3) + "14"} dot>{p.status}</Badge>
            </td>
            <td style={td}>
              <button onClick={() => openEdit(p)} title="View / Edit" style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, display: "grid", placeItems: "center", cursor: "pointer" }}>
                <Pencil size={13} color={C.ink2} />
              </button>
            </td>
          </tr>
        ))}
      </TableShell>

      {!loading && !error && pagination.last_page > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pagination.current_page <= 1}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, display: "grid", placeItems: "center", cursor: pagination.current_page <= 1 ? "default" : "pointer", opacity: pagination.current_page <= 1 ? 0.4 : 1 }}
          >
            <ChevronLeft size={14} color={C.ink2} />
          </button>
          <span style={{ fontSize: 12.5, color: C.ink2, fontWeight: 600 }}>
            Page {pagination.current_page} of {pagination.last_page} · {pagination.total} patients
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
            disabled={pagination.current_page >= pagination.last_page}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, display: "grid", placeItems: "center", cursor: pagination.current_page >= pagination.last_page ? "default" : "pointer", opacity: pagination.current_page >= pagination.last_page ? 0.4 : 1 }}
          >
            <ChevronRight size={14} color={C.ink2} />
          </button>
        </div>
      )}

      <PatientFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        facilities={facilities}
        editingPatient={editingPatient}
        onSaved={refresh}
      />
    </div>
  );
}

export default Patients;
