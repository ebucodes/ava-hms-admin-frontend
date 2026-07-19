'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { C, FONT } from '@/src/theme/tokens.js';
import { useToast } from '@/src/components/ui/Toast.jsx';
import { useAuth } from '@/src/lib/auth/AuthContext.jsx';
import { ApiError, getRemember } from '@/src/lib/api/client.js';

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

export default function TenantLoginPage() {
  const router = useRouter();
  const { company: slug } = useParams();
  const { showToast } = useToast();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Reflect the last-used "remember me" choice (client-only to avoid a
  // hydration mismatch — initial render is `true` on both server and client).
  useEffect(() => {
    setRemember(getRemember());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showToast('Please fill in all fields', 'error', 3000);
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password, remember);
      showToast('Welcome back!', 'success', 2000);
      router.replace(`/${slug}`);
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
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
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
          <h1 style={{ fontFamily: FONT.display, fontSize: 26, fontWeight: 800, color: C.ink, margin: 0 }}>
            AVA HMS
          </h1>
          <p style={{ fontSize: 13, color: C.ink3, margin: '8px 0 0' }}>
            Sign in to <strong style={{ color: C.ink }}>{slug}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@hospital.com"
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: C.ink,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: C.blue, cursor: 'pointer' }}
              />
              Remember me
            </label>

            <Link
              href="/auth/forgot-password"
              style={{ fontSize: 13, color: C.blue, fontWeight: 600, textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          </div>

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
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
