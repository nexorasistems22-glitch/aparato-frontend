'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { tenantApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Save, Building2, Clock, Shield, Bell, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('geral');
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', state: '' });

  const { data: tenant, isLoading } = useQuery({ queryKey: ['tenant'], queryFn: tenantApi.get });

  useEffect(() => {
    if (tenant) {
      setForm({
        name: tenant.name || '',
        phone: tenant.phone || '',
        email: tenant.email || '',
        address: tenant.address || '',
        city: tenant.city || '',
        state: tenant.state || '',
      });
    }
  }, [tenant]);

  const updateMut = useMutation({
    mutationFn: tenantApi.update,
    onSuccess: () => toast.success('Configurações salvas!'),
    onError: (e: any) => toast.error(e.response?.data?.error || 'Erro ao salvar'),
  });

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Building2 },
    { id: 'horarios', label: 'Horários', icon: Clock },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
  ];

  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-light text-white">Configurações</h1>
        <p className="text-xs text-gray-500 mt-0.5">Gerencie as configurações do seu estabelecimento</p>
      </div>

      <div className="flex gap-5">
        {/* Sidebar tabs */}
        <div className="w-44 flex-shrink-0">
          <div className="card-dark p-2 space-y-0.5">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all text-left ${activeTab === tab.id ? 'bg-gold-500/10 text-gold-400' : 'text-gray-400 hover:text-white hover:bg-graphite'}`}>
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'geral' && (
            <div className="card-dark p-6 space-y-4">
              <div>
                <h2 className="text-sm font-medium text-white mb-0.5">Informações do estabelecimento</h2>
                <p className="text-xs text-gray-500">Dados principais visíveis para os clientes</p>
              </div>
              <div className="h-px bg-white/5" />

              {isLoading ? (
                <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-graphite rounded-lg animate-pulse" />)}</div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Nome do estabelecimento</label>
                    <input className="input-dark" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Telefone</label>
                      <input className="input-dark" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">E-mail</label>
                      <input type="email" className="input-dark" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Endereço</label>
                    <input className="input-dark" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Cidade</label>
                      <input className="input-dark" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Estado</label>
                      <input className="input-dark" placeholder="SP" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
                    </div>
                  </div>
                  <div className="pt-2">
                    <button onClick={() => updateMut.mutate(form)} disabled={updateMut.isPending}
                      className="btn-gold">
                      <Save size={13} />
                      {updateMut.isPending ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'horarios' && (
            <div className="card-dark p-6 space-y-4">
              <div>
                <h2 className="text-sm font-medium text-white mb-0.5">Horários de funcionamento</h2>
                <p className="text-xs text-gray-500">Configure os dias e horários de atendimento</p>
              </div>
              <div className="h-px bg-white/5" />
              <div className="space-y-2">
                {days.map((day, i) => {
                  const wh = tenant?.workingHours?.find((h: any) => h.dayOfWeek === i && !h.professionalId);
                  const isOpen = wh?.isWorking ?? (i !== 0);
                  return (
                    <div key={day} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: '#2A2A2A' }}>
                      <div className="w-20 text-xs text-gray-400">{day}</div>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOpen ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                      {isOpen ? (
                        <>
                          <input type="time" defaultValue={wh?.startTime || '09:00'}
                            className="input-dark py-1 text-xs w-24" />
                          <span className="text-gray-600 text-xs">até</span>
                          <input type="time" defaultValue={wh?.endTime || '18:00'}
                            className="input-dark py-1 text-xs w-24" />
                          <span className="text-[10px] text-gray-600 ml-2">Almoço:</span>
                          <input type="time" defaultValue={wh?.lunchStart || '12:00'}
                            className="input-dark py-1 text-xs w-24" />
                          <span className="text-gray-600 text-xs">–</span>
                          <input type="time" defaultValue={wh?.lunchEnd || '13:00'}
                            className="input-dark py-1 text-xs w-24" />
                        </>
                      ) : (
                        <span className="text-xs text-gray-600">Fechado</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <button className="btn-gold"><Save size={13} /> Salvar horários</button>
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <div className="card-dark p-6 space-y-4">
              <div>
                <h2 className="text-sm font-medium text-white mb-0.5">Notificações automáticas</h2>
                <p className="text-xs text-gray-500">Configure os lembretes automáticos para clientes</p>
              </div>
              <div className="h-px bg-white/5" />
              {[
                { label: 'Confirmação de agendamento', desc: 'Enviar mensagem quando um agendamento é criado', default: true },
                { label: 'Lembrete 24h antes', desc: 'Notificar o cliente no dia anterior', default: true },
                { label: 'Lembrete 1h antes', desc: 'Notificar o cliente 1 hora antes', default: false },
                { label: 'Reativação de inativos', desc: 'Mensagem automática para clientes sem visita há 30 dias', default: true },
                { label: 'Parabéns de aniversário', desc: 'Mensagem automática no dia do aniversário', default: true },
                { label: 'Pesquisa de satisfação', desc: 'Enviar pesquisa após atendimento concluído', default: false },
              ].map(({ label, desc, default: def }) => {
                const [enabled, setEnabled] = useState(def);
                return (
                  <div key={label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#2A2A2A' }}>
                    <div>
                      <div className="text-xs text-white">{label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{desc}</div>
                    </div>
                    <div onClick={() => setEnabled(!enabled)}
                      className="relative w-9 h-5 rounded-full cursor-pointer transition-all flex-shrink-0 ml-4"
                      style={{ background: enabled ? '#C9A84C' : '#3D3D3D' }}>
                      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                        style={{ left: enabled ? '18px' : '2px' }} />
                    </div>
                  </div>
                );
              })}
              <button className="btn-gold"><Save size={13} /> Salvar preferências</button>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div className="card-dark p-6 space-y-4">
              <div>
                <h2 className="text-sm font-medium text-white mb-0.5">Segurança</h2>
                <p className="text-xs text-gray-500">Gerencie senhas e acessos</p>
              </div>
              <div className="h-px bg-white/5" />

              <div className="p-3 rounded-xl space-y-1" style={{ background: '#2A2A2A' }}>
                <div className="text-xs text-white">Usuário atual</div>
                <div className="text-[11px] text-gray-400">{user?.email}</div>
                <div className="text-[10px] px-1.5 py-0.5 rounded inline-block mt-1"
                  style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
                  {user?.role}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs text-white">Alterar senha</h3>
                {['Senha atual', 'Nova senha', 'Confirmar nova senha'].map(label => (
                  <div key={label}>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">{label}</label>
                    <input type="password" className="input-dark" placeholder="••••••••" />
                  </div>
                ))}
                <button className="btn-gold"><Save size={13} /> Alterar senha</button>
              </div>

              <div className="p-3 rounded-xl" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
                <div className="text-xs text-gold-400 mb-1">🔒 LGPD & Segurança</div>
                <div className="text-[10px] text-gray-500">
                  Todos os dados são armazenados com criptografia. Backups automáticos diários.
                  Conforme à Lei Geral de Proteção de Dados (LGPD).
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
