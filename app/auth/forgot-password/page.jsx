'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { C, FONT } from '@/src/theme/tokens.js';
import { useToast } from '@/src/components/ui/Toast.jsx';
import { forgotPassword } from '@/src/lib/api/auth.js';
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

export default function ForgotPasswordPage() {
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showToast('Please enter your email address', 'error', 3000);
      return;
    }

    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      // Generic success — the API never reveals whether the email exists.
      setSent(true);
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
            Forgot password
          </h1>
          <p style={{ fontSize: 13, color: C.ink3, margin: '8px 0 0' }}>
            {sent
              ? 'Check your inbox for the reset link'
              : 'Enter your email and we’ll send you a reset link'}
          </p>
        </div>

        {sent ? (
          <div
            style={{
              fontSize: 14,
              color: C.ink,
              lineHeight: 1.6,
              textAlign: 'center',
              background: `${C.blue}0c`,
              border: `1px solid ${C.blue}22`,
              borderRadius: 12,
              padding: '18px 16px',
            }}
          >
            If an account matches <strong>{email}</strong>, a password reset link is on its way.
            The link expires in 1 hour.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 8 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hospital.com"
                autoComplete="username"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = C.blue;
                  e.target.style.boxShadow = `0 0 0 3px ${C.blue}12`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.borderSoft;
                  e.target.style.boxShadow = 'none';
                }}
              />
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
              {submitting ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p style={{ fontSize: 13, color: C.ink3, textAlign: 'center', margin: '20px 0 0' }}>
          Remembered it?{' '}
          <Link href="/login" style={{ color: C.blue, fontWeight: 600, textDecoration: 'none' }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
