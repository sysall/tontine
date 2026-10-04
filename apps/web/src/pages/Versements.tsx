import React, { useState } from 'react';
import { ClientNattSubscription, PayoutRecord } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { Zap, CheckCircle2, ShieldCheck, Search, Filter, History, AlertTriangle } from 'lucide-react';

interface VersementsProps {
  subscriptions: ClientNattSubscription[];
  payoutHistory: PayoutRecord[];
  onOpenPayoutModal: (sub: ClientNattSubscription) => void;
}

export const Versements: React.FC<VersementsProps> = ({
  subscriptions,
  payoutHistory,
  onOpenPayoutModal,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'exceptional' | 'history'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const eligibleQueue = subscriptions.filter(s => s.status === 'ELIGIBLE_PAYOUT');
  const filteredQueue = eligibleQueue.filter(s =>
    s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.clientPhone.includes(searchTerm) ||
    s.categoryTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exceptionalQueue = subscriptions.filter(s => s.status !== 'PAID_OUT' && s.progressPercent < 70);
  const filteredExceptional = exceptionalQueue.filter(s =>
    s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.clientPhone.includes(searchTerm) ||
    s.categoryTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistory = payoutHistory.filter(h =>
    h.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header Info */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.07) 0%, rgba(23, 63, 115, 0.03) 100%)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck color="#f59e0b" />
              <span>Gestion des Versements & Déblocages Trésorerie</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Traitez les versements standard à 70% ou autorisez des versements exceptionnels par dérogation administrateur.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(23, 63, 115, 0.04)', padding: '0.35rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <button
              className={`btn btn-sm ${activeTab === 'pending' ? 'btn-gold' : 'btn-secondary'}`}
              onClick={() => setActiveTab('pending')}
            >
              <Zap size={14} />
              <span>Attente 70% ({eligibleQueue.length})</span>
            </button>

            <button
              className={`btn btn-sm ${activeTab === 'exceptional' ? 'btn-gold' : 'btn-secondary'}`}
              style={activeTab === 'exceptional' ? { background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#fff' } : {}}
              onClick={() => setActiveTab('exceptional')}
            >
              <AlertTriangle size={14} />
              <span>Exceptionnels &lt; 70% ({exceptionalQueue.length})</span>
            </button>

            <button
              className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={14} />
              <span>Historique ({payoutHistory.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Rechercher par nom client, téléphone, Natt ou référence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.75rem', width: '100%' }}
          />
        </div>
      </div>

      {/* Tab 1: Pending Eligible Payouts Queue (70%) */}
      {activeTab === 'pending' && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Clients Éligibles au Versement (Seuil 70% Atteint)</h3>
            <span className="badge badge-gold">{filteredQueue.length} dossier(s) en attente</span>
          </div>

          {filteredQueue.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={48} color="#19A66A" style={{ margin: '0 auto 1rem auto' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Tous les versements éligibles ont été traités !</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                Aucun client n'est actuellement en attente de déblocage 70%.
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Client & Téléphone</th>
                    <th>Natt Choisi</th>
                    <th>Montant du Natt</th>
                    <th>Cotisé Actuellement</th>
                    <th>Progression & Seuil (70%)</th>
                    <th>Action Trésorerie</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{sub.clientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.clientPhone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{sub.categoryTitle}</div>
                        <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>{sub.startDate}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24' }}>
                          {sub.targetAmountFcfa.toLocaleString('fr-FR')} FCFA
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#19A66A' }}>
                          {sub.contributedAmountFcfa.toLocaleString('fr-FR')} FCFA
                        </span>
                      </td>
                      <td style={{ width: '220px' }}>
                        <ProgressBar currentPercent={sub.progressPercent} targetPercent={70} />
                      </td>
                      <td>
                        <button
                          className="btn btn-gold btn-sm"
                          onClick={() => onOpenPayoutModal(sub)}
                        >
                          <Zap size={14} />
                          <span>Valider le Versement</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Exceptional Payouts Queue (< 70% Admin Override) */}
      {activeTab === 'exceptional' && (
        <div className="glass-card">

          {filteredExceptional.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={48} color="#19A66A" style={{ margin: '0 auto 1rem auto' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Aucune souscription éligible à la dérogation</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                Toutes les souscriptions actives ont soit atteint les 70% soit déjà été versées.
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Client & Téléphone</th>
                    <th>Natt Concerné</th>
                    <th>Montant du Natt</th>
                    <th>Cotisé Actuellement</th>
                    <th>Progression (&lt; 70%)</th>
                    <th>Action Dérogation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExceptional.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{sub.clientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.clientPhone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{sub.categoryTitle}</div>
                        <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{sub.startDate}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24' }}>
                          {sub.targetAmountFcfa.toLocaleString('fr-FR')} FCFA
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--text-color)' }}>
                          {sub.contributedAmountFcfa.toLocaleString('fr-FR')} FCFA
                        </span>
                      </td>
                      <td style={{ width: '220px' }}>
                        <ProgressBar currentPercent={sub.progressPercent} targetPercent={70} />
                        <div style={{ fontSize: '0.7rem', color: '#fbbf24', marginTop: '4px', fontWeight: 600 }}>
                          Dérogation req. ({sub.progressPercent.toFixed(1)}% / 70%)
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-gold btn-sm"
                          style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', border: 'none' }}
                          onClick={() => onOpenPayoutModal(sub)}
                        >
                          <Zap size={14} />
                          <span>Débloquer (Dérogation)</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Payout History */}
      {activeTab === 'history' && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Historique des Versements Effectués (100%)</h3>
            <span className="badge badge-emerald">{filteredHistory.length} versement(s) exécuté(s)</span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Réf Versement</th>
                  <th>Client Bénéficiaire</th>
                  <th>Natt Concerné</th>
                  <th>Montant Versé (100%)</th>
                  <th>Cotisé au Moment du Versement</th>
                  <th>Mode / Opérateur</th>
                  <th>Date & Validateur</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#D9A33A', fontSize: '0.8rem' }}>
                        {rec.reference}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{rec.clientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{rec.clientPhone}</div>
                    </td>
                    <td>{rec.nattTitle}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#19A66A', fontSize: '0.95rem' }}>
                        {rec.payoutAmountFcfa.toLocaleString('fr-FR')} FCFA
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {rec.contributedAtPayoutFcfa.toLocaleString('fr-FR')} FCFA
                      </div>
                      <span className={`badge ${rec.progressAtPayoutPercent >= 70 ? 'badge-gold' : 'badge-purple'}`} style={{ fontSize: '0.65rem' }}>
                        {rec.progressAtPayoutPercent >= 70 ? `${rec.progressAtPayoutPercent.toFixed(1)}%` : `Dérogation ${rec.progressAtPayoutPercent.toFixed(1)}%`}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-purple">{rec.provider}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div>{rec.processedAt}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Par: {rec.approvedBy}</div>
                    </td>
                    <td>
                      <span className="badge badge-emerald">
                        <CheckCircle2 size={12} />
                        <span>SUCCÈS</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
