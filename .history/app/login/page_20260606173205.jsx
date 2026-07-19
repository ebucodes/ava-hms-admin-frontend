'use client';

import React, { useState } from 'react';
import { C, FONT } from '@/src/theme/tokens.js';
import { ToastProvider, useToast } from '@/src/components/ui/Toast.jsx';
import OtpVerification from '@/src/components/auth/OtpVerification.jsx';

function LoginContent() {
  const [stage, setStage] = useState('email'); // 'email' | 'otp' | 'success'
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSendOtp = (e) => {
    e.preventDefault();
    
    if (!email) {
      showToast('Please enter your email', 'error', 3000);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email', 'error', 3000);
      return;
    }

    setStage('otp');
    showToast(`OTP sent to ${email}`, 'info', 3000);
  };

  const handleVerificationSuccess = () => {
    setStage('success');
    setTimeout(() => {
      // Redirect to dashboard or main app
      window.location.href = '/';
    }, 2000);
  };

  const handleVerificationFail = () => {
    // Toast is already shown in OtpVerification component
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
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 20,
          padding: 40,
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
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
          <h1
            style={{
              fontFamily: FONT.display,
              fontSize: 26,
              fontWeight: 800,
              color: C.ink,
              margin: 0,
            }}
          >
            AVA HMS
          </h1>
          <p style={{ fontSize: 13, color: C.ink3, margin: '8px 0 0' }}>
            Hospital Management System
          </p>
        </div>

        {/* Email Stage */}
        {stage === 'email' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.ink,
                  marginBottom: 8,
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hospital.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: `1px solid ${C.borderSoft}`,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  background: '#fff',
                }}
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
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: `linear-gradient(135deg, ${C.blue}, ${C.violet})`,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 16px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Send OTP
            </button>

            <p style={{ fontSize: 12, color: C.ink3, textAlign: 'center', margin: '16px 0 0' }}>
              Demo: Use any email and enter <code style={{ background: C.borderSoft, padding: '2px 6px', borderRadius: 4 }}>123456</code> for OTP
            </p>
          </form>
        )}

        {/* OTP Stage */}
        {stage === 'otp' && (
          <OtpVerification
            correctOtp="123456"
            onVerificationSuccess={handleVerificationSuccess}
            onVerificationFail={handleVerificationFail}
          />
        )}

        {/* Success Stage */}
        {stage === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                background: C.emeraldSoft,
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
                animation: 'avaRise 0.5s ease',
              }}
            >
              <span style={{ fontSize: 32 }}>✓</span>
            </div>
            <h2
              style={{
                fontFamily: FONT.display,
                fontSize: 20,
                fontWeight: 700,
                color: C.emerald,
                margin: '0 0 8px',
              }}
            >
              Verification Successful!
            </h2>
            <p style={{ fontSize: 13, color: C.ink3, margin: 0 }}>
              Redirecting to dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ToastProvider>
      <LoginContent />
    </ToastProvider>
  );
}
