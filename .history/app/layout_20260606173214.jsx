'use client';

import './globals.css';
import { C } from '@/src/theme/tokens.js';
import { ToastProvider } from '@/src/components/ui/Toast.jsx';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "'Hanken Grotesk', system-ui, -apple-system, sans-serif", WebkitFontSmoothing: 'antialiased' }}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
