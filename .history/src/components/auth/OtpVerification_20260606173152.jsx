import React, { useState, useRef, useEffect } from 'react';
import { C, FONT } from '../../theme/tokens.js';
import { useToast } from './Toast.jsx';

function OtpVerification({ correctOtp = '123456', onVerificationSuccess, onVerificationFail }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const { showToast } = useToast();

  // Handle input change
  const handleChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    if (digits.length > 0) {
      const newOtp = digits.split('');
      // Pad with empty strings if less than 6 digits
      while (newOtp.length < 6) {
        newOtp.push('');
      }
      setOtp(newOtp);
    }
  };

  // Verify OTP
  const handleVerify = async () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 6) {
      showToast('Please enter all 6 digits', 'error', 3000);
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (enteredOtp === correctOtp) {
        showToast('✓ OTP verified successfully!', 'success', 3000);
        onVerificationSuccess?.(enteredOtp);
      } else {
        showToast('✗ OTP is wrong. Please enter the correct OTP', 'error', 3000);
        onVerificationFail?.(enteredOtp);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
      setLoading(false);
    }, 500);
  };

  // Handle Enter key
  const handleKeyUp = (e) => {
    if (e.key === 'Enter' && otp.join('').length === 6) {
      handleVerify();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        padding: 24,
        borderRadius: 16,
        background: '#fff',
        border: `1px solid ${C.borderSoft}`,
        maxWidth: 400,
        margin: '0 auto',
      }}
    >
      <div>
        <h2
          style={{
            fontFamily: FONT.display,
            fontSize: 20,
            fontWeight: 700,
            color: C.ink,
            margin: '0 0 8px',
          }}
        >
          Enter OTP
        </h2>
        <p style={{ fontSize: 13, color: C.ink3, margin: 0 }}>
          We've sent a 6-digit code to your registered email
        </p>
      </div>

      {/* OTP Input Fields */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'center',
        }}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onKeyUp={handleKeyUp}
            onPaste={handlePaste}
            style={{
              width: 48,
              height: 48,
              fontSize: 24,
              fontWeight: 600,
              textAlign: 'center',
              borderRadius: 8,
              border: `2px solid ${digit ? C.blue : C.borderSoft}`,
              background: digit ? C.blueSoft : '#fff',
              color: C.ink,
              transition: 'all 0.2s ease',
              cursor: 'text',
              fontFamily: FONT.display,
            }}
            disabled={loading}
            placeholder="-"
            autoComplete="off"
          />
        ))}
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={loading || otp.join('').length !== 6}
        style={{
          padding: '12px 20px',
          borderRadius: 10,
          border: 'none',
          background:
            otp.join('').length === 6
              ? `linear-gradient(135deg, ${C.blue}, ${C.violet})`
              : C.borderSoft,
          color: otp.join('').length === 6 ? '#fff' : C.ink3,
          fontSize: 14,
          fontWeight: 600,
          cursor: otp.join('').length === 6 && !loading ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>

      {/* Resend Link */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: C.ink3, margin: '0 0 8px' }}>
          Didn't receive the code?
        </p>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: C.blue,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
          onClick={() => showToast('OTP resent to your email', 'info', 3000)}
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
}

export default OtpVerification;
