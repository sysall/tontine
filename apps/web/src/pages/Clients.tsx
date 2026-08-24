import React, { useState } from 'react';
import { Client, ClientNattSubscription } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { Users, Search, ShieldCheck, Phone, Mail, Zap, Smartphone } from 'lucide-react';

interface ClientsProps {
  clients: Client[];
  subscriptions: ClientNattSubscription[];
  onOpenPayoutModal: (sub: ClientNattSubscription) => void;
}

export const Clients: React.FC<ClientsProps> = ({
  clients,
  subscriptions,
  onOpenPayoutModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id || null);

  const filteredClients = clients.filter(c =>
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedClientSubs = subscriptions.filter(s => s.clientId === selectedClientId);

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users color="#D8C911" />
            <span>Répertoire & Portefeuille des Clients</span>
          </h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Consultez les souscriptions clientes effectuées directement via l'application mobile Tontine Express.
          </div>
        </div>

        <div className="badge badge-yellow" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          <Smartphone size={14} />
          <span>Souscriptions Mobile en Direct</span>
        </div>
      </div>

      {/* Grid: Left Clients List, Right Selected Client Natts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
        {/* Left Panel: Clients List */}
        <div className="glass-card">
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Chercher client (Nom, Tel)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredClients.map((cli) => {
              const isSelected = cli.id === selectedClientId;
              return (
                <div
                  key={cli.id}
                  className={`glass-card glass-card-interactive ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedClientId(cli.id)}
                  style={{
                    padding: '1rem',
                    background: isSelected ? 'rgba(216, 201, 17, 0.15)' : 'rgba(4, 37, 45, 0.6)',
                    borderColor: isSelected ? 'var(--brand-yellow)' : 'var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cli.fullName}</div>
                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                      <ShieldCheck size={10} />
                      <span>{cli.kycStatus}</span>
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <Phone size={12} />
                    <span>{cli.phone}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{cli.activeNattsCount} Natt(s) actif(s)</span>
                    <span style={{ fontWeight: 800, color: '#D8C911' }}>
                      {cli.totalContributedFcfa.toLocaleString('fr-FR')} FCFA cotisé
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Active Subscriptions for selected client */}
        <div>
          {selectedClient ? (
            <div className="glass-card">
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedClient.fullName}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                      <span><Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />{selectedClient.phone}</span>
                      <span><Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />{selectedClient.email}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date d'Adhésion</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{selectedClient.joinedDate}</div>
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Souscriptions Natts du Client ({selectedClientSubs.length})
              </h4>

              {selectedClientSubs.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Ce client n'a pas encore souscrit à un Natt sur l'application mobile.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedClientSubs.map((sub) => (
                    <div key={sub.id} style={{ background: 'rgba(4, 37, 45, 0.7)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem' }}>{sub.categoryTitle}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Lancé le {sub.startDate}</div>
                        </div>

                        {sub.status === 'ELIGIBLE_PAYOUT' ? (
                          <span className="badge badge-yellow">
                            ⚡ Éligible au Versement (70% atteint)
                          </span>
                        ) : sub.status === 'PAID_OUT' ? (
                          <span className="badge badge-gray">
                            ✅ Natt Versé (100%)
                          </span>
                        ) : (
                          <span className="badge badge-emerald">
                            🔄 En cours de cotisation
                          </span>
                        )}
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <ProgressBar currentPercent={sub.progressPercent} targetPercent={70} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.8rem' }}>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Montant Total Natt</div>
                          <div style={{ fontWeight: 800, color: '#D8C911' }}>{sub.targetAmountFcfa.toLocaleString('fr-FR')} FCFA</div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Cotisé Actuellement</div>
                          <div style={{ fontWeight: 800, color: '#34d399' }}>{sub.contributedAmountFcfa.toLocaleString('fr-FR')} FCFA</div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Seuil Versement (70%)</div>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{(sub.targetAmountFcfa * 0.7).toLocaleString('fr-FR')} FCFA</div>
                        </div>
                      </div>

                      {sub.status === 'ELIGIBLE_PAYOUT' && (
                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                          <button 
                            className="btn btn-gold btn-sm"
                            onClick={() => onOpenPayoutModal(sub)}
                          >
                            <Zap size={14} />
                            <span>Débloquer le Versement (100%)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Sélectionnez un client dans la liste pour consulter ses Natts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
