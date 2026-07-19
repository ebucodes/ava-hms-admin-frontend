'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { C, FONT } from '@/src/theme/tokens.js';
import { useToast } from '@/src/components/ui/Toast.jsx';
import { resetPassword } from '@/src/lib/api/auth.js';
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

function PasswordField({ label, value, onChange, error }) {
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
          placeholder="••••••••"
          autoComplete="new-password"
          style={{ ...inputStyle, paddingRight: 42, borderColor: error ? C.red : C.borderSoft }}
          onFocus={(e) => {
            e.target.style.borderColor = C.blue;
            e.target.style.boxShadow = `0 0 0 3px ${C.blue}12`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? C.red : C.borderSoft;
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
      {error && <div style={{ fontSize: 11.5, color: C.red, marginTop: 5 }}>{error}</div>}
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { showToast } = useToast();

  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const missingLink = !token || !email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({
        email,
        token,
        password,
        password_confirmation: confirm,
      });
      showToast('Password reset successfully. Please sign in.', 'success', 3000);
      router.push('/login');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Unable to reach the server. Please try again.';
      showToast(message, 'error', 4000);
    } finally {
      setSubmitting(false);
    }
  };

  if (missingLink) {
    return (
      <div
        style={{
          fontSize: 14,
          color: C.ink,
          lineHeight: 1.6,
          textAlign: 'center',
          background: `${C.red}0c`,
          border: `1px solid ${C.red}22`,
          borderRadius: 12,
          padding: '18px 16px',
        }}
      >
        This reset link is invalid or incomplete. Please request a new one from the{' '}
        <Link href="/auth/forgot-password" style={{ color: C.blue, fontWeight: 600, textDecoration: 'none' }}>
          forgot password
        </Link>{' '}
        page.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PasswordField
        label="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error}
      />
      <PasswordField
        label="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

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
          transition: 'all 0.2s ease',
        }}
      >
        {submitting ? 'Resetting…' : 'Reset password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${C.blue}20, ${C.violet}20)`,
        padding: 20,
      }}
    >
      <div
        className="ava-login-card"
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 20,
          padding: 40,
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${C.blue}, ${C.violet})`,
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 24,
              fontFamily: FONT.display,
              margin: '0 auto 20px',
            }}
          >
            AVA
          </div>
          <h1 style={{ fontFamily: FONT.display, fontSize: 24, fontWeight: 800, color: C.ink, margin: 0 }}>
            Reset password
          </h1>
          <p style={{ fontSize: 13, color: C.ink3, margin: '8px 0 0' }}>
            Choose a new password for your account
          </p>
        </div>

        <Suspense fallback={<div style={{ textAlign: 'center', color: C.ink3, fontSize: 14 }}>Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>

        <p style={{ fontSize: 13, color: C.ink3, textAlign: 'center', margin: '20px 0 0' }}>
          <Link href="/login" style={{ color: C.blue, fontWeight: 600, textDecoration: 'none' }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
