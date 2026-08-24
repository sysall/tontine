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
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const eligibleQueue = subscriptions.filter(s => s.status === 'ELIGIBLE_PAYOUT');
  const filteredQueue = eligibleQueue.filter(s => 
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
      <div className="glass-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(19, 27, 46, 0.9) 0%, rgba(13, 19, 34, 0.95) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck color="#f59e0b" />
              <span>Gestion des Versements à 70% de Cotisation</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Règle Tontine Express : Dès qu'un client atteint <strong>70%</strong> du montant de son Natt, le versement de <strong>100%</strong> de la somme est autorisé depuis la Trésorerie Unique.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(9, 13, 22, 0.6)', padding: '0.35rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn btn-sm ${activeTab === 'pending' ? 'btn-gold' : 'btn-secondary'}`}
              onClick={() => setActiveTab('pending')}
            >
              <Zap size={14} />
              <span>File d'Attente ({eligibleQueue.length})</span>
            </button>

            <button 
              className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={14} />
              <span>Historique Versements ({payoutHistory.length})</span>
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

      {/* Tab 1: Pending Eligible Payouts Queue */}
      {activeTab === 'pending' && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Clients Éligibles au Versement 100%</h3>
            <span className="badge badge-gold">{filteredQueue.length} dossier(s) en attente</span>
          </div>

          {filteredQueue.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
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
                        <span style={{ fontWeight: 700, color: '#34d399' }}>
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

      {/* Tab 2: Payout History */}
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
                  <th>Cotisé à 70%</th>
                  <th>Mode / Opérateur</th>
                  <th>Date & Validateur</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#fbbf24', fontSize: '0.8rem' }}>
                        {rec.reference}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{rec.clientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{rec.clientPhone}</div>
                    </td>
                    <td>{rec.nattTitle}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#34d399', fontSize: '0.95rem' }}>
                        {rec.payoutAmountFcfa.toLocaleString('fr-FR')} FCFA
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {rec.contributedAtPayoutFcfa.toLocaleString('fr-FR')} FCFA
                      </div>
                      <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                        {rec.progressAtPayoutPercent.toFixed(1)}%
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
