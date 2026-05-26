'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalsApi, servicesApi } from '@/lib/api';
import { Plus, X, UserCheck, Award, Clock, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

function ProModal({ onClose, onSave }: any) {
  const { data: svcs } = useQuery({ queryKey: ['services'], queryFn: servicesApi.list });
  const [form, setForm] = useState({
    name: '', phone: '', email: '', bio: '', commissionRate: 40, colorCode: '#C9A84C', serviceIds: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  const toggleSvc = (id: string) =>
    setForm(f => ({ ...f, serviceIds: f.serviceIds.includes(id) ? f.serviceIds.filter(s => s !== id) : [...f.serviceIds, id] }));

  const colors = ['#C9A84C', '#6BAFF0', '#3DCFA0', '#9B8AEE', '#F06B6A', '#E8C97A'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="card-dark w-full max-w-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-white">Novo Profissional</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Nome *</label>
              <input className="input-dark" placeholder="Nome completo"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Telefone</label>
              <input className="input-dark" placeholder="(11) 99999-9999"
                value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">E-mail</label>
            <input type="email" className="input-dark" placeholder="pro@email.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Bio / Especialidade</label>
            <textarea className="input-dark resize-none" rows={2}
              value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Ex: Especialista em degradê e barba..." />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Comissão (%)</label>
            <input type="number" className="input-dark" min={0} max={100}
              value={form.commissionRate} onChange={e => setForm(f => ({ ...f, commissionRate: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Cor na agenda</label>
            <div className="flex gap-2">
              {colors.map(c => (
                <div key={c} onClick={() => setForm(f => ({ ...f, colorCode: c }))}
                  className="w-7 h-7 rounded-full cursor-pointer transition-all"
                  style={{ background: c, outline: form.colorCode === c ? `2px solid white` : 'none', outlineOffset: 2 }} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2">Serviços que realiza</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(svcs?.data || []).map((s: any) => {
                const sel = form.serviceIds.includes(s.id);
                return (
                  <div key={s.id} onClick={() => toggleSvc(s.id)}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-all"
                    style={{ background: sel ? 'rgba(201,168,76,0.08)' : '#2A2A2A', color: sel ? '#E8C97A' : '#B0B0B0' }}>
                    <div className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0"
                      style={{ background: sel ? '#C9A84C' : 'transparent', borderColor: sel ? '#C9A84C' : '#555' }}>
                      {sel && <span className="text-black text-[8px]">✓</span>}
                    </div>
                    {s.name}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-outline-gold flex-1 py-2.5">Cancelar</button>
            <button onClick={async () => { setSaving(true); try { await onSave(form); onClose(); } finally { setSaving(false); } }}
              disabled={saving || !form.name} className="btn-gold flex-1 justify-center py-2.5">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfissionaisPage() {
  const [showModal, setShowModal] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['professionals'], queryFn: professionalsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: professionalsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['professionals'] }); toast.success('Profissional cadastrado!'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro'),
  });

  const professionals = data?.data || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-light text-white">Profissionais</h1>
          <p className="text-xs text-gray-500 mt-0.5">{professionals.length} profissional(is) ativo(s)</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-gold"><Plus size={14} /> Novo</button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 card-dark animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {professionals.map((p: any) => (
            <div key={p.id} className="card-dark p-5 hover:border-gold-500/20 transition-all">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-display font-medium text-white flex-shrink-0"
                  style={{ background: p.colorCode + '25', color: p.colorCode }}>
                  {p.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{p.name}</div>
                  {p.bio && <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{p.bio}</div>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { icon: Award, label: `${p.commissionRate}% comissão` },
                  { icon: UserCheck, label: p.isActive ? 'Ativo' : 'Inativo' },
                  { icon: TrendingUp, label: `${p.services?.length || 0} serviços` },
                  { icon: Clock, label: p.acceptOnline ? 'Online ✓' : 'Somente presencial' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <Icon size={10} className="text-gray-600" />
                    {label}
                  </div>
                ))}
              </div>

              {p.phone && <p className="text-[11px] text-gray-500">{p.phone}</p>}
            </div>
          ))}

          {professionals.length === 0 && (
            <div className="col-span-3 py-16 text-center">
              <UserCheck size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Nenhum profissional cadastrado</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <ProModal onClose={() => setShowModal(false)} onSave={createMutation.mutateAsync} />
      )}
    </div>
  );
}
