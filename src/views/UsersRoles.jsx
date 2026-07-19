import { useCallback, useEffect, useState } from "react";
import { Users as UsersIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { C, FONT } from "../theme/tokens.js";
import { td } from "../components/ui/styles.js";
import Badge from "../components/ui/Badge.jsx";
import TableShell from "../components/data/TableShell.jsx";
import UserFormModal from "../components/users/UserFormModal.jsx";
import { useAuth } from "../lib/auth/AuthContext.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { listUsers, deleteUser } from "../lib/api/users.js";
import { getTenant } from "../lib/api/companies.js";
import { ApiError } from "../lib/api/client.js";

const STATUS_COLOR = { active: C.emerald, inactive: C.ink3, suspended: C.red };

function UsersRoles() {
  const { companySlug } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      const data = await listUsers(companySlug);
      setUsers(data.items || []);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load users");
    }
  }, [companySlug]);

  useEffect(() => {
    if (!companySlug) return;
    setLoading(true);
    Promise.all([
      loadUsers(),
      getTenant(companySlug)
        .then((company) => setFacilities(company.facilities || []))
        .catch(() => setFacilities([])),
    ]).finally(() => setLoading(false));
  }, [companySlug, loadUsers]);

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    try {
      await deleteUser(companySlug, user.id);
      showToast("User deleted", "success", 2500);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      loadUsers();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to delete user", "error", 4000);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <TableShell
        icon={UsersIcon}
        title="Users & Roles"
        sub="Staff directory & access control"
        cols={["Name", "Contact", "Roles", "Facility", "Status", "Actions"]}
        right={
          <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 9, border: "none", background: C.blue, color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
            <Plus size={14} /> Add User
          </button>
        }
      >
        {loading && (
          <tr><td style={td} colSpan={6}>Loading users…</td></tr>
        )}
        {!loading && error && (
          <tr><td style={{ ...td, color: C.red }} colSpan={6}>{error}</td></tr>
        )}
        {!loading && !error && users.length === 0 && (
          <tr><td style={{ ...td, color: C.ink3 }} colSpan={6}>No users yet.</td></tr>
        )}
        {!loading && !error && users.map((u) => (
          <tr key={u.id} className="ava-row">
            <td style={td}><div style={{ fontWeight: 700, color: C.ink }}>{u.name}</div></td>
            <td style={td}>
              <div style={{ color: C.ink }}>{u.email}</div>
              <div style={{ fontSize: 11, color: C.ink3 }}>{u.phone || "—"}</div>
            </td>
            <td style={td}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(u.roles || []).map((r) => (
                  <Badge key={r} color={C.violet} bg={C.violetSoft}>{r}</Badge>
                ))}
              </div>
            </td>
            <td style={td}>{u.facility?.name || "—"}</td>
            <td style={td}>
              <Badge color={STATUS_COLOR[u.status] || C.ink3} bg={(STATUS_COLOR[u.status] || C.ink3) + "14"} dot>{u.status}</Badge>
            </td>
            <td style={td}>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => openEdit(u)} title="Edit" style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, display: "grid", placeItems: "center", cursor: "pointer" }}>
                  <Pencil size={13} color={C.ink2} />
                </button>
                <button onClick={() => handleDelete(u)} title="Delete" style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, display: "grid", placeItems: "center", cursor: "pointer" }}>
                  <Trash2 size={13} color={C.red} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        facilities={facilities}
        editingUser={editingUser}
        onSaved={loadUsers}
      />
    </div>
  );
}

export default UsersRoles;
