'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/src/theme/tokens.js';
import { NAV } from '@/src/data/mockData.js';
import { useAuth } from '@/src/lib/auth/AuthContext.jsx';
import { firstPermittedNav } from '@/src/lib/auth/permissions.js';
import { listQueue } from '@/src/lib/api/queue.js';
import Sidebar from '@/src/components/shell/Sidebar.jsx';
import TopBar from '@/src/components/shell/TopBar.jsx';
import CommandPalette from '@/src/components/shell/CommandPalette.jsx';
import Dashboard from '@/src/views/Dashboard.jsx';
import FrontDesk from '@/src/views/FrontDesk.jsx';
import Patients from '@/src/views/Patients.jsx';
import Analytics from '@/src/views/Analytics.jsx';
import UsersRoles from '@/src/views/UsersRoles.jsx';
import ModuleDashboard from '@/src/views/ModuleDashboard.jsx';

const TITLES = {
  dashboard: ['Executive Dashboard', 'Network overview · real-time operations'],
  frontdesk: ['Front Desk', 'Patient registration & queue management'],
  patients: ['Patients', 'Patient directory & records'],
  analytics: ['Analytics', 'Executive · clinical · finance · operations'],
  users: ['Users & Roles', 'Staff directory & access control'],
};

export default function App() {
  const router = useRouter();
  const { loading, token, user, companySlug, logout } = useAuth();
  const [active, setActive] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [palette, setPalette] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [queueCount, setQueueCount] = useState(null);

  const loginPath = `/${companySlug}/auth/login`;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Land the user on the first view their permissions allow (not always the
  // Executive Dashboard, which many roles can't see).
  useEffect(() => {
    if (user && active === null) {
      setActive(firstPermittedNav(user) ?? 'dashboard');
    }
  }, [user, active]);

  // Reflect the active module in the browser tab title.
  useEffect(() => {
    if (!active) return;
    const label = TITLES[active]?.[0] || NAV.find((n) => n.id === active)?.label || 'AVA HMS';
    document.title = `${label} · AVA HMS`;
  }, [active]);

  useEffect(() => {
    if (!companySlug || !token) return undefined;
    let cancelled = false;
    const fetchQueueCount = () => {
      listQueue(companySlug)
        .then((data) => {
          if (!cancelled) setQueueCount((data.items || []).length);
        })
        .catch(() => {
          if (!cancelled) setQueueCount(null);
        });
    };
    fetchQueueCount();
    const interval = setInterval(fetchQueueCount, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [companySlug, token]);

  useEffect(() => {
    if (mounted && !loading && !token) {
      router.replace(loginPath);
    }
  }, [mounted, loading, token, router, loginPath]);

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((p) => !p);
      }
      if (e.key === 'Escape') setPalette(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  if (!mounted || loading || !token || !active) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.replace(loginPath);
  };

  const PAGES = {
    dashboard: Dashboard,
    frontdesk: FrontDesk,
    patients: Patients,
    analytics: Analytics,
    users: UsersRoles,
  };
  const Page = PAGES[active] || (() => <ModuleDashboard id={active} />);
  const [title, sub] = TITLES[active] || [
    NAV.find((n) => n.id === active)?.label || 'AVA HMS',
    'Hospital Management System',
  ];

  return (
    <div
      className="ava-root"
      style={{
        background: `linear-gradient(180deg, ${C.bg}, ${C.bgGrad})`,
        minHeight: '100vh',
        color: C.ink,
      }}
    >
      <div style={{ display: 'flex' }}>
        <Sidebar
          active={active}
          setActive={(id) => {
            setActive(id);
            setMobileNavOpen(false);
          }}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          user={user}
          companySlug={companySlug}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
          badges={{ frontdesk: queueCount }}
        />
        {mobileNavOpen && <div className="ava-backdrop" onClick={() => setMobileNavOpen(false)} />}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <TopBar
            onPalette={() => setPalette(true)}
            onMenuClick={() => setMobileNavOpen((o) => !o)}
            title={title}
            sub={sub}
            user={user}
            onLogout={handleLogout}
          />
          <main
            key={active}
            className="ava-fade ava-scroll ava-main-pad"
            style={{
              overflowY: 'auto',
              maxWidth: 1480,
              width: '100%',
              margin: '0 auto',
            }}
          >
            <Page id={active} />
          </main>
        </div>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} go={setActive} />
    </div>
  );
}
