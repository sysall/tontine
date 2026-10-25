import React, { useState, useEffect } from 'react';
import { KycRecord } from '../types';
import { X, ShieldAlert, XCircle, Eye, UserCheck, FileCheck, Maximize2 } from 'lucide-react';

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
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fermer le plein écran avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const currentImageUrl = activeImageTab === 'front' 
    ? record.documentFrontUrl 
    : activeImageTab === 'back' 
      ? record.documentBackUrl 
      : record.selfieUrl;

  const currentTabLabel = activeImageTab === 'front' 
    ? 'Recto CNI / Doc' 
    : activeImageTab === 'back' 
      ? 'Verso CNI' 
      : 'Selfie Visage';

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(25, 166, 106, 0.12)', color: '#19A66A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Vérification KYC Manuelle</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Dépôt par <strong>{record.clientName}</strong> ({record.clientPhone})
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Grid: Left Document Images Preview, Right Manual Verification Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Left: Document View */}
            <div style={{ background: 'rgba(23, 63, 115, 0.04)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem' }}>
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

              <div 
                onClick={() => setIsFullscreen(true)}
                style={{
                  height: '280px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'rgba(23, 63, 115, 0.06)',
                  border: '1px dashed var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'zoom-in',
                }}
                title="Cliquer pour afficher en plein écran"
              >
                <img
                  src={currentImageUrl}
                  alt="Document KYC"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullscreen(true);
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  }}
                  title="Afficher en plein écran"
                >
                  <Maximize2 size={13} color="#19A66A" />
                  <span style={{ fontWeight: 700 }}>Contrôle visuel</span>
                </button>
              </div>
            </div>

            {/* Right: Manual Verification Details & Inspection Notes */}
            <div style={{ background: 'rgba(23, 63, 115, 0.04)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileCheck size={16} color="#19A66A" />
                  <span>Détails pour Contrôle Manuel</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Nom du Client :</span>
                    <span style={{ fontWeight: 700 }}>{record.clientName}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Téléphone :</span>
                    <span style={{ fontWeight: 700, color: '#173F73' }}>{record.clientPhone}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Type de Pièce :</span>
                    <span style={{ fontWeight: 800, color: '#19A66A' }}>{record.documentType || 'CNI CEDEAO'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Date de Soumission :</span>
                    <span style={{ fontWeight: 600 }}>{record.submittedAt}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Statut Dossier :</span>
                    <span className={`badge ${record.status === 'VERIFIED' ? 'badge-emerald' : record.status === 'REJECTED' ? 'badge-yellow' : 'badge-gold'}`}>
                      {record.status === 'VERIFIED' ? 'Validé' : record.status === 'REJECTED' ? 'Rejeté' : 'En attente de vérification'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Note d'inspection / Remarques Admin</label>
                <textarea
                  className="form-input"
                  rows={3}
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
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
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

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isFullscreen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.94)',
            backdropFilter: 'blur(10px)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setIsFullscreen(false)}
        >
          {/* Top Control Bar */}
          <div
            style={{
              position: 'absolute',
              top: '1.25rem',
              left: '2rem',
              right: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10001,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ffffff' }}>
              <Eye size={22} color="#19A66A" />
              <div>
                <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{currentTabLabel}</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                  • {record.clientName} ({record.clientPhone})
                </span>
              </div>
            </div>

            {/* Document Switcher Tabs in Fullscreen */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.1)', padding: '0.3rem', borderRadius: '12px' }}>
              <button
                type="button"
                className={`btn btn-sm ${activeImageTab === 'front' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveImageTab('front')}
              >
                Recto
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeImageTab === 'back' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveImageTab('back')}
              >
                Verso
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeImageTab === 'selfie' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveImageTab('selfie')}
              >
                Selfie
              </button>
            </div>

            {/* Close Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Fermer le plein écran (Échap)"
            >
              <X size={22} />
            </button>
          </div>

          {/* Fullscreen Image Container */}
          <div
            style={{
              maxWidth: '92vw',
              maxHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImageUrl}
              alt={`Document KYC ${currentTabLabel}`}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            />
          </div>

          {/* Footer Hint */}
          <div
            style={{
              position: 'absolute',
              bottom: '1.25rem',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.8rem',
            }}
          >
            Cliquez en dehors de l'image ou appuyez sur <strong>Échap</strong> pour quitter le plein écran
          </div>
        </div>
      )}
    </>
  );
};
