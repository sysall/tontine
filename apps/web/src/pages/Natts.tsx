import React, { useState } from 'react';
import { ClientNattSubscription, EventNattItem } from '../types';
import { PiggyBank, RefreshCw, Target, Plus, Users, Power, CheckCircle2, Eye, EyeOff } from 'lucide-react';


interface NattsProps {
  subscriptions: ClientNattSubscription[];
  eventNattsList: EventNattItem[];
  onOpenCreateEventModal: () => void;
  onDeleteEventNatt: (eventId: string) => void;
  onToggleEventNattStatus?: (eventId: string, status?: 'ACTIVE' | 'INACTIVE') => void;
}

export const Natts: React.FC<NattsProps> = ({
  subscriptions,
  eventNattsList,
  onOpenCreateEventModal,
  onDeleteEventNatt,
  onToggleEventNattStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const classiqueCount = subscriptions.filter(s => s.category === 'classique').length;
  const tekkTeguiCount = subscriptions.filter(s => s.category === 'tekk_tegui').length;

  const activeEventsCount = eventNattsList.filter(e => (e.status || 'ACTIVE') === 'ACTIVE').length;
  const inactiveEventsCount = eventNattsList.filter(e => e.status === 'INACTIVE').length;

  const filteredEvents = eventNattsList.filter(e => {
    const isEvtActive = (e.status || 'ACTIVE') === 'ACTIVE';
    if (filterStatus === 'active') return isEvtActive;
    if (filterStatus === 'inactive') return !isEvtActive;
    return true;
  });

  const handleToggleStatus = async (evt: EventNattItem) => {
    const isCurrentlyActive = (evt.status || 'ACTIVE') === 'ACTIVE';
    const nextStatus = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';
    const confirmMsg = isCurrentlyActive
      ? `Voulez-vous désactiver l'événement "${evt.title}" ? Il ne sera plus visible sur l'application mobile.`
      : `Voulez-vous réactiver l'événement "${evt.title}" ? Il réapparaîtra sur l'application mobile.`;

    if (!window.confirm(confirmMsg)) return;

    // Trigger backoffice API sync (NestJS Admin SDK updates Firestore)
    if (onToggleEventNattStatus) {
      onToggleEventNattStatus(evt.id, nextStatus);
    } else {
      onDeleteEventNatt(evt.id);
    }
  };

  return (
    <div>
      {/* Top Banner */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PiggyBank color="#19A66A" />
              <span>Les 3 Systèmes d'Épargne & Offres Natts</span>
            </h2>
          </div>

          <button className="btn btn-primary" onClick={onOpenCreateEventModal}>
            <Plus size={16} />
            <span>Créer un Natt Événementiel</span>
          </button>
        </div>
      </div>

      {/* Grid of the 2 Main System Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* System 1: Natt Classique */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #38bdf8' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={22} />
              </div>
              <span className="badge badge-blue">Mensuel Fixe</span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Natt Classique</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Formule d'épargne périodique classique avec montants fixes ajustables. Conçue pour une épargne régulière en toute sérénité.
            </p>

            <div style={{ background: 'rgba(23, 63, 115, 0.04)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Montants Cibles :</span>
                <span style={{ fontWeight: 700 }}>250k FCFA - 3M FCFA</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fréquence :</span>
                <span style={{ fontWeight: 700 }}>Mensuelle</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Déblocage Versement :</span>
                <span style={{ fontWeight: 800, color: '#19A66A' }}>Dès 70% cotisé</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Souscriptions actives :</span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#38bdf8' }}>{classiqueCount}</span>
          </div>
        </div>

        {/* System 2: Tekk Tegui */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #c084fc' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={22} />
              </div>
              <span className="badge badge-purple">Projet & Équipement</span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Tekk Tegui</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Offre d'épargne progressive rapide (journalière ou hebdomadaire) permettant aux commerçants et entrepreneurs de concrétiser un projet.
            </p>

            <div style={{ background: 'rgba(23, 63, 115, 0.04)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Montants Cibles :</span>
                <span style={{ fontWeight: 700 }}>100k FCFA - 3M FCFA</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fréquence :</span>
                <span style={{ fontWeight: 700 }}>Journalier / Hebdo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Déblocage Versement :</span>
                <span style={{ fontWeight: 800, color: '#19A66A' }}>Dès 70% cotisé</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Souscriptions actives :</span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#c084fc' }}>{tekkTeguiCount}</span>
          </div>
        </div>
      </div>

      {/* Dynamic List of Event Natts with Create / Deactivate actions */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🎉 Catalogue des Natts Événementiels Paramétrés</span>
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Gérez le statut des événements (Magal, Tabaski, Rentrée Scolaire). Les événements désactivés restent consultables dans l'historique admin.
            </div>
          </div>

          <button className="btn btn-primary btn-sm" onClick={onOpenCreateEventModal}>
            <Plus size={14} />
            <span>Créer un Natt Événementiel</span>
          </button>
        </div>

        {/* Filter Tabs Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setFilterStatus('all')}
            className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '20px', fontSize: '0.75rem' }}
          >
            Tous les événements ({eventNattsList.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`btn btn-sm ${filterStatus === 'active' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '20px', fontSize: '0.75rem' }}
          >
            🟢 Actifs (Mobile & Web) ({activeEventsCount})
          </button>
          <button
            onClick={() => setFilterStatus('inactive')}
            className={`btn btn-sm ${filterStatus === 'inactive' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '20px', fontSize: '0.75rem' }}
          >
            ⚪ Désactivés / Historique ({inactiveEventsCount})
          </button>
        </div>

        {filteredEvents.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Aucun Natt Événementiel dans cette catégorie ({filterStatus}).
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filteredEvents.map((evt) => {
              const isActive = (evt.status || 'ACTIVE') === 'ACTIVE';

              return (
                <div
                  key={evt.id}
                  style={{
                    background: isActive ? 'rgba(23, 63, 115, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isActive ? 'var(--border-color)' : 'rgba(239, 68, 68, 0.2)'}`,
                    borderRadius: '14px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    opacity: isActive ? 1 : 0.8,
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{evt.emoji}</span>
                        <div>
                          <h4 style={{ fontWeight: 800, fontSize: '0.95rem' }}>{evt.title}</h4>
                          <div style={{ fontSize: '0.7rem', marginTop: '0.1rem' }}>
                            {isActive ? (
                              <span style={{ color: '#34d399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <CheckCircle2 size={12} /> Actif sur Mobile
                              </span>
                            ) : (
                              <span style={{ color: '#ef4444', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <EyeOff size={12} /> Désactivé (Masqué sur Mobile)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Deactivate / Reactivate Toggle Button */}
                      <button
                        onClick={() => handleToggleStatus(evt)}
                        title={isActive ? "Désactiver cet événement (Masquer sur mobile)" : "Réactiver cet événement"}
                        style={{
                          background: isActive ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.15)',
                          border: `1px solid ${isActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                          color: isActive ? '#f87171' : '#34d399',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Power size={13} />
                        <span>{isActive ? 'Désactiver' : 'Réactiver'}</span>
                      </button>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                      {evt.description}
                    </p>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '0.75rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Échéance :</span>
                        <span style={{ fontWeight: 700, color: '#19A66A' }}>{evt.eventDate}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Gamme Montants :</span>
                        <span style={{ fontWeight: 800, color: '#D9A33A' }}>6 Options (100k à 1M FCFA)</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Users size={14} />
                      <span>{evt.subscribersCount} souscripteur(s)</span>
                    </span>
                    <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>
                      Journalier (10 tours)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
