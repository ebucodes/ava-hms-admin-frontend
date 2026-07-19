'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { C, FONT } from '@/src/theme/tokens.js';
import { useToast } from '@/src/components/ui/Toast.jsx';
import { adminLogin } from '@/src/lib/api/admin.js';
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

function Field({ label, type = 'text', ...props }) {
  const isPassword = type === 'password';
  const [show, setShow] = useState(false);
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 8 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={inputType}
          style={{ ...inputStyle, paddingRight: isPassword ? 42 : 14 }}
          onFocus={(e) => {
            e.target.style.borderColor = C.blue;
            e.target.style.boxShadow = `0 0 0 3px ${C.blue}12`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = C.borderSoft;
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
        {isPassword && (
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
        )}
      </div>
    </div>
  );
}

/**
 * System-admin (application owner) sign-in. Used by both /login and
 * /admin/login. On success, stores the admin session and enters /admin.
 */
export default function AdminLoginForm() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'error', 3000);
      return;
    }

    setSubmitting(true);
    try {
      await adminLogin(email.trim(), password);
      showToast('Welcome back!', 'success', 2000);
      router.replace('/admin');
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
        className="ava-login-card"
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 20,
          padding: 40,
          boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
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
          <h1 style={{ fontFamily: FONT.display, fontSize: 24, fontWeight: 800, color: C.ink, margin: 0 }}>
            System Administration
          </h1>
          <p style={{ fontSize: 13, color: C.ink3, margin: '8px 0 0' }}>AVA HMS platform owners</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@ava-health.org"
            autoComplete="username"
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />

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
              transition: 'all 0.2s ease',
            }}
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
