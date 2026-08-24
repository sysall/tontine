import React from 'react';
import { ClientNattSubscription, EventNattItem } from '../types';
import { PiggyBank, RefreshCw, Target, Calendar, ShieldAlert, Plus, Trash2, Users } from 'lucide-react';

interface NattsProps {
  subscriptions: ClientNattSubscription[];
  eventNattsList: EventNattItem[];
  onOpenCreateEventModal: () => void;
  onDeleteEventNatt: (eventId: string) => void;
}

export const Natts: React.FC<NattsProps> = ({
  subscriptions,
  eventNattsList,
  onOpenCreateEventModal,
  onDeleteEventNatt,
}) => {
  const classiqueCount = subscriptions.filter(s => s.category === 'classique').length;
  const tekkTeguiCount = subscriptions.filter(s => s.category === 'tekk_tegui').length;
  const evenementCount = subscriptions.filter(s => s.category === 'evenement').length;

  return (
    <div>
      {/* Top Banner */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PiggyBank color="#D8C911" />
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

            <div style={{ background: 'rgba(4, 37, 45, 0.7)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
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
                <span style={{ fontWeight: 800, color: '#D8C911' }}>Dès 70% cotisé</span>
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

            <div style={{ background: 'rgba(4, 37, 45, 0.7)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
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
                <span style={{ fontWeight: 800, color: '#D8C911' }}>Dès 70% cotisé</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Souscriptions actives :</span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#c084fc' }}>{tekkTeguiCount}</span>
          </div>
        </div>
      </div>

      {/* Dynamic List of Event Natts with Create / Delete actions */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🎉 Catalogue des Natts Événementiels Paramétrés</span>
              <span className="badge badge-yellow">{eventNattsList.length} disponibles</span>
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Créez ou supprimez des événements spécifiques (Tabaski, Magal, Rentrée Scolaire, Baptême) pour vos souscripteurs.
            </div>
          </div>

          <button className="btn btn-primary btn-sm" onClick={onOpenCreateEventModal}>
            <Plus size={14} />
            <span>Créer un Natt Événementiel</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {eventNattsList.map((evt) => (
            <div
              key={evt.id}
              style={{
                background: 'rgba(4, 37, 45, 0.7)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{evt.emoji}</span>
                    <h4 style={{ fontWeight: 800, fontSize: '0.95rem' }}>{evt.title}</h4>
                  </div>

                  {evt.isDeletable && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le Natt événementiel "${evt.title}" ?`)) {
                          onDeleteEventNatt(evt.id);
                        }
                      }}
                      title="Supprimer cet événement"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                  {evt.description}
                </p>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '0.75rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Échéance :</span>
                    <span style={{ fontWeight: 700, color: '#10B981' }}>{evt.eventDate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Montant Cible Recommandé :</span>
                    <span style={{ fontWeight: 800, color: '#D8C911' }}>{evt.targetAmountFcfa.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Users size={14} />
                  <span>{evt.subscribersCount} souscripteur(s)</span>
                </span>
                <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>
                  Déblocage 70%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
