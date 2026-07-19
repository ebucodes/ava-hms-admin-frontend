import { useEffect, useState } from "react";
import { C } from "../../theme/tokens.js";
import Modal from "../ui/Modal.jsx";
import { FormField, TextInput, SelectInput } from "../ui/FormField.jsx";
import { createUser, updateUser } from "../../lib/api/users.js";
import { ApiError } from "../../lib/api/client.js";
import { useAuth } from "../../lib/auth/AuthContext.jsx";
import { useToast } from "../ui/Toast.jsx";

const EMPTY_FORM = { name: "", email: "", phone: "", password: "", facility_id: "", roles: "", status: "active" };

function UserFormModal({ open, onClose, facilities = [], editingUser, onSaved }) {
  const { companySlug } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(editingUser);

  useEffect(() => {
    if (editingUser) {
      setForm({
        name: editingUser.name || "",
        email: editingUser.email || "",
        phone: editingUser.phone || "",
        password: "",
        facility_id: editingUser.facility?.id || "",
        roles: (editingUser.roles || []).join(", "),
        status: editingUser.status || "active",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingUser, open]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    const roles = form.roles.split(",").map((r) => r.trim()).filter(Boolean);
    try {
      if (isEdit) {
        await updateUser(companySlug, editingUser.id, { name: form.name, status: form.status, roles });
        showToast("User updated", "success", 2500);
      } else {
        await createUser(companySlug, {
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          password: form.password,
          facility_id: form.facility_id || null,
          roles,
        });
        showToast("User created", "success", 2500);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])));
      }
      showToast(err instanceof ApiError ? err.message : "Failed to save user", "error", 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit User" : "Add User"} sub={isEdit ? editingUser?.email : "Create a new staff account"} width={480}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FormField label="Full name" error={errors.name}>
          <TextInput value={form.name} onChange={set("name")} required />
        </FormField>

        <FormField label="Email" error={errors.email}>
          <TextInput type="email" value={form.email} onChange={set("email")} required disabled={isEdit} />
        </FormField>

        {!isEdit && (
          <>
            <FormField label="Phone (optional)" error={errors.phone}>
              <TextInput value={form.phone} onChange={set("phone")} />
            </FormField>
            <FormField label="Password" error={errors.password}>
              <TextInput type="password" value={form.password} onChange={set("password")} required />
            </FormField>
            <FormField label="Facility (optional)" error={errors.facility_id}>
              <SelectInput value={form.facility_id} onChange={set("facility_id")}>
                <option value="">Unassigned</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </SelectInput>
            </FormField>
          </>
        )}

        {isEdit && (
          <FormField label="Status" error={errors.status}>
            <SelectInput value={form.status} onChange={set("status")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </SelectInput>
          </FormField>
        )}

        <FormField label="Roles (comma-separated)" error={errors.roles}>
          <TextInput value={form.roles} onChange={set("roles")} placeholder="doctor, ward_manager" required />
        </FormField>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
          <button type="button" onClick={onClose} style={{ padding: "9px 16px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface, color: C.ink2, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: C.blue, color: "#fff", fontWeight: 700, fontSize: 13, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default UserFormModal;
