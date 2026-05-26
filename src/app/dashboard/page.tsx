'use client';

import { useAuth } from '@/contexts/AuthContext';

const metrics = [
  { label: 'Agendamentos hoje', value: '24', icon: 'ti-calendar', change: '+12%', up: true },
  { label: 'Faturamento do mês', value: 'R$ 8.420', icon: 'ti-currency-dollar', change: '+8%', up: true },
  { label: 'Novos clientes', value: '38', icon: 'ti-users', change: '+5%', up: true },
  { label: 'Taxa de retorno', value: '68%', icon: 'ti-repeat', change: '-2%', up: false },
];

const appointments = [
  { time: '09:00', client: 'João Silva', service: 'Corte + Barba', prof: 'Carlos', status: 'confirmed' },
  { time: '10:00', client: 'Pedro Alves', service: 'Corte Degradê', prof: 'Lucas', status: 'in_progress' },
  { time: '11:30', client: 'Marcos Lima', service: 'Barba', prof: 'Carlos', status: 'scheduled' },
  { time: '14:00', client: 'Rafael Costa', service: 'Corte + Barba', prof: 'Lucas', status: 'scheduled' },
  { time: '15:30', client: 'Bruno Souza', service: 'Corte Simples', prof: 'Carlos', status: 'scheduled' },
];

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  confirmed:   { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc', label: 'Confirmado' },
  in_progress: { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80', label: 'Em atendimento' },
  scheduled:   { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', label: 'Agendado' },
  completed:   { bg: 'rgba(34,197,94,0.1)',   color: '#4ade80', label: 'Concluído' },
  cancelled:   { bg: 'rgba(239,68,68,0.1)',   color: '#f87171', label: 'Cancelado' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div>
      {/* HEADER */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', marginBottom: '4px' }}>
              {greeting}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize: '13px', color: '#3a3a5a' }}>
              {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', background: '#6366f1', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#fff' }}>
            <i className="ti ti-plus" style={{ fontSize: '15px' }} />
            Novo agendamento
          </button>
        </div>
      </div>

      {/* METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ background: '#08081a', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(99,102,241,0.4)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`ti ${m.icon}`} style={{ fontSize: '18px', color: '#6366f1' }} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', background: m.up ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: m.up ? '#4ade80' : '#f87171' }}>
                {m.change}
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', marginBottom: '4px' }}>{m.value}</div>
            <div style={{ fontSize: '12px', color: '#3a3a5a' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* CONTENT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px' }}>
        {/* APPOINTMENTS */}
        <div style={{ background: '#08081a', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>Agendamentos de hoje</h2>
              <p style={{ fontSize: '11px', color: '#3a3a5a' }}>{appointments.length} agendamentos</p>
            </div>
            <button style={{ fontSize: '11px', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>Ver todos →</button>
          </div>
          <div>
            {appointments.map((a, i) => {
              const s = statusColors[a.status];
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < appointments.length - 1 ? '1px solid rgba(99,102,241,0.05)' : 'none' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#6366f1', minWidth: '42px', fontFamily: 'monospace' }}>{a.time}</div>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#a5b4fc', flexShrink: 0 }}>
                    {a.client.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#c8c8e8', marginBottom: '2px' }}>{a.client}</div>
                    <div style={{ fontSize: '11px', color: '#3a3a5a' }}>{a.service} · {a.prof}</div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 500, padding: '3px 8px', borderRadius: '6px', background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* QUICK ACTIONS */}
          <div style={{ background: '#08081a', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '12px', padding: '18px 20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '14px' }}>Ações rápidas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { icon: 'ti-calendar-plus', label: 'Agendar' },
                { icon: 'ti-user-plus', label: 'Novo cliente' },
                { icon: 'ti-cash', label: 'Fechar caixa' },
                { icon: 'ti-chart-bar', label: 'Relatório' },
              ].map((a, i) => (
                <button key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px 8px', borderRadius: '8px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.08)', cursor: 'pointer', color: '#a5b4fc', fontSize: '11px', fontWeight: 500 }}>
                  <i className={`ti ${a.icon}`} style={{ fontSize: '20px', color: '#6366f1' }} />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* TOP SERVICES */}
          <div style={{ background: '#08081a', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '12px', padding: '18px 20px', flex: 1 }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '14px' }}>Serviços mais pedidos</h2>
            {[
              { name: 'Corte + Barba', pct: 42 },
              { name: 'Corte Degradê', pct: 30 },
              { name: 'Barba', pct: 18 },
              { name: 'Outros', pct: 10 },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '12px', color: '#8888b8' }}>{s.name}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#a5b4fc' }}>{s.pct}%</span>
                </div>
                <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(99,102,241,0.1)' }}>
                  <div style={{ height: '100%', borderRadius: '2px', background: '#6366f1', width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
