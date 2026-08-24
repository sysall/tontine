import React, { useState } from 'react';
import { EventNattItem } from '../types';
import { Calendar, X, PlusCircle, Sparkles } from 'lucide-react';

interface CreateEventNattModalProps {
  onClose: () => void;
  onAddEventNatt: (newEvent: Omit<EventNattItem, 'id' | 'subscribersCount'>) => void;
}

const EMOJI_OPTIONS = ['🎉', '🐑', '🕌', '🎒', '💍', '🌙', '✈️', '🎓', '🏥', '🏠'];

export const CreateEventNattModal: React.FC<CreateEventNattModalProps> = ({
  onClose,
  onAddEventNatt,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('Septembre 2026');
  const [targetAmountFcfa, setTargetAmountFcfa] = useState<number>(500000);
  const [selectedEmoji, setSelectedEmoji] = useState('🎒');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEventNatt({
      title: title.startsWith('Natt Événement') ? title : `Natt Événement — ${title}`,
      description: description || 'Épargne événementielle ciblée avec déblocage à 70% de cotisation.',
      eventDate,
      targetAmountFcfa,
      emoji: selectedEmoji,
      isDeletable: true,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
              {selectedEmoji}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Créer un Natt Événementiel</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Offre d'épargne événementielle sur-mesure</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Emoji Selection */}
          <div className="form-group">
            <label className="form-label">Icône / Emoji de l'Événement</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    border: selectedEmoji === emoji ? '2px solid #10b981' : '1px solid var(--border-color)',
                    background: selectedEmoji === emoji ? 'rgba(16, 185, 129, 0.2)' : 'rgba(9, 13, 22, 0.6)',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Titre de l'Événement</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="ex: Rentrée Scolaire 2026, Grand Magal, Mariage..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Objectif</label>
            <textarea 
              className="form-input" 
              rows={2}
              placeholder="ex: Financement des fournitures et frais de scolarité pour la rentrée de septembre."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Échéance / Date de l'Événement</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="ex: Septembre 2026"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Montant Cible Recommandé (FCFA)</label>
              <select 
                className="form-select"
                value={targetAmountFcfa}
                onChange={(e) => setTargetAmountFcfa(Number(e.target.value))}
              >
                <option value={200000}>200 000 FCFA</option>
                <option value={350000}>350 000 FCFA</option>
                <option value={500000}>500 000 FCFA</option>
                <option value={750000}>750 000 FCFA</option>
                <option value={1000000}>1 000 000 FCFA</option>
                <option value={2000000}>2 000 000 FCFA</option>
              </select>
            </div>
          </div>

          {/* Info Card */}
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#34d399' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <Sparkles size={16} />
              <span>Règle des 70% Appliquée</span>
            </div>
            <div style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>
              Les clients s'inscrivant à ce Natt recevront 100% de la somme cible dès qu'ils auront atteint <strong>70% de leur cotisation</strong>.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              <PlusCircle size={16} />
              <span>Publier le Natt Événementiel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
