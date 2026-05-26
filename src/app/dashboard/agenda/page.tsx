'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, clientsApi, professionalsApi, servicesApi } from '@/lib/api';
import { format, addDays, subDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X, Check, Clock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  SCHEDULED:   { label: 'Agendado',   color: '#6BAFF0', bg: 'rgba(107,175,240,0.15)' },
  CONFIRMED:   { label: 'Confirmado', color: '#C9A84C', bg: 'rgba(201,168,76,0.15)' },
  IN_PROGRESS: { label: 'Em atend.',  color: '#E8C97A', bg: 'rgba(232,201,122,0.15)' },
  COMPLETED:   { label: 'Concluído',  color: '#3DCFA0', bg: 'rgba(61,207,160,0.15)' },
  CANCELLED:   { label: 'Cancelado',  color: '#7A7A7A', bg: 'rgba(122,122,122,0.1)' },
  NO_SHOW:     { label: 'Não veio',   color: '#E24B4A', bg: 'rgba(226,75,74,0.1)' },
};

function NewAppointmentModal({ onClose, defaultDate }: { onClose: () => void; defaultDate: string }) {
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    clientId: '', professionalId: '', serviceIds: [] as string[],
    date: defaultDate, startTime: '', notes: '',
  });
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const { data: clients } = useQuery({ queryKey: ['clients-list'], queryFn: () => clientsApi.list({ limit: 100 }) });
  const { data: pros } = useQuery({ queryKey: ['professionals'], queryFn: professionalsApi.list });
  const { data: svcs } = useQuery({ queryKey: ['services'], queryFn: servicesApi.list });

  const toggleService = (id: string) => {
    setForm(f => ({
      ...f,
      serviceIds: f.serviceIds.includes(id)
        ? f.serviceIds.filter(s => s !== id)
        : [...f.serviceIds, id],
    }));
    setSlots([]);
    setForm(f => ({ ...f, startTime: '' }));
  };

  const loadSlots = async () => {
    if (!form.professionalId || !form.date || !form.serviceIds.length) return;
    setLoadingSlots(true);
    try {
      const res = await appointmentsApi.availability({
        professionalId: form.professionalId,
        date: form.date,
        serviceIds: form.serviceIds.join(','),
      });
      setSlots(res.slots);
    } finally {
      setLoadingSlots(false);
    }
  };

  const mutation = useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento criado!');
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao agendar'),
  });

  const steps = ['Cliente', 'Serviços', 'Horário', 'Confirmar'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="card-dark w-full max-w-lg p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-medium text-white">Novo Agendamento</h2>
            <p className="text-xs text-gray-500 mt-0.5">{steps[step - 1]}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={16} /></button>
        </div>

        {/* Step indicators */}
        <div className="flex gap-1.5 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#2A2A2A' }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ background: '#C9A84C', width: step > i ? '100%' : '0%' }} />
            </div>
          ))}
        </div>

        <div className="min-h-40">
          {/* Step 1: Client + Professional */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Cliente *</label>
                <select className="input-dark" value={form.clientId}
                  onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}>
                  <option value="">Selecionar cliente...</option>
                  {(clients?.data || []).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Profissional *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(pros?.data || []).map((p: any) => (
                    <div key={p.id} onClick={() => setForm(f => ({ ...f, professionalId: p.id }))}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all"
                      style={{
                        background: form.professionalId === p.id ? 'rgba(201,168,76,0.1)' : '#2A2A2A',
                        border: `1px solid ${form.professionalId === p.id ? 'rgba(201,168,76,0.4)' : 'transparent'}`,
                      }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-display text-white"
                        style={{ background: p.colorCode || '#C9A84C' }}>
                        {p.name.charAt(0)}
                      </div>
                      <span className="text-xs text-white">{p.name.split(' ')[0]}</span>
                      {form.professionalId === p.id && <Check size={11} className="ml-auto text-gold-500" />}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Data *</label>
                <input type="date" className="input-dark" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {step === 2 && (
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-3">
                Serviços * (selecione um ou mais)
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(svcs?.data || []).map((s: any) => {
                  const sel = form.serviceIds.includes(s.id);
                  return (
                    <div key={s.id} onClick={() => toggleService(s.id)}
                      className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all"
                      style={{
                        background: sel ? 'rgba(201,168,76,0.08)' : '#2A2A2A',
                        border: `1px solid ${sel ? 'rgba(201,168,76,0.3)' : 'transparent'}`,
                      }}>
                      <div>
                        <div className="text-xs text-white">{s.name}</div>
                        <div className="text-[10px] text-gray-500">{s.duration} min</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gold-400">R$ {s.price?.toFixed(2)}</span>
                        <div className="w-4 h-4 rounded border flex items-center justify-center"
                          style={{ background: sel ? '#C9A84C' : 'transparent', borderColor: sel ? '#C9A84C' : '#555' }}>
                          {sel && <Check size={10} className="text-black" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {form.serviceIds.length > 0 && (
                <div className="mt-3 text-xs text-gray-400">
                  {form.serviceIds.length} serviço(s) • Total: R${' '}
                  {(svcs?.data || [])
                    .filter((s: any) => form.serviceIds.includes(s.id))
                    .reduce((acc: number, s: any) => acc + s.price, 0)
                    .toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Time slot */}
          {step === 3 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[10px] uppercase tracking-wider text-gray-500">
                  Horário disponível *
                </label>
                <button onClick={loadSlots} className="text-xs text-gold-500 hover:text-gold-400 flex items-center gap-1">
                  {loadingSlots ? <span className="w-3 h-3 rounded-full border border-gold-500 border-t-transparent animate-spin" /> : <Clock size={11} />}
                  {slots.length ? 'Atualizar' : 'Ver horários'}
                </button>
              </div>
              {slots.length === 0 && !loadingSlots && (
                <p className="text-xs text-gray-600 py-4">Clique em "Ver horários" para carregar os slots disponíveis</p>
              )}
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {slots.map(s => (
                  <div key={s} onClick={() => setForm(f => ({ ...f, startTime: s }))}
                    className="text-center text-xs py-2 rounded-lg cursor-pointer transition-all"
                    style={{
                      background: form.startTime === s ? '#C9A84C' : '#2A2A2A',
                      color: form.startTime === s ? '#000' : '#B0B0B0',
                    }}>
                    {s}
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Observações</label>
                <textarea className="input-dark resize-none" rows={2}
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Alguma observação para este agendamento..." />
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <div className="space-y-2">
              {[
                ['Cliente', (clients?.data || []).find((c: any) => c.id === form.clientId)?.name],
                ['Profissional', (pros?.data || []).find((p: any) => p.id === form.professionalId)?.name],
                ['Data', format(new Date(form.date + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR })],
                ['Horário', form.startTime],
                ['Serviços', (svcs?.data || []).filter((s: any) => form.serviceIds.includes(s.id)).map((s: any) => s.name).join(', ')],
                ['Total', `R$ ${(svcs?.data || []).filter((s: any) => form.serviceIds.includes(s.id)).reduce((a: number, s: any) => a + s.price, 0).toFixed(2)}`],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between text-xs p-2.5 rounded"
                  style={{ background: '#2A2A2A' }}>
                  <span className="text-gray-500">{label}</span>
                  <span className="text-white font-medium">{value || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-outline-gold flex-1 py-2.5">← Voltar</button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={
                (step === 1 && (!form.clientId || !form.professionalId || !form.date)) ||
                (step === 2 && form.serviceIds.length === 0) ||
                (step === 3 && !form.startTime)
              }
              className="btn-gold flex-1 justify-center py-2.5">
              Continuar →
            </button>
          ) : (
            <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}
              className="btn-gold flex-1 justify-center py-2.5">
              {mutation.isPending ? 'Agendando...' : '✓ Confirmar Agendamento'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNew, setShowNew] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const qc = useQueryClient();

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', dateStr],
    queryFn: () => appointmentsApi.list({ date: dateStr, limit: 50 }),
    staleTime: 15_000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: any) => appointmentsApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Status atualizado!');
      setSelectedAppt(null);
    },
  });

  const appointments = data?.data || [];

  // Group by hour
  const hours = Array.from({ length: 12 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });

  return (
    <div className="flex gap-4 h-full animate-fade-in">
      {/* Left: Calendar + mini list */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="font-display text-2xl font-light text-white">Agenda</h1>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedDate(d => subDays(d, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white transition-colors"
              style={{ background: '#2A2A2A' }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
              style={{ background: '#2A2A2A' }}>
              Hoje
            </button>
            <button onClick={() => setSelectedDate(d => addDays(d, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white transition-colors"
              style={{ background: '#2A2A2A' }}>
              <ChevronRight size={14} />
            </button>
            <button onClick={() => setShowNew(true)} className="btn-gold ml-2">
              <Plus size={14} /> Novo
            </button>
          </div>
        </div>

        {/* Week strip */}
        <div className="flex gap-1.5 mb-4">
          {Array.from({ length: 7 }, (_, i) => {
            const day = addDays(weekStart, i);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const isSelected = format(day, 'yyyy-MM-dd') === dateStr;
            return (
              <div key={i} onClick={() => setSelectedDate(day)}
                className="flex-1 flex flex-col items-center py-2 rounded-xl cursor-pointer transition-all"
                style={{
                  background: isSelected ? 'rgba(201,168,76,0.15)' : '#1C1C1C',
                  border: `1px solid ${isSelected ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.04)'}`,
                }}>
                <span className="text-[9px] uppercase text-gray-500">
                  {format(day, 'EEE', { locale: ptBR })}
                </span>
                <span className={`text-sm font-medium mt-0.5 ${isSelected ? 'text-gold-400' : isToday ? 'text-white' : 'text-gray-400'}`}>
                  {format(day, 'd')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="card-dark overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-14 bg-graphite rounded-lg animate-pulse" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar size={36} className="text-gray-700 mb-3" />
              <p className="text-sm text-gray-500">Nenhum agendamento para este dia</p>
              <button onClick={() => setShowNew(true)} className="btn-gold mt-4">
                <Plus size={14} /> Agendar
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {appointments.map((appt: any) => {
                const st = STATUS_MAP[appt.status] || STATUS_MAP.SCHEDULED;
                return (
                  <div key={appt.id} onClick={() => setSelectedAppt(appt)}
                    className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors">
                    <div className="text-[11px] font-medium text-gold-400 w-12 flex-shrink-0">{appt.startTime}</div>
                    <div className="w-1 h-10 rounded-full flex-shrink-0"
                      style={{ background: appt.professional?.colorCode || '#C9A84C' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] text-white">{appt.client?.name}</div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {appt.services?.map((s: any) => s.service?.name).join(' · ')}
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-500">{appt.professional?.name?.split(' ')[0]}</div>
                    <div className="text-[11px] text-gray-400">{appt.totalDuration}min</div>
                    <span className="text-[10px] font-medium px-2 py-1 rounded-full flex-shrink-0"
                      style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                    <span className="text-[12px] font-medium text-white">
                      R$ {appt.totalPrice?.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Appointment detail */}
      {selectedAppt && (
        <div className="w-72 flex-shrink-0 animate-slide-up">
          <div className="card-dark p-5 sticky top-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500">Detalhes</span>
              <button onClick={() => setSelectedAppt(null)} className="text-gray-500 hover:text-white">
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              {[
                ['Cliente', selectedAppt.client?.name],
                ['Profissional', selectedAppt.professional?.name],
                ['Horário', `${selectedAppt.startTime} – ${selectedAppt.endTime}`],
                ['Duração', `${selectedAppt.totalDuration} min`],
                ['Total', `R$ ${selectedAppt.totalPrice?.toFixed(2)}`],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between text-xs">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4">
              <div className="text-[10px] uppercase tracking-wider text-gray-600 mb-2">Alterar status</div>
              <div className="grid grid-cols-2 gap-1.5">
                {['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELLED'].map(s => {
                  const st = STATUS_MAP[s];
                  return (
                    <button key={s}
                      onClick={() => statusMutation.mutate({ id: selectedAppt.id, status: s })}
                      className="text-[10px] px-2 py-1.5 rounded-lg transition-all hover:opacity-80"
                      style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {showNew && (
        <NewAppointmentModal
          onClose={() => setShowNew(false)}
          defaultDate={dateStr}
        />
      )}
    </div>
  );
}
