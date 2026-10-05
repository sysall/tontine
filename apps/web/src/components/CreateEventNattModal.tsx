import React, { useState } from 'react';
import { EventNattItem } from '../types';
import { Calendar, X, PlusCircle, Loader2 } from 'lucide-react';

interface CreateEventNattModalProps {
  onClose: () => void;
  onAddEventNatt: (newEvent: Omit<EventNattItem, 'id' | 'subscribersCount'>) => void | Promise<void>;
}

export const CreateEventNattModal: React.FC<CreateEventNattModalProps> = ({
  onClose,
  onAddEventNatt,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    return defaultDate.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedDate || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formattedDate = new Date(selectedDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const finalTitle = title.startsWith('Natt') ? title : `Natt — ${title}`;
      const finalDescription = description
        ? description
        : 'Épargne événementielle journalière sur 10 tours (6 options: 100 000 à 1 000 000 FCFA).';

      const eventPayload = {
        title: finalTitle,
        description: finalDescription,
        eventDate: formattedDate,
        targetAmountFcfa: 1000000,
        emoji: '🎉',
        isDeletable: true,
      };

      // Single point of persistence via API & Firestore
      await onAddEventNatt(eventPayload);
      onClose();
    } catch (err) {
      console.error('Erreur publication Natt Événementiel:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Créer un Natt Événementiel</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fréquence Journalière — 10 Tours de cotisation</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Titre de l'Événement / Projet</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Objectif</label>
            <textarea
              className="form-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'none' }}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Échéance de l'Événement</label>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Enregistrement sur Firestore...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  <span>Publier le Natt Événementiel</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
