import React, { useState } from 'react';
import { NattCategory } from '../types';
import { PlusCircle, X, PiggyBank, Sparkles } from 'lucide-react';

interface NewNattModalProps {
  onClose: () => void;
  onAddSubscription: (newSub: {
    clientName: string;
    clientPhone: string;
    category: NattCategory;
    targetAmountFcfa: number;
    initialDepositFcfa: number;
  }) => void;
}

export const NewNattModal: React.FC<NewNattModalProps> = ({ onClose, onAddSubscription }) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+221 ');
  const [category, setCategory] = useState<NattCategory>('classique');
  const [targetAmountFcfa, setTargetAmountFcfa] = useState<number>(500000);
  const [initialDepositFcfa, setInitialDepositFcfa] = useState<number>(50000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    onAddSubscription({
      clientName,
      clientPhone,
      category,
      targetAmountFcfa,
      initialDepositFcfa,
    });
    onClose();
  };

  const getCategoryTitle = () => {
    switch (category) {
      case 'classique':
        return 'Natt Classique Mensuel';
      case 'tekk_tegui':
        return 'Tekk Tegui Projet Express';
      case 'evenement':
        return 'Natt Événement (Tabaski, Magal, Korité)';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PiggyBank size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Créer une Souscription Natt</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sans regroupement en groupe — Direct Trésorerie</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nom Complet du Client</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="ex: Aminata Bâ"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Numéro de Téléphone (Mobile Money)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="+221 77 000 00 00"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Système d'Épargne Natt Choisi</label>
            <select 
              className="form-select"
              value={category}
              onChange={(e) => {
                const cat = e.target.value as NattCategory;
                setCategory(cat);
                if (cat === 'classique') setTargetAmountFcfa(1000000);
                if (cat === 'tekk_tegui') setTargetAmountFcfa(500000);
                if (cat === 'evenement') setTargetAmountFcfa(300000);
              }}
            >
              <option value="classique">🔄 Natt Classique (Fixe Mensuel)</option>
              <option value="tekk_tegui">⚡ Tekk Tegui (Épargne Projet / Équipement)</option>
              <option value="evenement">🎉 Natt Événement (Tabaski, Korité, Rentrée)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Montant Total du Natt (FCFA)</label>
              <select 
                className="form-select"
                value={targetAmountFcfa}
                onChange={(e) => setTargetAmountFcfa(Number(e.target.value))}
              >
                <option value={250000}>250 000 FCFA</option>
                <option value={500000}>500 000 FCFA</option>
                <option value={1000000}>1 000 000 FCFA</option>
                <option value={2000000}>2 000 000 FCFA</option>
                <option value={3000000}>3 000 000 FCFA</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Premier Dépôt (FCFA)</label>
              <input 
                type="number" 
                className="form-input" 
                step={10000}
                value={initialDepositFcfa}
                onChange={(e) => setInitialDepositFcfa(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Seuil 70% Calculation preview */}
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#fbbf24' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <Sparkles size={16} />
              <span>Seuil de Versement à 70%</span>
            </div>
            <div style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>
              Le client recevra la totalité des <strong>{targetAmountFcfa.toLocaleString('fr-FR')} FCFA</strong> dès qu'il aura versé <strong>{(targetAmountFcfa * 0.7).toLocaleString('fr-FR')} FCFA</strong> (70%).
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              <PlusCircle size={16} />
              <span>Activer la Souscription</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
