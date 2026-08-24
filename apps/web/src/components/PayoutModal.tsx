import React, { useState } from 'react';
import { ClientNattSubscription } from '../types';
import { CheckCircle2, AlertTriangle, X, ShieldCheck, Send } from 'lucide-react';

interface PayoutModalProps {
  subscription: ClientNattSubscription;
  onClose: () => void;
  onConfirmPayout: (subscriptionId: string, provider: 'Wave' | 'Orange Money' | 'Virement') => void;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({
  subscription,
  onClose,
  onConfirmPayout,
}) => {
  const [provider, setProvider] = useState<'Wave' | 'Orange Money' | 'Virement'>('Wave');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirmPayout(subscription.id, provider);
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Valider le Versement (100%)</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Déblocage Trésorerie Unique — Règle des 70%</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Highlight Alert */}
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>
            <CheckCircle2 size={18} />
            <span>Seuil de 70% de Cotisation Atteint !</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Le client <strong>{subscription.clientName}</strong> a cotisé <strong>{subscription.contributedAmountFcfa.toLocaleString('fr-FR')} FCFA</strong> ({subscription.progressPercent.toFixed(1)}%) sur son Natt de {subscription.targetAmountFcfa.toLocaleString('fr-FR')} FCFA.
          </div>
        </div>

        {/* Payout Details */}
        <div style={{ background: 'rgba(9, 13, 22, 0.6)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Client Bénéficiaire</span>
              <div style={{ fontWeight: 700 }}>{subscription.clientName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{subscription.clientPhone}</div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Natt Concerné</span>
              <div style={{ fontWeight: 700 }}>{subscription.categoryTitle}</div>
            </div>

            <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Montant du Versement (100%) :</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>
                {subscription.targetAmountFcfa.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Form Operator Selection */}
        <div className="form-group">
          <label className="form-label">Canal de Versement (Mobile Money / Banque)</label>
          <select 
            className="form-select"
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
          >
            <option value="Wave">Wave Sénégal (Paiement Instantané)</option>
            <option value="Orange Money">Orange Money Sénégal</option>
            <option value="Virement">Virement Bancaire Direct</option>
          </select>
        </div>

        {/* Warning Note */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            Le montant sera directement prélevé de la <strong>Trésorerie Unique Centralisée</strong> de Tontine Express et transféré au numéro {subscription.clientPhone}.
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={isProcessing}>
            Annuler
          </button>
          <button 
            className="btn btn-gold" 
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span>Traitement du Versement...</span>
            ) : (
              <>
                <Send size={16} />
                <span>Confirmer & Verser {subscription.targetAmountFcfa.toLocaleString('fr-FR')} FCFA</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
