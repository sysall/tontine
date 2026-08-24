import React from 'react';
import { Bell, RefreshCw, Landmark, Activity, LogOut } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  totalBalanceFcfa: number;
  onRefresh: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, totalBalanceFcfa, onRefresh, onLogout }) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Tableau de Bord';
      case 'payouts':
        return 'Versements & Déblocages à 70% de Cotisation';
      case 'kyc':
        return 'Vérification KYC & Double Checking OCR';
      case 'clients':
        return 'Répertoire des Clients & Natts Souscrits';
      case 'natts':
        return 'Paramétrage des 3 Systèmes d’Épargne Natt';
      case 'cotisations':
        return 'Historique des Dépôts & Cotisations';
      default:
        return 'Tontine Express Admin';
    }
  };

  return (
    <header className="header">
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{getTitle()}</h2>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
          Système Tontine Express
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: '#D8C911',
            color: '#04252D',
            fontWeight: 900,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(216, 201, 17, 0.3)'
          }}>
            TE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Admin Direct</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Responsable Trésorerie</span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Se déconnecter"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '0.4rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '0.5rem'
              }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

