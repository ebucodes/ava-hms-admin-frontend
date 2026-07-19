import { useState } from "react";
import { C } from "../../theme/tokens.js";
import Modal from "../ui/Modal.jsx";
import { FormField, TextInput, SelectInput } from "../ui/FormField.jsx";
import { registerPatient } from "../../lib/api/patients.js";
import { checkInPatient } from "../../lib/api/patients.js";
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
  checkInNow: true,
  facility_id: "",
  reason: "",
  type: "outpatient",
};

function PatientRegistrationModal({ open, onClose, facilities = [], onRegistered }) {
  const { companySlug } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const patient = await registerPatient(companySlug, {
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

      if (form.checkInNow) {
        if (!form.facility_id) {
          setErrors({ facility_id: "Select a facility to check in." });
          setSubmitting(false);
          return;
        }
        await checkInPatient(companySlug, patient.id, {
          facility_id: form.facility_id,
          type: form.type,
          reason: form.reason || null,
          priority: 0,
        });
      }

      showToast(`${patient.full_name || patient.first_name} registered successfully`, "success", 3000);
      onRegistered?.();
      handleClose();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])));
      }
      showToast(err instanceof ApiError ? err.message : "Failed to register patient", "error", 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Register Patient" sub="Add a new patient and optionally check them into the queue" width={560}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="ava-form-grid-2" style={{ display: "grid", gap: 12 }}>
          <FormField label="First name" error={errors.first_name}>
            <TextInput value={form.first_name} onChange={set("first_name")} required />
          </FormField>
          <FormField label="Last name" error={errors.last_name}>
            <TextInput value={form.last_name} onChange={set("last_name")} required />
          </FormField>
        </div>

        <div className="ava-form-grid-2" style={{ display: "grid", gap: 12 }}>
          <FormField label="Date of birth" error={errors.date_of_birth}>
            <TextInput type="date" value={form.date_of_birth} onChange={set("date_of_birth")} />
          </FormField>
          <FormField label="Gender" error={errors.gender}>
            <SelectInput value={form.gender} onChange={set("gender")}>
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
            <TextInput type="email" value={form.email} onChange={set("email")} />
          </FormField>
        </div>

        <FormField label="Address" error={errors.address}>
          <TextInput value={form.address} onChange={set("address")} />
        </FormField>

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

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.ink2, fontWeight: 600 }}>
          <input type="checkbox" checked={form.checkInNow} onChange={(e) => setForm((f) => ({ ...f, checkInNow: e.target.checked }))} />
          Check in now
        </label>

        {form.checkInNow && (
          <div className="ava-form-grid-2" style={{ display: "grid", gap: 12, background: C.surface2, borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
            <FormField label="Facility" error={errors.facility_id}>
              <SelectInput value={form.facility_id} onChange={set("facility_id")}>
                <option value="">Select facility…</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Visit type" error={errors.type}>
              <SelectInput value={form.type} onChange={set("type")}>
                <option value="outpatient">Outpatient</option>
                <option value="inpatient">Inpatient</option>
                <option value="emergency">Emergency</option>
              </SelectInput>
            </FormField>
            <div style={{ gridColumn: "1 / -1" }}>
              <FormField label="Reason for visit" error={errors.reason}>
                <TextInput value={form.reason} onChange={set("reason")} placeholder="e.g. Fever, routine checkup" />
              </FormField>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
          <button type="button" onClick={handleClose} style={{ padding: "9px 16px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface, color: C.ink2, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: C.blue, color: "#fff", fontWeight: 700, fontSize: 13, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Saving…" : "Register Patient"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default PatientRegistrationModal;
