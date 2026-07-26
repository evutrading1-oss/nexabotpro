import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Shield, Zap, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) { setError('Please enter your password'); return; }
    setLoading(true); setError('');
    try {
      const result = await login(password);
      if (!result.success) setError(result.error || 'Invalid Password');
    } catch { setError('Connection error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={s.container}>
      <div style={s.bgGrid} />
      <div style={s.particles}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{...s.particle, left: `${Math.random() * 100}%", top: `${Math.random() * 100}%`}} />
        ))}
      </div>
      <div style={s.card}>
        <div style={s.logoSection}>
          <div style={s.logoIcon}><TrendingUp size={36} color="#00d4aa"/></div>
          <h1 style={s.title}><span style={{ color: '#00d4aa' }}>Nexa</span><span style={{ color: '#fff' }}> EVU</span></h1>
          <p style={s.subtitle}>AI Trading Analysis Bot</p>
        </div>
        <div style={s.statusBadge}>
          <div style={s.statusDot} />
          <span>Secured Connection</span>
        </div>
        <div style={s.features}>
          {[
            { icon: <Zap size={14} />, text: 'Real-time Market Analysis' },
            { icon: <TrendingUp size={14} />, text: 'Multi-Indicator Strategy Engine' },
            { icon: <Shield size={14} />, text: 'Live Quotex API Data' }
          ].map((f, i) => (
            <div key={i} style={s.featureItem}>
              <span style={{ color: '#00d4aa' }}>{f.icon}</span>
              <span style={s.featureText}>{f.text}</span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.inputWrapper}>
            <Lock size={16} color="#666" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input type="password" placeholder="Enter password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} style={s.input} autoFocus disabled={loading} />
          </div>
          {error && <div style={s.errorBox}><span>{error}</span></div>}
          <button type="submit" disabled={loading} style={{ ...s.button, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? <span style={{ width: 20, height: 20, border: '2px solid rgba(10,10,15,0.3)', borderTopColor: '#0a0a0f', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> : 'Unlock Dashboard'}
          </button>
        </form>
        <div style={s.footer}>
          <p style={s.footerText}>Don't have the password? Contact us on Telegram</p>
          <a href="https://t.me/tradewithevu" target="_blank" rel="noopener noreferrer" style={s.telegramLink}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.46-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.441-.752-.245-1.349-.374-1.297-.789.027-.216.324-.437.893-.662 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.139.121.098.155.23.171.338.016.108.036.353.02.545z"/></svg>
            <span>t.me/tradewithevu</span>
          </a>
        </div>
      </div>
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 40%, #0a1628 100%)', position: 'relative', overflow: 'hidden', fontFamily: "Inter, sans-serif", padding: 20 },
  bgGrid: { position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(0,212,170,0.03) 1px, transparent 1px),linear-gradient(90deg, rgba(0,212,170,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' },
  particles: { position: 'absolute', inset: 0 },
  particle: { position: 'absolute', width: 3, height: 3, background: '#00d4aa', borderRadius: '50%', opacity: 0, animation: 'float 5s infinite ease-in-out' },
  card: { position: 'relative', zIndex: 1, background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(30px)', border: '1px solid rgba(0,212,170,0.12)', borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 420, boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 100px rgba(0,212,170,0.05)' },
  logoSection: { textAlign: 'center', marginBottom: 28 },
  logoIcon: { width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,212,170,0.05))', border: '1px solid rgba(0,212,170,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  title: { fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', margin: '0 0 4px' },
  subtitle: { color: '#6b7280', fontSize: 14, fontWeight: 500, margin: 0 },
  statusBadge: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px 16px', background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.1)', borderRadius: 20, marginBottom: 24, fontSize: 11, color: '#9ca3af', fontWeight: 500 },
  statusDot: { width: 6, height: 6, borderRadius: '50%', background: '#00d4aa', boxShadow: '0 0 8px #00d4aa' },
  features: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' },
  featureItem: { display: 'flex', alignItems: 'center', gap: 10 },
  featureText: { color: '#9ca3af', fontSize: 12, fontWeight: 500 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  inputWrapper: { position: 'relative' },
  input: { width: '100%', padding: '14px 14px 14px 42px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#e5e7eb', fontSize: 15, outline: 'none', boxSizing: 'border-box' },
  errorBox: { padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#fca5a5', fontSize: 13, fontWeight: 500, textAlign: 'center' },
  button: { width: '100%', padding: 14, background: 'linear-gradient(135deg, #00d4aa, #00b894)', border: 'none', borderRadius: 12, color: '#0a0a0f', fontSize: 15, fontWeight: 700, letterSpacing: '0.3px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,212,170,0.25)' },
  footer: { marginTop: 24, textAlign: 'center' },
  footerText: { color: '#6b7280', fontSize: 12, margin: '0 0 10px' },
  telegramLink: { display: 'inline-flex', alignItems: 'center', gap: 8, color: '#0088cc', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '8px 16px', background: 'rgba(0,136,204,0.08)', borderRadius: 8, border: '1px solid rgba(0,136,204,0.15)' },
};