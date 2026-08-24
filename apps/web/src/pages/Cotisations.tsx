import React, { useState } from 'react';
import { CotisationTransaction, OverdueContribution } from '../types';
import { ArrowDownRight, Search, Smartphone, AlertTriangle, Send, Bell, CheckCircle2, Clock } from 'lucide-react';

interface CotisationsProps {
  cotisations: CotisationTransaction[];
  overdueContributions: OverdueContribution[];
  onSendReminder: (overdueId: string) => void;
}

export const Cotisations: React.FC<CotisationsProps> = ({
  cotisations,
  overdueContributions,
  onSendReminder,
}) => {
  const [activeTab, setActiveTab] = useState<'deposits' | 'overdue'>('deposits');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('ALL');

  const pendingOverdueCount = overdueContributions.filter(o => o.status === 'OVERDUE').length;

  const filteredCotisations = cotisations.filter(c => {
    const matchesSearch = c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.clientPhone.includes(searchTerm);
    const matchesProvider = selectedProvider === 'ALL' || c.provider === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  const filteredOverdue = overdueContributions.filter(o =>
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.clientPhone.includes(searchTerm) ||
    o.nattTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVolumeFcfa = filteredCotisations.reduce((acc, curr) => acc + curr.amountFcfa, 0);
  const totalOverdueFcfa = overdueContributions.reduce((acc, curr) => acc + curr.expectedAmountFcfa, 0);

  return (
    <div>
      {/* Top Banner */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowDownRight color="#D8C911" />
              <span>Suivi des Cotisations & Retards de Paiement</span>
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Supervision des encaissements en direct et relance des clients en retard de cotisation.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(4, 37, 45, 0.7)', padding: '0.35rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn btn-sm ${activeTab === 'deposits' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('deposits')}
            >
              <ArrowDownRight size={14} />
              <span>Flux Dépôts Réalisés ({cotisations.length})</span>
            </button>

            <button 
              className={`btn btn-sm ${activeTab === 'overdue' ? 'btn-gold' : 'btn-secondary'}`}
              onClick={() => setActiveTab('overdue')}
            >
              <AlertTriangle size={14} />
              <span>Retards ({overdueContributions.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Header */}
      {activeTab === 'overdue' && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f87171' }}>
                {overdueContributions.length} client(s) accusant un retard de cotisation
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Montant total des imlayés à collecter : <strong>{totalOverdueFcfa.toLocaleString('fr-FR')} FCFA</strong>
              </div>
            </div>
          </div>

          <span className="badge" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' }}>
            {pendingOverdueCount} relance(s) urgente(s)
          </span>
        </div>
      )}

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder={activeTab === 'deposits' ? "Rechercher transaction, client, téléphone..." : "Rechercher client en retard, Natt, téléphone..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.75rem', width: '100%' }}
          />
        </div>

        {activeTab === 'deposits' && (
          <div style={{ width: '220px' }}>
            <select 
              className="form-select"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="ALL">Tous les Opérateurs</option>
              <option value="Wave">Wave Sénégal</option>
              <option value="Orange Money">Orange Money</option>
              <option value="Free Money">Free Money</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Deposits Table */}
      {activeTab === 'deposits' && (
        <div className="glass-card">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Réf Transaction</th>
                  <th>Client & Contact</th>
                  <th>Natt Souscrit</th>
                  <th>Montant Encaissé</th>
                  <th>Opérateur Mobile</th>
                  <th>Horodatage</th>
                </tr>
              </thead>
              <tbody>
                {filteredCotisations.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {tx.reference}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{tx.clientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.clientPhone}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{tx.nattTitle}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#10B981' }}>
                        +{tx.amountFcfa.toLocaleString('fr-FR')} FCFA
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${tx.provider === 'Wave' ? 'badge-blue' : tx.provider === 'Orange Money' ? 'badge-yellow' : 'badge-purple'}`}>
                        <Smartphone size={12} />
                        <span>{tx.provider}</span>
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tx.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Overdue Clients Table */}
      {activeTab === 'overdue' && (
        <div className="glass-card">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Client & Téléphone</th>
                  <th>Natt Concerné</th>
                  <th>Montant En Retard</th>
                  <th>Date d'Échéance</th>
                  <th>Retard Cumulé</th>
                  <th>Statut Relance</th>
                  <th>Action Admin</th>
                </tr>
              </thead>
              <tbody>
                {filteredOverdue.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      Aucun retard de cotisation enregistré.
                    </td>
                  </tr>
                ) : (
                  filteredOverdue.map((ovd) => (
                    <tr key={ovd.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{ovd.clientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ovd.clientPhone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ovd.nattTitle}</div>
                        <span className={`badge ${ovd.category === 'classique' ? 'badge-blue' : ovd.category === 'tekk_tegui' ? 'badge-purple' : 'badge-yellow'}`} style={{ fontSize: '0.65rem' }}>
                          {ovd.category === 'classique' ? 'Natt Classique' : ovd.category === 'tekk_tegui' ? 'Tekk Tegui' : 'Natt Événement'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f87171' }}>
                          {ovd.expectedAmountFcfa.toLocaleString('fr-FR')} FCFA
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ovd.dueDate}</td>
                      <td>
                        <span className="badge" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' }}>
                          🔴 Retard {ovd.daysOverdue}j
                        </span>
                      </td>
                      <td>
                        {ovd.status === 'REMINDED' ? (
                          <div style={{ fontSize: '0.75rem' }}>
                            <span className="badge badge-emerald">
                              <CheckCircle2 size={12} />
                              <span>Relancé</span>
                            </span>
                            <div style={{ color: 'var(--text-dim)', marginTop: '2px', fontSize: '0.7rem' }}>{ovd.lastRemindedAt}</div>
                          </div>
                        ) : (
                          <span className="badge badge-yellow">
                            Non relancé
                          </span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn btn-gold btn-sm"
                          onClick={() => onSendReminder(ovd.id)}
                          disabled={ovd.status === 'REMINDED'}
                        >
                          <Send size={14} />
                          <span>{ovd.status === 'REMINDED' ? 'Relance Envoyée' : 'Envoyer Relance SMS'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
