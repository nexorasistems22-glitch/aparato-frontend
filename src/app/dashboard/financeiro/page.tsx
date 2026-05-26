'use client';
// ─── FINANCEIRO PAGE ───────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cashFlowApi } from '@/lib/api';
import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinanceiroPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'INCOME', category: '', description: '', amount: '' });
  const qc = useQueryClient();

  const now = new Date();
  const { data, isLoading } = useQuery({
    queryKey: ['cashflow'],
    queryFn: () => cashFlowApi.list({
      startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    }),
  });

  const mutation = useMutation({
    mutationFn: cashFlowApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cashflow'] });
      toast.success('Lançamento salvo!');
      setShowModal(false);
      setForm({ type: 'INCOME', category: '', description: '', amount: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro'),
  });

  const summary = data?.summary || { income: 0, expense: 0, balance: 0 };
  const entries = data?.data || [];

  // Chart: group by day
  const byDay: Record<string, { receita: number; despesa: number }> = {};
  entries.forEach((e: any) => {
    const day = format(new Date(e.date), 'dd/MM', { locale: ptBR });
    if (!byDay[day]) byDay[day] = { receita: 0, despesa: 0 };
    if (e.type === 'INCOME') byDay[day].receita += e.amount;
    else byDay[day].despesa += e.amount;
  });
  const chartData = Object.entries(byDay).slice(-10).map(([name, v]) => ({ name, ...v }));

  const catIncomes = ['Serviços', 'Produtos', 'Mensalidade', 'Outro'];
  const catExpenses = ['Aluguel', 'Funcionários', 'Produtos', 'Manutenção', 'Marketing', 'Outro'];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-light text-white">Financeiro</h1>
          <p className="text-xs text-gray-500 mt-0.5">Fluxo de caixa — {format(now, 'MMMM yyyy', { locale: ptBR })}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-gold"><Plus size={14} /> Lançamento</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Receitas', value: summary.income, icon: TrendingUp, color: '#3DCFA0', bg: 'rgba(61,207,160,0.1)' },
          { label: 'Despesas', value: summary.expense, icon: TrendingDown, color: '#E24B4A', bg: 'rgba(226,75,74,0.1)' },
          { label: 'Saldo', value: summary.balance, icon: DollarSign, color: '#C9A84C', bg: 'rgba(201,168,76,0.1)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card-dark p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-wider text-gray-500">{label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <div className="font-display text-2xl font-light" style={{ color }}>
              R$ {Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card-dark p-5">
          <div className="text-sm font-medium text-white mb-4">Receitas × Despesas por dia</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#7A7A7A', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#7A7A7A', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
              <Tooltip contentStyle={{ background: '#1C1C1C', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 7, fontSize: 11 }} />
              <Bar dataKey="receita" fill="#3DCFA0" radius={[3, 3, 0, 0]} name="Receita" />
              <Bar dataKey="despesa" fill="#E24B4A" radius={[3, 3, 0, 0]} name="Despesa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="card-dark overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'].map(h => (
                <th key={h} className="text-left text-[10px] uppercase tracking-wider text-gray-500 px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                {[1,2,3,4,5].map(j => (
                  <td key={j} className="px-4 py-3"><div className="h-3 bg-graphite rounded animate-pulse" /></td>
                ))}
              </tr>
            ))}
            {entries.slice(0, 30).map((e: any) => (
              <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td className="px-4 py-3 text-[11px] text-gray-400">
                  {format(new Date(e.date), 'dd/MM/yy', { locale: ptBR })}
                </td>
                <td className="px-4 py-3 text-[12px] text-white">{e.description}</td>
                <td className="px-4 py-3 text-[11px] text-gray-400">{e.category}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${e.type === 'INCOME' ? 'badge-completed' : 'badge-cancelled'}`}>
                    {e.type === 'INCOME' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className={`px-4 py-3 text-[12px] font-medium ${e.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {e.type === 'INCOME' ? '+' : '-'} R$ {e.amount?.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="card-dark w-full max-w-sm p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-medium text-white">Novo Lançamento</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[{ v: 'INCOME', l: 'Receita', c: '#3DCFA0' }, { v: 'EXPENSE', l: 'Despesa', c: '#E24B4A' }].map(({ v, l, c }) => (
                  <div key={v} onClick={() => setForm(f => ({ ...f, type: v }))}
                    className="flex items-center justify-center py-2 rounded-lg cursor-pointer text-xs font-medium transition-all"
                    style={{ background: form.type === v ? `${c}20` : '#2A2A2A', color: form.type === v ? c : '#B0B0B0', border: `1px solid ${form.type === v ? c : 'transparent'}` }}>
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Categoria</label>
                <select className="input-dark" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">Selecionar...</option>
                  {(form.type === 'INCOME' ? catIncomes : catExpenses).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Descrição</label>
                <input className="input-dark" placeholder="Ex: Aluguel de maio"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Valor (R$)</label>
                <input type="number" step="0.01" className="input-dark" placeholder="0,00"
                  value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-outline-gold flex-1 py-2.5">Cancelar</button>
                <button onClick={() => mutation.mutate({ ...form, amount: parseFloat(form.amount) })}
                  disabled={mutation.isPending || !form.amount || !form.description}
                  className="btn-gold flex-1 justify-center py-2.5">
                  {mutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
