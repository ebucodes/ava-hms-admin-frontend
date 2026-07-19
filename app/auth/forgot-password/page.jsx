'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MailCheck, ShieldCheck } from 'lucide-react';
import { C, FONT } from '@/src/theme/tokens.js';
import { useToast } from '@/src/components/ui/Toast.jsx';
import { adminForgotPassword } from '@/src/lib/api/admin.js';
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

/**
 * System-admin "forgot password" at /auth/forgot-password. Submits the email;
 * the backend responds with the same generic message whether or not an account
 * matches, so we always show the "check your inbox" state on success.
 */
export default function AdminForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'error', 3000);
      return;
    }
    setSubmitting(true);
    try {
      await adminForgotPassword(email.trim());
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
            {sent ? <MailCheck size={26} /> : <ShieldCheck size={26} />}
          </div>
          <h1 style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, color: C.ink, margin: 0 }}>
            {sent ? 'Check your inbox' : 'Forgot password'}
          </h1>
          <p style={{ fontSize: 13, color: C.ink3, margin: '8px 0 0', lineHeight: 1.5 }}>
            {sent
              ? 'If an account matches that email, a password reset link is on its way. The link expires in 1 hour.'
              : 'Enter your admin email and we’ll send you a reset link.'}
          </p>
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 8 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@ava-health.org"
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
                background: `linear-gradient(135deg, ${C.ink}, ${C.violet})`,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting ? 'default' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
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
