'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi, appointmentsApi, cashFlowApi } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Scissors, DollarSign, Award, Target } from 'lucide-react';

const COLORS = ['#C9A84C', '#6BAFF0', '#3DCFA0', '#9B8AEE', '#E24B4A', '#E8C97A'];

function KPICard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="card-dark p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-wider text-gray-500">{label}</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18`, color }}>
          <Icon size={14} />
        </div>
      </div>
      <div className="font-display text-2xl font-light text-white">{value}</div>
      {sub && <div className="text-[11px] text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-dark p-2.5 text-xs border" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('r$')
            ? `R$ ${p.value.toFixed(2)}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function RelatoriosPage() {
  const { data: dash } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get });
  const { data: cashData } = useQuery({
    queryKey: ['cashflow-report'],
    queryFn: () => cashFlowApi.list({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    }),
  });

  const m = dash?.metrics;
  const revenueData = dash?.charts?.revenueByDay || [];

  const profData = (dash?.topProfessionals || []).map((p: any) => ({
    name: p.professional?.name?.split(' ')[0] || '?',
    'R$ Receita': p.revenue,
    'Atendimentos': p.appointments,
  }));

  const svcData = (dash?.topServices || []).map((s: any) => ({
    name: s.service?.name || '?',
    value: s.revenue,
    count: s.count,
  }));

  const totalSvcRev = svcData.reduce((a: number, s: any) => a + s.value, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-light text-white">Relatórios</h1>
          <p className="text-xs text-gray-500 mt-0.5">Análise completa do seu negócio</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline-gold text-xs py-2 px-4">📊 Exportar PDF</button>
          <button className="btn-outline-gold text-xs py-2 px-4">📁 Exportar Excel</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Faturamento Mês" icon={DollarSign} color="#C9A84C"
          value={`R$ ${(m?.revenue?.current || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
          sub={`${m?.revenue?.growth >= 0 ? '+' : ''}${m?.revenue?.growth || 0}% vs mês ant.`} />
        <KPICard label="Atendimentos" icon={Scissors} color="#6BAFF0"
          value={m?.appointments?.month || 0}
          sub={`${m?.appointments?.growth >= 0 ? '+' : ''}${m?.appointments?.growth || 0}% crescimento`} />
        <KPICard label="Ticket Médio" icon={Target} color="#3DCFA0"
          value={`R$ ${(m?.avgTicket || 0).toFixed(2)}`}
          sub="Por atendimento" />
        <KPICard label="Total Clientes" icon={Users} color="#9B8AEE"
          value={m?.clients?.total || 0}
          sub={`+${m?.clients?.newThisMonth || 0} novos este mês`} />
      </div>

      {/* Revenue chart + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card-dark p-5 lg:col-span-2">
          <div className="text-sm font-medium text-white mb-1">Receita — últimos 7 dias</div>
          <div className="text-xs text-gray-500 mb-4">Histórico de faturamento</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData.map((d: any) => ({
              name: new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
              'R$ Receita': d.revenue,
            }))}>
              <defs>
                <linearGradient id="areaGradR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#7A7A7A', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#7A7A7A', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="R$ Receita" stroke="#C9A84C" strokeWidth={2}
                fill="url(#areaGradR)" dot={{ fill: '#C9A84C', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-dark p-5">
          <div className="text-sm font-medium text-white mb-1">Mix de Serviços</div>
          <div className="text-xs text-gray-500 mb-4">Por receita — mês atual</div>
          {svcData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={svcData} cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                    dataKey="value" paddingAngle={3}>
                    {svcData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {svcData.map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-400 flex-1 truncate">{s.name}</span>
                    <span className="text-white font-medium">
                      {totalSvcRev > 0 ? Math.round((s.value / totalSvcRev) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-xs text-gray-600">Sem dados ainda</div>
          )}
        </div>
      </div>

      {/* Professionals performance */}
      {profData.length > 0 && (
        <div className="card-dark p-5">
          <div className="text-sm font-medium text-white mb-1">Performance dos Profissionais</div>
          <div className="text-xs text-gray-500 mb-5">Receita e atendimentos por profissional — mês atual</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={profData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#B0B0B0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#7A7A7A', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#7A7A7A', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="R$ Receita" fill="#C9A84C" radius={[3, 3, 0, 0]} />
              <Bar yAxisId="right" dataKey="Atendimentos" fill="rgba(107,175,240,0.5)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Financial summary */}
      {cashData && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Receitas', value: cashData.summary?.income || 0, color: '#3DCFA0', prefix: 'R$ ' },
            { label: 'Total Despesas', value: cashData.summary?.expense || 0, color: '#E24B4A', prefix: 'R$ ' },
            { label: 'Lucro Líquido', value: cashData.summary?.balance || 0, color: '#C9A84C', prefix: 'R$ ' },
          ].map(({ label, value, color, prefix }) => (
            <div key={label} className="card-dark p-5 text-center">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">{label}</div>
              <div className="font-display text-3xl font-light" style={{ color }}>
                {prefix}{Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
