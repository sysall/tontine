import React from 'react';
import {
  LayoutDashboard,
  Banknote,
  Users,
  PiggyBank,
  ArrowDownRight,
  ShieldCheck,
  FileCheck,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingPayoutsCount: number;
  pendingKycCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingPayoutsCount,
  pendingKycCount,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Trésorerie Unique',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'payouts',
      label: 'Déblocages à 70%',
      icon: Banknote,
      badge: pendingPayoutsCount > 0 ? `${pendingPayoutsCount} prêt(s)` : null,
      badgeColor: 'gold',
    },
    {
      id: 'kyc',
      label: 'Vérification KYC & OCR',
      icon: FileCheck,
      badge: pendingKycCount > 0 ? `${pendingKycCount} à checker` : null,
      badgeColor: 'gold',
    },
    {
      id: 'clients',
      label: 'Gestion Clients',
      icon: Users,
      badge: null,
    },
    {
      id: 'natts',
      label: 'Offres & Systèmes Natt',
      icon: PiggyBank,
      badge: '3 Offres',
      badgeColor: 'emerald',
    },
    {
      id: 'cotisations',
      label: 'Flux Cotisations',
      icon: ArrowDownRight,
      badge: 'Direct',
      badgeColor: 'purple',
    },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: '#D8C911',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(216, 201, 17, 0.4)'
        }}>
          <Zap size={22} color="#04252D" />
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F8FAF7' }}>
            <span>TONTINE</span>
            <span style={{ color: '#D8C911' }}>EXPRESS</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Backoffice Admin
          </div>
        </div>
      </div>



      {/* Navigation Links */}
      <nav style={{ flex: 1, marginTop: '1rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span className={`badge ${item.badgeColor === 'gold' ? 'badge-gold' : item.badgeColor === 'emerald' ? 'badge-emerald' : 'badge-purple'}`}>
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        <div>Plateforme Tontine Express v1.0</div>
        <div>SN - Dakar, Sénégal</div>
      </div>
    </aside>
  );
};
