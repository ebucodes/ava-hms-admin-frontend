'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { C, FONT } from '@/src/theme/tokens.js';
import { useToast } from '@/src/components/ui/Toast.jsx';
import { useAdminAuth } from '@/src/lib/auth/AdminAuthContext.jsx';
import { registerCompany } from '@/src/lib/api/companies.js';
import { ApiError } from '@/src/lib/api/client.js';

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: `1px solid ${C.borderSoft}`,
  fontSize: 14,
  fontFamily: 'inherit',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
  background: '#fff',
};

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  facility_name: '',
  facility_address: '',
  admin_name: '',
  admin_email: '',
  admin_password: '',
};

function Field({ label, error, ...props }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 8 }}>
        {label}
      </label>
      <input
        style={{ ...inputStyle, borderColor: error ? C.red : C.borderSoft }}
        onFocus={(e) => {
          e.target.style.borderColor = C.blue;
          e.target.style.boxShadow = `0 0 0 3px ${C.blue}12`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? C.red : C.borderSoft;
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && <div style={{ fontSize: 11.5, color: C.red, marginTop: 5 }}>{error}</div>}
    </div>
  );
}

export default function AdminOnboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { loading, token } = useAdminAuth();

  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !token) {
      router.replace('/login');
    }
  }, [mounted, loading, token, router]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (!mounted || loading || !token) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const company = await registerCompany({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        facility_name: form.facility_name,
        facility_address: form.facility_address,
        admin_name: form.admin_name,
        admin_email: form.admin_email,
        admin_password: form.admin_password,
      });
      showToast(`${company.name} onboarded successfully!`, 'success', 3000);
      setCreated(company);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])));
      }
      showToast(err instanceof ApiError ? err.message : 'Failed to onboard hospital', 'error', 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.bg}, ${C.bgGrad})`, padding: '32px 20px' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <Link
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.ink3, textDecoration: 'none', marginBottom: 18 }}
        >
          <ArrowLeft size={15} /> Back to admin
        </Link>

        <div style={{ background: '#fff', borderRadius: 20, padding: 36, boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, color: C.ink, margin: 0 }}>
            Onboard a Hospital
          </h1>
          <p style={{ fontSize: 13, color: C.ink3, margin: '6px 0 24px' }}>
            Create a new tenant hospital and its first administrator.
          </p>

          {created ? (
            <div
              style={{
                fontSize: 14,
                color: C.ink,
                lineHeight: 1.7,
                background: `${C.emerald}0e`,
                border: `1px solid ${C.emerald}30`,
                borderRadius: 12,
                padding: '18px 16px',
              }}
            >
              <strong>{created.name}</strong> is live. Its portal is at{' '}
              <code style={{ background: C.borderSoft, padding: '2px 6px', borderRadius: 6 }}>/{created.slug}</code>.
              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                <button
                  onClick={() => { setCreated(null); setForm(EMPTY_FORM); }}
                  style={{ padding: '9px 15px', borderRadius: 10, border: 'none', background: C.blue, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Onboard another
                </button>
                <Link
                  href="/"
                  style={{ padding: '9px 15px', borderRadius: 10, border: `1px solid ${C.border}`, background: '#fff', color: C.ink, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                >
                  Done
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.ink3, letterSpacing: '.06em' }}>HOSPITAL</div>
              <Field label="Hospital name" value={form.name} onChange={set('name')} error={errors.name} placeholder="Lagoon General Hospital" required />
              <Field label="Hospital email" type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="info@hospital.com" required />
              <Field label="Hospital phone (optional)" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="+2348012345678" />
              <Field label="Main facility name" value={form.facility_name} onChange={set('facility_name')} error={errors.facility_name} placeholder="Lagoon HQ" required />
              <Field label="Facility address" value={form.facility_address} onChange={set('facility_address')} error={errors.facility_address} placeholder="12 Marina Rd, Lagos" required />

              <div style={{ fontSize: 11, fontWeight: 700, color: C.ink3, letterSpacing: '.06em', marginTop: 6 }}>ADMIN ACCOUNT</div>
              <Field label="Admin name" value={form.admin_name} onChange={set('admin_name')} error={errors.admin_name} placeholder="Ada Okafor" required />
              <Field label="Admin email" type="email" value={form.admin_email} onChange={set('admin_email')} error={errors.admin_email} placeholder="admin@hospital.com" required />
              <Field label="Admin password" type="password" value={form.admin_password} onChange={set('admin_password')} error={errors.admin_password} placeholder="••••••••" required />

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '12px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: `linear-gradient(135deg, ${C.blue}, ${C.violet})`,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: submitting ? 'default' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  marginTop: 6,
                }}
              >
                {submitting ? 'Onboarding…' : 'Create Hospital'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
