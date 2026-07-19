'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/src/theme/tokens.js';
import { useAdminAuth } from '@/src/lib/auth/AdminAuthContext.jsx';
import { adminListCompanies } from '@/src/lib/api/admin.js';
import Sidebar from '@/src/components/shell/Sidebar.jsx';
import TopBar from '@/src/components/shell/TopBar.jsx';
import CommandPalette from '@/src/components/shell/CommandPalette.jsx';
import HospitalsView from '@/src/admin/HospitalsView.jsx';
import HospitalDetail from '@/src/admin/HospitalDetail.jsx';
import Overview from '@/src/admin/Overview.jsx';

const TITLES = {
  overview: ['Overview', 'Platform operations across every hospital'],
  hospitals: ['Hospitals', 'All tenant hospitals on the platform'],
};

/**
 * Admin console shell — same chrome/template as the customer portal (Sidebar +
 * TopBar + CommandPalette + scrolling main), driven by the admin NAV.
 */
export default function AdminShell() {
  const router = useRouter();
  const { admin, logout } = useAdminAuth();

  const [active, setActive] = useState('overview');
  const [selected, setSelected] = useState(null); // hospital slug when drilled in
  const [collapsed, setCollapsed] = useState(false);
  const [palette, setPalette] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [companies, setCompanies] = useState(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    adminListCompanies()
      .then((res) => setCompanies(res.data || res || []))
      .catch(() => setError(true));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p); }
      if (e.key === 'Escape') setPalette(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const go = (id) => { setSelected(null); setActive(id); setMobileNavOpen(false); };
  const handleLogout = async () => { await logout(); router.replace('/login'); };

  const loading = companies === null && !error;
  const [title, sub] = selected ? ['Hospital', 'Manage this hospital'] : (TITLES[active] || TITLES.overview);

  return (
    <div className="ava-root" style={{ background: `linear-gradient(180deg, ${C.bg}, ${C.bgGrad})`, minHeight: '100vh', color: C.ink }}>
      <div style={{ display: 'flex' }}>
        <Sidebar
          active={active}
          setActive={go}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          admin={admin}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />
        {mobileNavOpen && <div className="ava-backdrop" onClick={() => setMobileNavOpen(false)} />}

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <TopBar
            onPalette={() => setPalette(true)}
            onMenuClick={() => setMobileNavOpen((o) => !o)}
            title={title}
            sub={sub}
            user={admin}
            onLogout={handleLogout}
          />
          <main className="ava-fade ava-scroll ava-main-pad" style={{ overflowY: 'auto', maxWidth: 1480, width: '100%', margin: '0 auto' }}>
            {selected ? (
              <HospitalDetail slug={selected} onBack={() => setSelected(null)} onChanged={load} />
            ) : active === 'overview' ? (
              <Overview admin={admin} companies={companies} loading={loading} error={error} onOpen={setSelected} onSeeAll={() => setActive('hospitals')} />
            ) : (
              <HospitalsView companies={companies} loading={loading} error={error} onOpen={setSelected} onRetry={load} />
            )}
          </main>
        </div>
      </div>

      <CommandPalette open={palette} onClose={() => setPalette(false)} go={go} />
    </div>
  );
}
