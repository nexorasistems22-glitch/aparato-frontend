'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api';
import { Search, Plus, Phone, Mail, User, Star, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function ClientModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', birthDate: '', notes: '', gender: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="card-dark w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-white">Novo Cliente</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Nome *</label>
            <input className="input-dark" placeholder="Nome completo"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Telefone</label>
              <input className="input-dark" placeholder="(11) 99999-9999"
                value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Gênero</label>
              <select className="input-dark" value={form.gender}
                onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">Não informado</option>
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Feminino</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">E-mail</label>
            <input type="email" className="input-dark" placeholder="email@exemplo.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Data de Nascimento</label>
            <input type="date" className="input-dark"
              value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Observações internas</label>
            <textarea className="input-dark resize-none" rows={2} placeholder="Preferências, alergias, obs..."
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline-gold flex-1 py-2.5">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-gold flex-1 justify-center py-2.5">
              {saving ? 'Salvando...' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoyaltyBadge({ visits }: { visits: number }) {
  if (visits >= 15) return <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(201,168,76,0.15)', color: '#E8C97A' }}>⭐ Ouro</span>;
  if (visits >= 8) return <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(176,176,176,0.1)', color: '#B0B0B0' }}>Prata</span>;
  return <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(122,122,122,0.1)', color: '#7A7A7A' }}>Bronze</span>;
}

export default function ClientesPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => clientsApi.list({ q: search || undefined }),
    staleTime: 30_000,
  });

  const { data: selectedData } = useQuery({
    queryKey: ['client', selected?.id],
    queryFn: () => clientsApi.get(selected.id),
    enabled: !!selected?.id,
  });

  const createMutation = useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente cadastrado!');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao salvar'),
  });

  const clients = data?.data || [];

  return (
    <div className="flex gap-4 h-full animate-fade-in">
      {/* List */}
      <div className="flex-1 min-w-0">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="font-display text-2xl font-light text-white">Clientes</h1>
            <p className="text-xs text-gray-500 mt-0.5">{data?.total || 0} clientes cadastrados</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-gold">
            <Plus size={14} /> Novo Cliente
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input-dark pl-9" placeholder="Buscar por nome, telefone ou email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div className="card-dark overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Cliente', 'Contato', 'Visitas', 'Gasto Total', 'Última Visita', 'Nível'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-wider text-gray-500 px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-graphite rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))}
              {!isLoading && clients.map((c: any) => (
                <tr key={c.id}
                  onClick={() => setSelected(c)}
                  className="cursor-pointer transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-gold-400 flex-shrink-0 font-display"
                        style={{ background: '#2A2A2A' }}>
                        {c.name.charAt(0)}
                      </div>
                      <span className="text-[12.5px] text-white">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[11px] text-gray-400 flex items-center gap-1">
                      {c.phone && <><Phone size={10} /> {c.phone}</>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-white">{c.totalVisits}</td>
                  <td className="px-4 py-3 text-[12px] text-white">
                    R$ {(c.totalSpent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-gray-400">
                    {c.lastVisitAt ? format(new Date(c.lastVisitAt), 'dd/MM/yy', { locale: ptBR }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <LoyaltyBadge visits={c.totalVisits} />
                  </td>
                </tr>
              ))}
              {!isLoading && clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    <Users size={28} className="mx-auto mb-2 opacity-30" />
                    Nenhum cliente encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client detail panel */}
      {selected && (
        <div className="w-72 flex-shrink-0 animate-slide-up">
          <div className="card-dark p-5 sticky top-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500">Perfil do cliente</span>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white">
                <X size={14} />
              </button>
            </div>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl text-gold-400 mx-auto mb-3 font-display"
                style={{ background: '#2A2A2A', border: '2px solid rgba(201,168,76,0.2)' }}>
                {selected.name?.charAt(0)}
              </div>
              <div className="font-medium text-white text-sm">{selected.name}</div>
              <LoyaltyBadge visits={selected.totalVisits} />
            </div>

            <div className="space-y-2 mb-5">
              {[
                { icon: Phone, label: selected.phone || '—' },
                { icon: Mail, label: selected.email || '—' },
                { icon: User, label: `${selected.totalVisits} visitas` },
                { icon: Star, label: `R$ ${(selected.totalSpent || 0).toFixed(2)} gastos` },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-gray-400">
                  <Icon size={12} className="text-gray-600" /> {label}
                </div>
              ))}
            </div>

            {selected.notes && (
              <div className="p-2.5 rounded-lg text-[11px] text-gray-400 mb-4"
                style={{ background: '#2A2A2A' }}>
                📝 {selected.notes}
              </div>
            )}

            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-600 mb-2">Últimos atendimentos</div>
              <div className="space-y-1.5">
                {(selectedData?.appointments || []).slice(0, 4).map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">
                      {format(new Date(a.date), 'dd/MM/yy', { locale: ptBR })}
                    </span>
                    <span className="text-gray-500">
                      {a.services?.map((s: any) => s.service?.name).join(', ')}
                    </span>
                    <span className="text-gold-500">R$ {a.totalPrice?.toFixed(0)}</span>
                  </div>
                ))}
                {(!selectedData?.appointments?.length) && (
                  <p className="text-[11px] text-gray-600">Sem atendimentos ainda</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <ClientModal
          onClose={() => setShowModal(false)}
          onSave={(data) => createMutation.mutateAsync(data)}
        />
      )}
    </div>
  );
}
