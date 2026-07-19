'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { C, FONT } from '@/src/theme/tokens.js';
import { useToast } from '@/src/components/ui/Toast.jsx';
import { adminResetPassword } from '@/src/lib/api/admin.js';
import { ApiError } from '@/src/lib/api/client.js';

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: `1px solid ${C.borderSoft}`,
  fontSize: 14,
  fontFamily: 'inherit',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
  background: '#fff',
};

function PasswordField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 8 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
          style={{ ...inputStyle, paddingRight: 42 }}
          onFocus={(e) => {
            e.target.style.borderColor = C.blue;
            e.target.style.boxShadow = `0 0 0 3px ${C.blue}12`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = C.borderSoft;
            e.target.style.boxShadow = 'none';
          }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'grid',
            placeItems: 'center',
            background: 'none',
            border: 'none',
            padding: 4,
            cursor: 'pointer',
            color: C.ink3,
          }}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

/**
 * System-admin "reset password" at /auth/reset-password. The email + token come
 * from the query string of the emailed link. On success we route back to /login.
 */
function AdminResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { showToast } = useToast();

  const email = params.get('email') || '';
  const token = params.get('token') || '';
  const linkValid = Boolean(email && token);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) {
      showToast('Please fill in both fields', 'error', 3000);
      return;
    }
    if (password !== confirm) {
      showToast('Passwords do not match', 'error', 3000);
      return;
    }
    setSubmitting(true);
    try {
      await adminResetPassword({
        email,
        token,
        password,
        password_confirmation: confirm,
      });
      showToast('Password reset. Please sign in.', 'success', 3000);
      router.replace('/login');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Unable to reach the server. Please try again.';
      showToast(message, 'error', 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${C.ink}, ${C.violet}90)`,
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 20,
          padding: 40,
          boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${C.ink}, ${C.violet})`,
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              margin: '0 auto 20px',
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <h1 style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, color: C.ink, margin: 0 }}>
            Reset password
          </h1>
          <p style={{ fontSize: 13, color: C.ink3, margin: '8px 0 0', lineHeight: 1.5 }}>
            {linkValid ? `Set a new password for ${email}.` : 'This reset link is missing or invalid.'}
          </p>
        </div>

        {linkValid ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PasswordField label="New password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            <PasswordField label="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: `linear-gradient(135deg, ${C.ink}, ${C.violet})`,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting ? 'default' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        ) : (
          <p style={{ fontSize: 13, color: C.ink3, textAlign: 'center', lineHeight: 1.6 }}>
            Please request a new link from the{' '}
            <Link href="/auth/forgot-password" style={{ color: C.blue, textDecoration: 'none' }}>
              forgot password
            </Link>{' '}
            page.
          </p>
        )}

        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <Link
            href="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.ink3, textDecoration: 'none' }}
          >
            <ArrowLeft size={15} /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <AdminResetPasswordInner />
    </Suspense>
  );
}
