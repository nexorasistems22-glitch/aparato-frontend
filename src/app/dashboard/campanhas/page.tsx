'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '@/lib/api';
import { Plus, X, Megaphone, Send, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CHANNELS = [
  { value: 'WHATSAPP', label: 'WhatsApp', color: '#25D366', emoji: '💬' },
  { value: 'SMS', label: 'SMS', color: '#6BAFF0', emoji: '📱' },
  { value: 'EMAIL', label: 'E-mail', color: '#C9A84C', emoji: '📧' },
  { value: 'PUSH', label: 'Push Notification', color: '#9B8AEE', emoji: '🔔' },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  DRAFT: { label: 'Rascunho', color: '#7A7A7A', bg: 'rgba(122,122,122,0.1)', icon: Clock },
  SCHEDULED: { label: 'Agendada', color: '#C9A84C', bg: 'rgba(201,168,76,0.1)', icon: Clock },
  SENDING: { label: 'Enviando', color: '#6BAFF0', bg: 'rgba(107,175,240,0.1)', icon: Send },
  SENT: { label: 'Enviada', color: '#3DCFA0', bg: 'rgba(61,207,160,0.1)', icon: CheckCircle },
  CANCELLED: { label: 'Cancelada', color: '#E24B4A', bg: 'rgba(226,75,74,0.1)', icon: X },
};

function CampaignModal({ onClose, onSave }: any) {
  const [form, setForm] = useState({ title: '', message: '', channel: 'WHATSAPP', targetType: 'all', scheduledAt: '' });
  const [saving, setSaving] = useState(false);

  const targets = [
    { value: 'all', label: 'Todos os clientes' },
    { value: 'inactive_30', label: 'Inativos há 30 dias' },
    { value: 'birthday_month', label: 'Aniversariantes do mês' },
    { value: 'top_clients', label: 'Clientes VIP (Ouro)' },
  ];

  const templates = [
    '🎉 Oferta especial! Venha aproveitar 20% de desconto no seu próximo atendimento. Agende já!',
    '💈 Olá! Sentimos sua falta. Volte esta semana e ganhe desconto especial.',
    '🎂 Parabéns pelo seu aniversário! Presente especial esperando por você.',
    '⭐ Programa de fidelidade: você acumulou pontos suficientes para resgate. Confira!',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="card-dark w-full max-w-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-white">Nova Campanha</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={16} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Título da campanha *</label>
            <input className="input-dark" placeholder="Ex: Promoção de maio"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Canal de envio *</label>
            <div className="grid grid-cols-2 gap-2">
              {CHANNELS.map(c => (
                <div key={c.value} onClick={() => setForm(f => ({ ...f, channel: c.value }))}
                  className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all text-xs"
                  style={{
                    background: form.channel === c.value ? `${c.color}15` : '#2A2A2A',
                    border: `1px solid ${form.channel === c.value ? c.color + '50' : 'transparent'}`,
                    color: form.channel === c.value ? c.color : '#B0B0B0',
                  }}>
                  <span>{c.emoji}</span> {c.label}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Público-alvo</label>
            <select className="input-dark" value={form.targetType} onChange={e => setForm(f => ({ ...f, targetType: e.target.value }))}>
              {targets.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] uppercase tracking-wider text-gray-500">Mensagem *</label>
              <span className="text-[9px] text-gray-600">{form.message.length} caracteres</span>
            </div>
            <textarea className="input-dark resize-none" rows={4} placeholder="Digite a mensagem da campanha..."
              value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
            <div className="mt-1.5">
              <p className="text-[10px] text-gray-600 mb-1">Templates rápidos:</p>
              <div className="space-y-1">
                {templates.map((t, i) => (
                  <div key={i} onClick={() => setForm(f => ({ ...f, message: t }))}
                    className="text-[10px] text-gray-500 hover:text-gray-300 cursor-pointer px-2 py-1 rounded hover:bg-graphite transition-colors truncate">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Agendar envio (opcional)</label>
            <input type="datetime-local" className="input-dark"
              value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="btn-outline-gold flex-1 py-2.5">Cancelar</button>
            <button disabled={saving || !form.title || !form.message}
              onClick={async () => {
                setSaving(true);
                try { await onSave({ ...form, scheduledAt: form.scheduledAt || undefined }); onClose(); }
                finally { setSaving(false); }
              }}
              className="btn-gold flex-1 justify-center py-2.5">
              {saving ? 'Salvando...' : form.scheduledAt ? '📅 Agendar' : '🚀 Criar Campanha'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CampanhasPage() {
  const [showModal, setShowModal] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['campaigns'], queryFn: campaignsApi.list });

  const createMut = useMutation({
    mutationFn: campaignsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Campanha criada!'); },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Erro'),
  });

  const campaigns = data?.data || [];
  const stats = {
    total: campaigns.length,
    sent: campaigns.filter((c: any) => c.status === 'SENT').length,
    scheduled: campaigns.filter((c: any) => c.status === 'SCHEDULED').length,
    draft: campaigns.filter((c: any) => c.status === 'DRAFT').length,
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-light text-white">Campanhas</h1>
          <p className="text-xs text-gray-500 mt-0.5">Marketing e relacionamento com clientes</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-gold"><Plus size={14} /> Nova Campanha</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: '#C9A84C' },
          { label: 'Enviadas', value: stats.sent, color: '#3DCFA0' },
          { label: 'Agendadas', value: stats.scheduled, color: '#6BAFF0' },
          { label: 'Rascunhos', value: stats.draft, color: '#7A7A7A' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card-dark p-4 text-center">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">{label}</div>
            <div className="font-display text-3xl font-light" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { emoji: '💬', title: 'WhatsApp funciona melhor', desc: 'Taxa de abertura 95% vs 25% do email' },
          { emoji: '🕐', title: 'Melhor horário', desc: 'Envie entre 10h-11h ou 18h-19h' },
          { emoji: '🎯', title: 'Personalize sempre', desc: 'Use o nome do cliente na mensagem' },
        ].map(({ emoji, title, desc }) => (
          <div key={title} className="p-3 rounded-xl flex items-start gap-3"
            style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }}>
            <span className="text-lg">{emoji}</span>
            <div>
              <div className="text-xs font-medium text-gold-400">{title}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 card-dark animate-pulse" />)}</div>
      ) : campaigns.length === 0 ? (
        <div className="py-16 text-center">
          <Megaphone size={36} className="text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-4">Nenhuma campanha criada</p>
          <button onClick={() => setShowModal(true)} className="btn-gold mx-auto">Criar primeira campanha</button>
        </div>
      ) : (
        <div className="space-y-2">
          {campaigns.map((c: any) => {
            const st = STATUS_MAP[c.status] || STATUS_MAP.DRAFT;
            const ch = CHANNELS.find(x => x.value === c.channel);
            const StatusIcon = st.icon;
            return (
              <div key={c.id} className="card-dark p-4 flex items-center gap-4">
                <div className="text-2xl">{ch?.emoji || '📢'}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{c.title}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5 truncate">{c.message}</div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-gray-600">{ch?.label}</span>
                    {c.scheduledAt && (
                      <span className="text-[10px] text-gray-600">
                        📅 {format(new Date(c.scheduledAt), 'dd/MM/yy HH:mm', { locale: ptBR })}
                      </span>
                    )}
                    {c.sentCount > 0 && (
                      <span className="text-[10px] text-gray-600">{c.sentCount} enviados</span>
                    )}
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded-full flex-shrink-0"
                  style={{ background: st.bg, color: st.color }}>
                  <StatusIcon size={10} /> {st.label}
                </span>
                <div className="text-[10px] text-gray-600 flex-shrink-0">
                  {format(new Date(c.createdAt), 'dd/MM/yy', { locale: ptBR })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <CampaignModal onClose={() => setShowModal(false)} onSave={createMut.mutateAsync} />}
    </div>
  );
}
