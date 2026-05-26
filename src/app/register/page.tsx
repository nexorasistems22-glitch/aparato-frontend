'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Scissors, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    tenantName: '', tenantSlug: '', ownerName: '', email: '', password: '', phone: '',
  });

  const updateSlug = (name: string) => {
    const slug = name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setForm(f => ({ ...f, tenantName: name, tenantSlug: slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register(form);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-onyx flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
            style={{ background: 'rgba(61,207,160,0.15)' }}>
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <h1 className="font-display text-3xl font-light text-white mb-3">Pronto!</h1>
          <p className="text-gray-400 text-sm mb-8">
            Seu estabelecimento <strong className="text-gold-500">{form.tenantName}</strong> foi criado com sucesso.
          </p>
          <button onClick={() => router.push('/login')} className="btn-gold w-full justify-center py-3">
            Entrar no sistema
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onyx flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)' }} />

      <div className="w-full max-w-sm relative animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #E8C97A 100%)' }}>
            <Scissors size={20} className="text-black" />
          </div>
          <h1 className="font-display text-2xl font-light text-white">Criar estabelecimento</h1>
          <p className="text-xs text-gray-500 mt-1">Configure seu negócio em minutos</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#2A2A2A' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ background: '#C9A84C', width: step >= s ? '100%' : '0%' }} />
            </div>
          ))}
        </div>

        <div className="card-dark p-7">
          {error && (
            <div className="p-3 rounded-lg mb-4 text-xs"
              style={{ background: 'rgba(226,75,74,0.1)', color: '#E24B4A' }}>
              {error}
            </div>
          )}

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <h2 className="text-sm font-medium text-white mb-4">Sobre o estabelecimento</h2>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Nome do estabelecimento</label>
                  <input className="input-dark" placeholder="Barbearia Premium" value={form.tenantName}
                    onChange={e => updateSlug(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">URL de acesso (slug)</label>
                  <input className="input-dark" placeholder="barbearia-premium" value={form.tenantSlug}
                    onChange={e => setForm(f => ({ ...f, tenantSlug: e.target.value }))} required />
                  <p className="text-xs text-gray-600 mt-1">
                    Acesso: ahoradoestilo.com/<span className="text-gold-500">{form.tenantSlug || 'slug'}</span>
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Telefone</label>
                  <input className="input-dark" placeholder="(11) 99999-9999" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-sm font-medium text-white mb-4">Sua conta de acesso</h2>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Seu nome</label>
                  <input className="input-dark" placeholder="João Silva" value={form.ownerName}
                    onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">E-mail</label>
                  <input type="email" className="input-dark" placeholder="joao@email.com" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Senha</label>
                  <input type="password" className="input-dark" placeholder="Mín. 6 caracteres" value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} minLength={6} required />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="btn-outline-gold flex-1 py-3">
                  Voltar
                </button>
              )}
              <button type="submit" disabled={loading} className="btn-gold flex-1 justify-center py-3">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    Criando...
                  </span>
                ) : step === 1 ? 'Continuar →' : 'Criar conta'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          Já tem conta?{' '}
          <a href="/login" className="text-gold-500 hover:text-gold-400">Entrar</a>
        </p>
      </div>
    </div>
  );
}
