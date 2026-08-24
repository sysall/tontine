import React, { useState } from 'react';
import { Zap, ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (adminName: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@tontine-express.sn');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      if (email && password) {
        onLoginSuccess('Admin Direct');
      } else {
        setErrorMsg('Veuillez renseigner votre identifiant et mot de passe.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at 50% 20%, #0a3a46 0%, #04252D 70%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient background glow effects */}
      <div style={{
        position: 'absolute',
        top: '-150px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(216, 201, 17, 0.15) 0%, rgba(4, 37, 45, 0) 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(10, 51, 61, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(216, 201, 17, 0.3)',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: '#D8C911',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 8px 24px rgba(216, 201, 17, 0.4)'
          }}>
            <Zap size={36} color="#04252D" />
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#F8FAF7' }}>
            TONTINE <span style={{ color: '#D8C911' }}>EXPRESS</span>
          </h1>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>
            Portail Administration & Trésorerie
          </div>
        </div>

        {/* Security Alert Badge */}
        <div style={{
          background: 'rgba(216, 201, 17, 0.08)',
          border: '1px solid rgba(216, 201, 17, 0.25)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.75rem',
          color: '#D8C911'
        }}>
          <ShieldCheck size={18} style={{ flexShrink: 0 }} />
          <span>Accès sécurisé réservé à l'équipe de gestion Tontine Express SN.</span>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '10px',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            fontSize: '0.8rem',
            color: '#f87171',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Identifiant Administrateur</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email"
                className="form-input"
                placeholder="admin@tontine-express.sn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.75rem', width: '100%' }}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Mot de passe</label>
              <span style={{ fontSize: '0.75rem', color: '#D8C911', cursor: 'pointer' }}>Mot de passe oublié ?</span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem', width: '100%' }}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me & Demo Note */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', fontSize: '0.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: '#D8C911' }} />
              <span>Rester connecté</span>
            </label>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Démo: admin123</span>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', borderRadius: '12px' }}
          >
            {isLoading ? (
              <span>Connexion en cours...</span>
            ) : (
              <>
                <span>Se connecter au Backoffice</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          Tontine Express SN © 2026 — Trésorerie Centralisée
        </div>
      </div>
    </div>
  );
};
