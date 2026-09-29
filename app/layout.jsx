import './globals.css';
import { GLOBAL_CSS } from '@/src/styles/globalCss.js';
import Providers from '@/src/components/Providers.jsx';
import { THEME_BOOTSTRAP_SCRIPT } from '@/src/lib/hooks/ThemeContext.jsx';

export const metadata = {
  title: {
    default: 'AVA HMS',
    template: '%s · AVA HMS',
  },
  description: 'AVA HMS — AI-powered Hospital Management System.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets data-theme BEFORE first paint, so a dark-mode user never sees a white
            flash on load. See the customer portal's layout — same mechanism. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
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
