import React, { useState } from 'react';
import { KycRecord } from '../types';
import { X, ShieldAlert, CheckCircle2, XCircle, Eye, FileText, UserCheck, AlertTriangle } from 'lucide-react';

interface KycDetailModalProps {
  record: KycRecord;
  onClose: () => void;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes: string) => void;
}

export const KycDetailModal: React.FC<KycDetailModalProps> = ({
  record,
  onClose,
  onApprove,
  onReject,
}) => {
  const [adminNotes, setAdminNotes] = useState(record.adminNotes || '');
  const [activeImageTab, setActiveImageTab] = useState<'front' | 'back' | 'selfie'>('front');

  const isLowConfidence = record.ocrConfidencePercent < 85;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: isLowConfidence ? 'rgba(216, 201, 17, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: isLowConfidence ? '#D8C911' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Double Checking KYC & Verification OCR</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Dépôt par <strong>{record.clientName}</strong> ({record.clientPhone})
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* OCR Result Banner */}
        <div style={{
          background: isLowConfidence ? 'rgba(216, 201, 17, 0.12)' : 'rgba(16, 185, 129, 0.12)',
          border: `1px solid ${isLowConfidence ? 'rgba(216, 201, 17, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isLowConfidence ? <AlertTriangle size={22} color="#D8C911" /> : <CheckCircle2 size={22} color="#10B981" />}
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isLowConfidence ? '#D8C911' : '#34d399' }}>
                {isLowConfidence ? 'OCR Inconcluant — Validation Manuelle Requise par l\'Admin' : 'OCR Concluant (Haute Confiance)'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Taux de confiance de la reconnaissance optique : <strong>{record.ocrConfidencePercent}%</strong>
              </div>
            </div>
          </div>

          <span className={`badge ${isLowConfidence ? 'badge-yellow' : 'badge-emerald'}`}>
            Score OCR: {record.ocrConfidencePercent}%
          </span>
        </div>

        {/* Grid: Left Document Images Preview, Right Extracted OCR Data */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Left: Document View */}
          <div style={{ background: 'rgba(4, 37, 45, 0.7)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button 
                className={`btn btn-sm ${activeImageTab === 'front' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveImageTab('front')}
              >
                Recto CNI / Doc
              </button>
              <button 
                className={`btn btn-sm ${activeImageTab === 'back' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveImageTab('back')}
              >
                Verso CNI
              </button>
              <button 
                className={`btn btn-sm ${activeImageTab === 'selfie' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveImageTab('selfie')}
              >
                Selfie Visage
              </button>
            </div>

            <div style={{
              height: '240px',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#031c22',
              border: '1px dashed var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <img 
                src={activeImageTab === 'front' ? record.documentFrontUrl : activeImageTab === 'back' ? record.documentBackUrl : record.selfieUrl} 
                alt="Document KYC"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', color: '#ffffff' }}>
                <Eye size={12} style={{ display: 'inline', marginRight: '4px' }} />
                <span>Zoom HD actif</span>
              </div>
            </div>
          </div>

          {/* Right: Extracted OCR Fields Comparison */}
          <div style={{ background: 'rgba(4, 37, 45, 0.7)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={16} color="#D8C911" />
                <span>Champs Extraits par OCR</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Type de Pièce :</span>
                  <span style={{ fontWeight: 800, color: '#D8C911' }}>{record.documentType}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>NIN (N° CNI) Extrait :</span>
                  <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#F8FAF7' }}>{record.extractedNin}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Nom & Prénom OCR :</span>
                  <span style={{ fontWeight: 700 }}>{record.extractedFullName}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date de Naissance :</span>
                  <span style={{ fontWeight: 700 }}>{record.extractedBirthDate}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date d'Expiration :</span>
                  <span style={{ fontWeight: 700, color: '#10B981' }}>{record.extractedExpiryDate}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Note d'inspection / Remarques Admin</label>
              <textarea 
                className="form-input"
                rows={2}
                placeholder="Remarques (ex: Document lisible et conforme après contrôle visuel...)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                style={{ fontSize: '0.8rem', resize: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
          
          <button 
            type="button"
            className="btn"
            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)' }}
            onClick={() => onReject(record.id, adminNotes || 'Document non conforme ou illisible.')}
          >
            <XCircle size={16} />
            <span>Rejeter le KYC</span>
          </button>

          <button 
            type="button"
            className="btn btn-primary"
            onClick={() => onApprove(record.id, adminNotes)}
          >
            <UserCheck size={16} />
            <span>Valider & Approuver le Compte Client</span>
          </button>
        </div>
      </div>
    </div>
  );
};
