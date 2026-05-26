'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '@/lib/api';
import { Plus, X, Scissors, Clock, DollarSign, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

function ServiceModal({ svc, onClose, onSave }: { svc?: any; onClose: () => void; onSave: (d: any) => void }) {
  const [form, setForm] = useState({
    name: svc?.name || '',
    description: svc?.description || '',
    duration: svc?.duration || 30,
    price: svc?.price || '',
    isOnline: svc?.isOnline ?? true,
  });
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="card-dark w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-white">{svc ? 'Editar' : 'Novo'} Serviço</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Nome do serviço *</label>
            <input className="input-dark" placeholder="Ex: Corte Clássico"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Descrição</label>
            <textarea className="input-dark resize-none" rows={2} placeholder="Descrição do serviço..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Duração (min) *</label>
              <select className="input-dark" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}>
                {[15, 20, 30, 45, 60, 75, 90, 120].map(d => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Preço (R$) *</label>
              <input type="number" step="0.01" className="input-dark" placeholder="0,00"
                value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#2A2A2A' }}>
            <div onClick={() => setForm(f => ({ ...f, isOnline: !f.isOnline }))}
              className="relative w-9 h-5 rounded-full cursor-pointer transition-all flex-shrink-0"
              style={{ background: form.isOnline ? '#C9A84C' : '#3D3D3D' }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                style={{ left: form.isOnline ? '18px' : '2px' }} />
            </div>
            <div>
              <div className="text-xs text-white">Disponível no app</div>
              <div className="text-[10px] text-gray-500">Clientes podem agendar pelo aplicativo</div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-outline-gold flex-1 py-2.5">Cancelar</button>
            <button
              disabled={saving || !form.name || !form.price}
              onClick={async () => {
                setSaving(true);
                try { await onSave({ ...form, price: parseFloat(String(form.price)) }); onClose(); }
                finally { setSaving(false); }
              }}
              className="btn-gold flex-1 justify-center py-2.5">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicosPage() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['services'], queryFn: servicesApi.list });

  const createMut = useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success('Serviço criado!'); },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Erro'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => servicesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success('Serviço atualizado!'); },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Erro'),
  });

  const deleteMut = useMutation({
    mutationFn: servicesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success('Serviço removido!'); },
  });

  const services = data?.data || [];

  const totalRevenue = services.reduce((acc: number, s: any) => acc + s.price, 0);
  const avgDuration = services.length > 0
    ? Math.round(services.reduce((acc: number, s: any) => acc + s.duration, 0) / services.length)
    : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-light text-white">Serviços</h1>
          <p className="text-xs text-gray-500 mt-0.5">{services.length} serviço(s) cadastrado(s)</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-gold"><Plus size={14} /> Novo Serviço</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total de serviços', value: services.length, icon: Scissors, color: '#C9A84C' },
          { label: 'Duração média', value: `${avgDuration} min`, icon: Clock, color: '#6BAFF0' },
          { label: 'Ticket médio', value: services.length > 0 ? `R$ ${(totalRevenue / services.length).toFixed(2)}` : 'R$ 0,00', icon: DollarSign, color: '#3DCFA0' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card-dark p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={13} style={{ color }} />
              <span className="text-[10px] uppercase tracking-wider text-gray-500">{label}</span>
            </div>
            <div className="font-display text-2xl font-light text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Services grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 card-dark animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((s: any) => (
            <div key={s.id} className="card-dark p-4 group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px gold-line opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-medium text-white">{s.name}</div>
                  {s.description && (
                    <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{s.description}</div>
                  )}
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditing(s)}
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-gold-400 transition-colors"
                    style={{ background: '#2A2A2A' }}>
                    <Pencil size={11} />
                  </button>
                  <button onClick={() => { if (confirm('Remover este serviço?')) deleteMut.mutate(s.id); }}
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-red-400 transition-colors"
                    style={{ background: '#2A2A2A' }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock size={10} className="text-gray-600" /> {s.duration} min
                  </span>
                  {s.isOnline && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(61,207,160,0.1)', color: '#3DCFA0' }}>
                      App ✓
                    </span>
                  )}
                </div>
                <span className="font-display text-lg text-gold-400">
                  R$ {s.price?.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="col-span-3 py-16 text-center">
              <Scissors size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Nenhum serviço cadastrado</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <ServiceModal onClose={() => setShowModal(false)} onSave={createMut.mutateAsync} />
      )}
      {editing && (
        <ServiceModal
          svc={editing}
          onClose={() => setEditing(null)}
          onSave={(d) => updateMut.mutateAsync({ id: editing.id, data: d })}
        />
      )}
    </div>
  );
}
