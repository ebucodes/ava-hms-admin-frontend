import './globals.css';
import { GLOBAL_CSS } from '@/src/styles/globalCss.js';
import Providers from '@/src/components/Providers.jsx';

export const metadata = {
  title: {
    default: 'AVA HMS',
    template: '%s · AVA HMS',
  },
  description: 'AVA HMS — AI-powered Hospital Management System.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        style={{ margin: 0, fontFamily: "'Hanken Grotesk', system-ui, -apple-system, sans-serif", WebkitFontSmoothing: 'antialiased' }}
      >
        <style>{GLOBAL_CSS}</style>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
