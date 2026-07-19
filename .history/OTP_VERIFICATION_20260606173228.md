# OTP Verification Implementation

## Overview
This implementation provides a complete OTP (One-Time Password) verification system with toast notifications. When a user enters an incorrect OTP, a toast message will appear saying "✗ OTP is wrong. Please enter the correct OTP" and the input fields will be cleared for retry.

## Components

### 1. Toast Notification System (`src/components/ui/Toast.jsx`)
A lightweight toast notification system with support for multiple toast types.

**Features:**
- Success, error, and info toast types
- Auto-dismiss with configurable duration
- Manual dismiss button
- Smooth animations
- Context API for easy access throughout the app

**Usage:**
```jsx
import { useToast } from '@/src/components/ui/Toast.jsx';

function MyComponent() {
  const { showToast } = useToast();

  const handleClick = () => {
    // Show a success toast for 3 seconds
    showToast('Operation successful!', 'success', 3000);
    
    // Show an error toast
    showToast('Something went wrong', 'error', 3000);
    
    // Show an info toast
    showToast('Please note this information', 'info', 5000);
  };

  return <button onClick={handleClick}>Show Toast</button>;
}
```

### 2. OTP Verification Component (`src/components/auth/OtpVerification.jsx`)
A complete OTP input and verification component.

**Features:**
- 6-digit OTP input with individual fields
- Auto-focus to next field on digit entry
- Backspace and arrow key navigation
- Paste support (auto-parses digits from clipboard)
- Enter key to submit
- Toast notifications for wrong OTP
- Loading state during verification
- Customizable correct OTP value
- Callbacks for success and failure

**Props:**
- `correctOtp` (string, default: '123456') - The correct OTP to validate against
- `onVerificationSuccess` (function) - Callback when OTP is verified correctly
- `onVerificationFail` (function) - Callback when OTP is incorrect
- `validationErrorMessage` (string, optional) - Custom error message

**Usage:**
```jsx
import OtpVerification from '@/src/components/auth/OtpVerification.jsx';
import { useToast } from '@/src/components/ui/Toast.jsx';

function MyAuthPage() {
  const { showToast } = useToast();

  const handleSuccess = (otp) => {
    console.log('OTP verified:', otp);
    // Redirect to dashboard or complete login
  };

  const handleFail = (enteredOtp) => {
    console.log('Failed OTP:', enteredOtp);
  };

  return (
    <OtpVerification
      correctOtp="123456"
      onVerificationSuccess={handleSuccess}
      onVerificationFail={handleFail}
    />
  );
}
```

### 3. Login Page (`app/login/page.jsx`)
A complete login flow with email input and OTP verification.

**Features:**
- Email validation
- OTP request with email confirmation
- Full OTP verification flow
- Success state with automatic redirect
- Clean, modern UI matching the AVA HMS design

**Flow:**
1. User enters email → gets OTP
2. User enters 6-digit OTP
3. On wrong OTP: Shows error toast and clears input
4. On correct OTP: Shows success message and redirects to dashboard

## How It Works

### Wrong OTP Flow:
```
User enters: "000000" (wrong OTP, correct is "123456")
    ↓
System validates and finds mismatch
    ↓
Toast appears: "✗ OTP is wrong. Please enter the correct OTP"
    ↓
OTP input fields are cleared
    ↓
User can try again
```

## Setup Instructions

1. **The components are already installed in:**
   - `src/components/ui/Toast.jsx` - Toast notification system
   - `src/components/auth/OtpVerification.jsx` - OTP verification component
   - `app/login/page.jsx` - Login page with OTP flow

2. **The layout already has ToastProvider:**
   - `app/layout.jsx` - Wraps the entire app with ToastProvider

3. **To use in other components:**
   ```jsx
   import { useToast } from '@/src/components/ui/Toast.jsx';

   function MyComponent() {
     const { showToast } = useToast();

     const verifyOtp = (userOtp) => {
       if (userOtp !== correctOtp) {
         showToast('✗ OTP is wrong. Please enter the correct OTP', 'error', 3000);
       }
     };
   }
   ```

## Testing

1. **Access the login page:**
   ```
   http://localhost:3000/login
   ```

2. **Test with:**
   - Email: Any valid email (demo: test@example.com)
   - OTP: `123456` (correct)
   - Anything else will show wrong OTP message

3. **Test scenarios:**
   - Enter wrong OTP → Toast appears with error message
   - Clear fields and try again
   - Paste OTP from clipboard
   - Use arrow keys to navigate between fields
   - Press Enter to submit

## Customization

### Change the correct OTP:
```jsx
<OtpVerification
  correctOtp="654321"
  onVerificationSuccess={handleSuccess}
  onVerificationFail={handleFail}
/>
```

### Change toast duration:
```jsx
showToast('Message', 'error', 5000); // 5 seconds
showToast('Message', 'error', 0); // No auto-dismiss
```

### Custom error messages:
Modify the toast message in `OtpVerification.jsx` line:
```jsx
showToast('✗ OTP is wrong. Please enter the correct OTP', 'error', 3000);
```

## Production Considerations

1. **API Integration:**
   - Replace the setTimeout mock in `OtpVerification.jsx` with actual API call
   - Send OTP validation request to backend
   - Handle network errors with appropriate toast messages

2. **Security:**
   - Never expose the correct OTP in frontend code
   - Always validate OTP on the server
   - Implement rate limiting for OTP attempts
   - Use HTTPS for all authentication requests

3. **User Experience:**
   - Add OTP expiration time display
   - Implement resend OTP cooldown
   - Add attempt counter
   - Provide better error messages for edge cases
