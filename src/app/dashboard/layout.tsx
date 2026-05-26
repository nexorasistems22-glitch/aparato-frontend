'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const nav = [
  { section: 'Principal', items: [
    { href: '/dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
    { href: '/dashboard/agenda', label: 'Agenda', icon: 'ti-calendar', badge: '12' },
    { href: '/dashboard/clientes', label: 'Clientes', icon: 'ti-users' },
    { href: '/dashboard/profissionais', label: 'Profissionais', icon: 'ti-user-check' },
    { href: '/dashboard/servicos', label: 'Serviços', icon: 'ti-scissors' },
  ]},
  { section: 'Financeiro', items: [
    { href: '/dashboard/financeiro', label: 'Faturamento', icon: 'ti-trending-up' },
    { href: '/dashboard/caixa', label: 'Caixa', icon: 'ti-cash' },
    { href: '/dashboard/estoque', label: 'Estoque', icon: 'ti-package' },
    { href: '/dashboard/produtos', label: 'Produtos', icon: 'ti-shopping-bag' },
  ]},
  { section: 'Marketing', items: [
    { href: '/dashboard/campanhas', label: 'Campanhas', icon: 'ti-speakerphone', badge: '3' },
    { href: '/dashboard/fidelidade', label: 'Fidelidade', icon: 'ti-star' },
  ]},
  { section: 'Gestão', items: [
    { href: '/dashboard/relatorios', label: 'Relatórios', icon: 'ti-chart-bar' },
    { href: '/dashboard/unidades', label: 'Unidades', icon: 'ti-building' },
    { href: '/dashboard/configuracoes', label: 'Configurações', icon: 'ti-settings' },
  ]},
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [isLoading, user, router]);

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: '#06060f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <i className="ti ti-loader-2" style={{ fontSize: '28px', color: '#6366f1', animation: 'spin 0.8s linear infinite', display: 'block', marginBottom: '10px' }} />
        <p style={{ fontSize: '12px', color: '#3a3a5a' }}>Carregando...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#06060f' }}>
      {/* TOP BAR */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '54px', flexShrink: 0, background: '#08081a', borderBottom: '1px solid rgba(99,102,241,0.1)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#6366f1' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-scissors" style={{ fontSize: '16px', color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1 }}>Aparato</div>
            <div style={{ fontSize: '9px', color: '#6366f1', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>Gestão Profissional</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: '#0e0e24', border: '1px solid rgba(99,102,241,0.12)', cursor: 'pointer', color: '#6366f1', position: 'relative' }}>
            <i className="ti ti-bell" style={{ fontSize: '15px' }} />
            <span style={{ position: 'absolute', top: '7px', right: '7px', width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', height: '34px', borderRadius: '8px', background: '#0e0e24', border: '1px solid rgba(99,102,241,0.12)', cursor: 'pointer' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff' }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <span style={{ fontSize: '12px', color: '#a5b4fc' }}>{user?.name?.split(' ')[0]}</span>
            <i className="ti ti-chevron-down" style={{ fontSize: '11px', color: '#3a3a5a' }} />
          </div>
          <button onClick={logout} style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: 'none', border: '1px solid rgba(99,102,241,0.1)', cursor: 'pointer', color: '#3a3a5a' }} title="Sair">
            <i className="ti ti-logout" style={{ fontSize: '15px' }} />
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* SIDEBAR */}
        <aside style={{ width: '200px', flexShrink: 0, overflowY: 'auto', padding: '16px 0', background: '#08081a', borderRight: '1px solid rgba(99,102,241,0.08)' }}>
          {nav.map(s => (
            <div key={s.section} style={{ padding: '0 10px', marginBottom: '22px' }}>
              <div style={{ fontSize: '9px', fontWeight: 600, color: '#1e1e3a', textTransform: 'uppercase', letterSpacing: '2px', padding: '0 8px', marginBottom: '6px' }}>{s.section}</div>
              {s.items.map(item => {
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12.5px', color: active ? '#a5b4fc' : '#3a3a5a', background: active ? 'rgba(99,102,241,0.1)' : 'transparent', marginBottom: '2px', textDecoration: 'none', fontWeight: active ? 500 : 400, borderLeft: active ? '2px solid #6366f1' : '2px solid transparent', transition: 'all 0.15s' }}>
                    <i className={`ti ${item.icon}`} style={{ fontSize: '15px' }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '20px', background: '#6366f1', color: '#fff' }}>{item.badge}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#06060f' }}>
          {children}
        </main>
      </div>

      {/* STATUS BAR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '0 20px', height: '26px', flexShrink: 0, fontSize: '10px', color: '#1e1e3a', background: '#08081a', borderTop: '1px solid rgba(99,102,241,0.06)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          Sistema online
        </span>
        <span style={{ marginLeft: 'auto' }}>Aparato v1.0 · Gestão Profissional</span>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
