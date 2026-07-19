import { useEffect, useState } from "react";
import { C } from "../../theme/tokens.js";
import Modal from "../ui/Modal.jsx";
import { FormField, TextInput, SelectInput } from "../ui/FormField.jsx";
import { registerPatient, updatePatient } from "../../lib/api/patients.js";
import { ApiError } from "../../lib/api/client.js";
import { useAuth } from "../../lib/auth/AuthContext.jsx";
import { useToast } from "../ui/Toast.jsx";

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "male",
  phone: "",
  email: "",
  address: "",
  blood_group: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  status: "active",
  facility_id: "",
};

function PatientFormModal({ open, onClose, facilities = [], editingPatient, onSaved }) {
  const { companySlug } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(editingPatient);

  useEffect(() => {
    if (editingPatient) {
      setForm({
        first_name: editingPatient.first_name || "",
        last_name: editingPatient.last_name || "",
        date_of_birth: editingPatient.date_of_birth || "",
        gender: editingPatient.gender || "male",
        phone: editingPatient.phone || "",
        email: editingPatient.email || "",
        address: editingPatient.address || "",
        blood_group: editingPatient.blood_group || "",
        emergency_contact_name: editingPatient.emergency_contact_name || "",
        emergency_contact_phone: editingPatient.emergency_contact_phone || "",
        status: editingPatient.status || "active",
        facility_id: editingPatient.registered_facility?.id || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingPatient, open]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      if (isEdit) {
        await updatePatient(companySlug, editingPatient.id, {
          phone: form.phone,
          address: form.address || null,
          status: form.status,
        });
        showToast("Patient updated", "success", 2500);
      } else {
        await registerPatient(companySlug, {
          first_name: form.first_name,
          last_name: form.last_name,
          date_of_birth: form.date_of_birth || null,
          gender: form.gender,
          phone: form.phone,
          email: form.email || null,
          address: form.address || null,
          blood_group: form.blood_group || null,
          emergency_contact_name: form.emergency_contact_name || null,
          emergency_contact_phone: form.emergency_contact_phone || null,
          registered_facility_id: form.facility_id || null,
        });
        showToast("Patient registered", "success", 2500);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])));
      }
      showToast(err instanceof ApiError ? err.message : "Failed to save patient", "error", 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Patient" : "Add Patient"} sub={isEdit ? editingPatient?.patient_number : "Register a new patient"} width={560}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="ava-form-grid-2" style={{ display: "grid", gap: 12 }}>
          <FormField label="First name" error={errors.first_name}>
            <TextInput value={form.first_name} onChange={set("first_name")} required disabled={isEdit} />
          </FormField>
          <FormField label="Last name" error={errors.last_name}>
            <TextInput value={form.last_name} onChange={set("last_name")} required disabled={isEdit} />
          </FormField>
        </div>

        <div className="ava-form-grid-2" style={{ display: "grid", gap: 12 }}>
          <FormField label="Date of birth" error={errors.date_of_birth}>
            <TextInput type="date" value={form.date_of_birth} onChange={set("date_of_birth")} disabled={isEdit} />
          </FormField>
          <FormField label="Gender" error={errors.gender}>
            <SelectInput value={form.gender} onChange={set("gender")} disabled={isEdit}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </SelectInput>
          </FormField>
        </div>

        <div className="ava-form-grid-2" style={{ display: "grid", gap: 12 }}>
          <FormField label="Phone" error={errors.phone}>
            <TextInput value={form.phone} onChange={set("phone")} required />
          </FormField>
          <FormField label="Email (optional)" error={errors.email}>
            <TextInput type="email" value={form.email} onChange={set("email")} disabled={isEdit} />
          </FormField>
        </div>

        <FormField label="Address" error={errors.address}>
          <TextInput value={form.address} onChange={set("address")} />
        </FormField>

        {isEdit ? (
          <FormField label="Status" error={errors.status}>
            <SelectInput value={form.status} onChange={set("status")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </SelectInput>
          </FormField>
        ) : (
          <div className="ava-form-grid-3" style={{ display: "grid", gap: 12 }}>
            <FormField label="Blood group" error={errors.blood_group}>
              <SelectInput value={form.blood_group} onChange={set("blood_group")}>
                <option value="">Unknown</option>
                {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Emergency contact" error={errors.emergency_contact_name}>
              <TextInput value={form.emergency_contact_name} onChange={set("emergency_contact_name")} />
            </FormField>
            <FormField label="Contact phone" error={errors.emergency_contact_phone}>
              <TextInput value={form.emergency_contact_phone} onChange={set("emergency_contact_phone")} />
            </FormField>
          </div>
        )}

        {!isEdit && facilities.length > 0 && (
          <FormField label="Facility (optional)" error={errors.facility_id}>
            <SelectInput value={form.facility_id} onChange={set("facility_id")}>
              <option value="">Unassigned</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </SelectInput>
          </FormField>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
          <button type="button" onClick={onClose} style={{ padding: "9px 16px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface, color: C.ink2, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: C.blue, color: "#fff", fontWeight: 700, fontSize: 13, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Register Patient"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default PatientFormModal;
