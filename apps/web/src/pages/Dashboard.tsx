import React from 'react';
import { TreasuryMetrics, ClientNattSubscription, CotisationTransaction, PayoutRecord } from '../types';
import { KPICard } from '../components/KPICard';
import { ProgressBar } from '../components/ProgressBar';
import { 
  Landmark, 
  ArrowDownRight, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  TrendingUp,
  Sparkles,
  Zap
} from 'lucide-react';

interface DashboardProps {
  treasury: TreasuryMetrics;
  subscriptions: ClientNattSubscription[];
  cotisations: CotisationTransaction[];
  payoutHistory: PayoutRecord[];
  onOpenPayoutModal: (sub: ClientNattSubscription) => void;
  onNavigateToTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  treasury,
  subscriptions,
  cotisations,
  payoutHistory,
  onOpenPayoutModal,
  onNavigateToTab,
}) => {
  const eligibleSubscriptions = subscriptions.filter(s => s.status === 'ELIGIBLE_PAYOUT');

  return (
    <div>
      {/* Banner Banner for Pending Payouts >= 70% */}
      {eligibleSubscriptions.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: '#f59e0b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
            }}>
              <AlertCircle size={26} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{eligibleSubscriptions.length} versement(s) prêt(s) à être débloqué(s) !</span>
                <span className="badge badge-gold">Seuil 70% Atteint</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Certains clients ont franchi le seuil de 70% de cotisation et attendent le versement de 100% de leur Natt depuis la Trésorerie Unique.
              </div>
            </div>
          </div>

          <button 
            className="btn btn-gold"
            onClick={() => onNavigateToTab('payouts')}
          >
            <Sparkles size={16} />
            <span>Traiter les Déblocages</span>
          </button>
        </div>
      )}

      {/* KPI Grid */}
      <div className="kpi-grid">
        <KPICard
          title="Solde Trésorerie Centralisée"
          value={`${treasury.totalBalanceFcfa.toLocaleString('fr-FR')} FCFA`}
          subtitle="Compte unique Tontine Express"
          icon={Landmark}
          variant="emerald"
          trend="+14.2% ce mois"
        />

        <KPICard
          title="Total Cotisations Collectées"
          value={`${treasury.totalCollectedFcfa.toLocaleString('fr-FR')} FCFA`}
          subtitle="Toutes souscriptions confondues"
          icon={ArrowDownRight}
          variant="emerald"
        />

        <KPICard
          title="Total Versé aux Clients (100%)"
          value={`${treasury.totalPaidOutFcfa.toLocaleString('fr-FR')} FCFA`}
          subtitle="Versements déclenchés à 70%"
          icon={ArrowUpRight}
          variant="gold"
        />
      </div>

      {/* Main Grid Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Eligible Payouts Queue Preview */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>File d'Attente — Versements à 70%</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Déblocage 100% du Natt dès franchissement du seuil</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigateToTab('payouts')}>
              Voir tout ({subscriptions.length})
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Client & Téléphone</th>
                  <th>Natt Choisi</th>
                  <th>Progression (Cotisé / Cible)</th>
                  <th>Action Versement</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.slice(0, 4).map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{sub.clientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.clientPhone}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{sub.categoryTitle}</div>
                      <span className={`badge ${sub.category === 'classique' ? 'badge-blue' : sub.category === 'tekk_tegui' ? 'badge-purple' : 'badge-emerald'}`} style={{ fontSize: '0.65rem' }}>
                        {sub.category === 'classique' ? 'Natt Classique' : sub.category === 'tekk_tegui' ? 'Tekk Tegui' : 'Natt Événement'}
                      </span>
                    </td>
                    <td style={{ width: '220px' }}>
                      <ProgressBar currentPercent={sub.progressPercent} targetPercent={70} />
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                        {sub.contributedAmountFcfa.toLocaleString('fr-FR')} / {sub.targetAmountFcfa.toLocaleString('fr-FR')} FCFA
                      </div>
                    </td>
                    <td>
                      {sub.status === 'ELIGIBLE_PAYOUT' ? (
                        <button 
                          className="btn btn-gold btn-sm"
                          onClick={() => onOpenPayoutModal(sub)}
                        >
                          <Zap size={14} />
                          <span>Verser {sub.targetAmountFcfa.toLocaleString('fr-FR')} FCFA</span>
                        </button>
                      ) : sub.status === 'PAID_OUT' ? (
                        <span className="badge badge-gray">
                          <CheckCircle2 size={12} color="#10b981" />
                          <span>Versé (100%)</span>
                        </span>
                      ) : (
                        <span className="badge badge-gray">
                          Cotisation en cours
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3 Natts Systems Distribution Sidecard */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Les 3 Systèmes Natt</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distribution des souscriptions Tontine Express</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* System 1 */}
            <div style={{ background: 'rgba(9, 13, 22, 0.6)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#60a5fa' }}>🔄 Natt Classique</span>
                <span className="badge badge-blue">Fixe Mensuel</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Épargne périodique fixe (250k - 3M FCFA). Retrait à 70% de cotisation.
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 700 }}>
                185 Souscriptions actives
              </div>
            </div>

            {/* System 2 */}
            <div style={{ background: 'rgba(9, 13, 22, 0.6)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#a78bfa' }}>⚡ Tekk Tegui</span>
                <span className="badge badge-purple">Épargne Projet</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Progression rapide journalière pour projets/équipements.
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 700 }}>
                240 Souscriptions actives
              </div>
            </div>

            {/* System 3 */}
            <div style={{ background: 'rgba(9, 13, 22, 0.6)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#34d399' }}>🎉 Natt Événement</span>
                <span className="badge badge-emerald">Fêtes & Saisons</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Épargne ciblée : Tabaski, Korité, Magal, Rentrée scolaire.
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 700 }}>
                155 Souscriptions actives
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Cotisations Stream */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Flux Récent des Cotisations Clients</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dépôts enregistrés en temps réel (Wave / OM / Free Money)</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigateToTab('cotisations')}>
            Voir tout le flux
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Réf Transaction</th>
                <th>Client</th>
                <th>Natt Concerné</th>
                <th>Montant Versé</th>
                <th>Opérateur</th>
                <th>Date & Heure</th>
              </tr>
            </thead>
            <tbody>
              {cotisations.slice(0, 4).map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {tx.reference}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{tx.clientName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{tx.clientPhone}</div>
                  </td>
                  <td>{tx.nattTitle}</td>
                  <td>
                    <span style={{ color: '#34d399', fontWeight: 800 }}>
                      +{tx.amountFcfa.toLocaleString('fr-FR')} FCFA
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-emerald">{tx.provider}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tx.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
