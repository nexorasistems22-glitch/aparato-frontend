'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ slug: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password, form.slug);
      toast.success('Bem-vindo de volta!');
      router.push('/dashboard');
    } catch {
      setError('Credenciais inválidas. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const S: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#06060f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0px' },
    wrap: { width: '100%', maxWidth: '100%', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.2)', minHeight: '580px' },
    left: { background: '#06060f', padding: '52px 44px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(99,102,241,0.1)', position: 'relative', overflow: 'hidden' },
    accentLine: { position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#6366f1' },
    glow: { position: 'absolute', top: '-100px', left: '-100px', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(99,102,241,0.06)', pointerEvents: 'none' },
    logo: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', position: 'relative', zIndex: 1 },
    logoIcon: { width: '42px', height: '42px', borderRadius: '10px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    logoName: { fontSize: '18px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' },
    logoTag: { fontSize: '10px', color: '#6366f1', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '2px' },
    badge: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', padding: '5px 12px', fontSize: '11px', color: '#a5b4fc', marginBottom: '20px', width: 'fit-content' },
    badgeDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', flexShrink: 0 },
    headline: { fontSize: '32px', fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: '12px', letterSpacing: '-0.5px' },
    sub: { fontSize: '13px', color: '#4a4a6a', lineHeight: 1.8, marginBottom: '36px', maxWidth: '300px' },
    divider: { width: '32px', height: '2px', background: '#6366f1', marginBottom: '32px', borderRadius: '1px' },
    feats: { display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 },
    feat: { display: 'flex', alignItems: 'center', gap: '12px' },
    featIcon: { width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    featTitle: { color: '#c8c8e8', fontWeight: 500, fontSize: '12.5px', marginBottom: '1px' },
    featDesc: { fontSize: '11.5px', color: '#3a3a5a' },
    stats: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(99,102,241,0.08)' },
    stat: { background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.08)', borderRadius: '10px', padding: '14px 8px', textAlign: 'center' },
    statN: { fontSize: '20px', fontWeight: 700, color: '#6366f1', letterSpacing: '-0.5px' },
    statL: { fontSize: '9px', color: '#3a3a5a', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '4px' },
    right: { background: '#08081a', padding: '52px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    formTitle: { fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '4px', letterSpacing: '-0.3px' },
    formSub: { fontSize: '12px', color: '#3a3a5a' },
    formLine: { width: '28px', height: '2px', background: '#6366f1', borderRadius: '1px', margin: '14px 0 24px' },
    field: { marginBottom: '13px' },
    label: { fontSize: '9.5px', color: '#3a3a6a', textTransform: 'uppercase', letterSpacing: '1.8px', display: 'block', marginBottom: '7px' },
    inputWrap: { position: 'relative' },
    input: { width: '100%', background: '#0e0e24', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '8px', padding: '11px 12px 11px 36px', fontSize: '13px', color: '#c8c8e8', outline: 'none' },
    icon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: '#2a2a4a', pointerEvents: 'none' },
    eyeBtn: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#2a2a4a', fontSize: '15px', padding: 0 },
    forgot: { display: 'block', textAlign: 'right', fontSize: '11px', color: '#2a2a5a', marginTop: '6px', cursor: 'pointer' },
    btn: { width: '100%', background: loading ? '#4547b0' : '#6366f1', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    error: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', background: 'rgba(226,75,74,0.08)', color: '#E24B4A', border: '1px solid rgba(226,75,74,0.15)' },
    demoTitle: { fontSize: '9.5px', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', marginTop: '18px' },
    demoBox: { background: '#0a0a20', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '10px', overflow: 'hidden' },
    demoRow: { display: 'flex', alignItems: 'center', padding: '9px 14px', gap: '10px' },
    demoIco: { width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    demoKey: { fontSize: '9.5px', color: '#2a2a4a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' },
    demoVal: { fontSize: '12px', color: '#8888b8', fontFamily: 'monospace' },
    register: { textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#2a2a4a' },
  };

  const features = [
    { icon: 'ti-calendar-check', title: 'Agendamento online', desc: 'Clientes agendam 24h pelo app' },
    { icon: 'ti-chart-line', title: 'Financeiro inteligente', desc: 'Relatórios, caixa e comissões' },
    { icon: 'ti-star', title: 'Programa de fidelidade', desc: 'Fidelize e aumente o retorno' },
    { icon: 'ti-message', title: 'WhatsApp automático', desc: 'Lembretes e confirmações' },
  ];

  const demoItems = [
    { icon: 'ti-building-store', label: 'Slug', val: 'barbearia-demo' },
    { icon: 'ti-mail', label: 'E-mail', val: 'admin@aparato.com.br' },
    { icon: 'ti-lock', label: 'Senha', val: 'admin123' },
  ];

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        {/* LEFT */}
        <div style={S.left}>
          <div style={S.accentLine} />
          <div style={S.glow} />
          <div style={S.logo}>
            <div style={S.logoIcon}>
              <i className="ti ti-scissors" style={{ fontSize: '19px', color: '#fff' }} />
            </div>
            <div>
              <div style={S.logoName}>Aparato</div>
              <div style={S.logoTag as React.CSSProperties}>Gestão Profissional</div>
            </div>
          </div>
          <div style={S.badge}>
            <div style={S.badgeDot} />
            Plataforma #1 para barbearias
          </div>
          <div style={S.headline}>Gerencie seu<br />negócio com<br /><span style={{ color: '#6366f1' }}>precisão total</span></div>
          <div style={S.sub}>Sistema completo de agendamento, financeiro e gestão para barbearias e salões de alto padrão.</div>
          <div style={S.divider} />
          <div style={S.feats}>
            {features.map((f, i) => (
              <div key={i} style={S.feat}>
                <div style={S.featIcon}><i className={`ti ${f.icon}`} style={{ fontSize: '16px', color: '#6366f1' }} /></div>
                <div>
                  <div style={S.featTitle}>{f.title}</div>
                  <div style={S.featDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={S.stats}>
            {[{ n: '2k+', l: 'Clientes' }, { n: '40%', l: '+ Receita' }, { n: '4.9★', l: 'Avaliação' }].map((s, i) => (
              <div key={i} style={S.stat}>
                <div style={S.statN}>{s.n}</div>
                <div style={S.statL as React.CSSProperties}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div style={S.right}>
          <div style={S.formTitle}>Bem-vindo de volta</div>
          <div style={S.formSub}>Acesse seu painel de gestão</div>
          <div style={S.formLine} />
          {error && <div style={S.error}><i className="ti ti-alert-circle" style={{ fontSize: '14px' }} />{error}</div>}
          <form onSubmit={handleSubmit}>
            {[
              { label: 'Estabelecimento', key: 'slug', type: 'text', placeholder: 'minha-barbearia', icon: 'ti-building-store' },
              { label: 'E-mail', key: 'email', type: 'email', placeholder: 'admin@email.com', icon: 'ti-mail' },
            ].map(f => (
              <div key={f.key} style={S.field}>
                <label style={S.label as React.CSSProperties}>{f.label}</label>
                <div style={S.inputWrap}>
                  <i className={`ti ${f.icon}`} style={S.icon} />
                  <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required style={S.input} />
                </div>
              </div>
            ))}
            <div style={S.field}>
              <label style={S.label as React.CSSProperties}>Senha</label>
              <div style={S.inputWrap}>
                <i className="ti ti-lock" style={S.icon} />
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required style={{ ...S.input, paddingRight: '36px' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={S.eyeBtn}>
                  <i className={`ti ${showPass ? 'ti-eye-off' : 'ti-eye'}`} />
                </button>
              </div>
            </div>
            <span style={S.forgot}>Esqueci minha senha</span>
            <button type="submit" disabled={loading} style={S.btn}>
              {loading ? <i className="ti ti-loader-2" style={{ fontSize: '15px', animation: 'spin 0.8s linear infinite' }} /> : <i className="ti ti-arrow-right" style={{ fontSize: '15px' }} />}
              {loading ? 'Entrando...' : 'Entrar no painel'}
            </button>
          </form>
          <div style={S.demoTitle}><i className="ti ti-info-circle" style={{ fontSize: '13px' }} /> Credenciais de demonstração</div>
          <div style={S.demoBox}>
            {demoItems.map((d, i) => (
              <div key={i} style={{ ...S.demoRow, borderTop: i > 0 ? '1px solid rgba(99,102,241,0.06)' : 'none' }}>
                <div style={S.demoIco}><i className={`ti ${d.icon}`} style={{ fontSize: '13px', color: '#6366f1' }} /></div>
                <div><div style={S.demoKey as React.CSSProperties}>{d.label}</div><div style={S.demoVal}>{d.val}</div></div>
              </div>
            ))}
          </div>
          <div style={S.register}>Ainda não tem conta? <a href="/register" style={{ color: '#6366f1', textDecoration: 'none' }}>Criar estabelecimento →</a></div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
