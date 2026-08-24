import React, { useState } from 'react';
import { KycRecord } from '../types';
import { ShieldCheck, Search, Filter, AlertTriangle, CheckCircle2, XCircle, Eye, UserCheck, Smartphone } from 'lucide-react';

interface KycProps {
  kycRecords: KycRecord[];
  onOpenKycModal: (record: KycRecord) => void;
}

export const Kyc: React.FC<KycProps> = ({ kycRecords, onOpenKycModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');

  const pendingCount = kycRecords.filter(r => r.status === 'PENDING_MANUAL_CHECK').length;
  const verifiedCount = kycRecords.filter(r => r.status === 'VERIFIED').length;
  const rejectedCount = kycRecords.filter(r => r.status === 'REJECTED').length;

  const filteredRecords = kycRecords.filter(r => {
    const matchesSearch = r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.clientPhone.includes(searchTerm) ||
                          r.extractedNin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterStatus === 'ALL' ||
      (filterStatus === 'PENDING' && r.status === 'PENDING_MANUAL_CHECK') ||
      (filterStatus === 'VERIFIED' && r.status === 'VERIFIED') ||
      (filterStatus === 'REJECTED' && r.status === 'REJECTED');

    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Top Banner */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck color="#D8C911" />
              <span>Vérification KYC & Double Checking OCR</span>
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Contrôle visuel et validation manuelle des pièces d'identité lorsque l'OCR automatique n'est pas concluant.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="badge badge-yellow" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
              <AlertTriangle size={14} />
              <span>{pendingCount} Double Check(s) Requis</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div 
          className={`glass-card glass-card-interactive ${filterStatus === 'PENDING' ? 'selected' : ''}`}
          onClick={() => setFilterStatus('PENDING')}
          style={{ borderColor: filterStatus === 'PENDING' ? '#D8C911' : 'var(--border-color)', background: 'rgba(216, 201, 17, 0.08)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>En Attente Double Check</span>
            <AlertTriangle size={20} color="#D8C911" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#D8C911', marginTop: '0.25rem' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>OCR inconcluant ou incomplet</div>
        </div>

        <div 
          className={`glass-card glass-card-interactive ${filterStatus === 'VERIFIED' ? 'selected' : ''}`}
          onClick={() => setFilterStatus('VERIFIED')}
          style={{ borderColor: filterStatus === 'VERIFIED' ? '#10B981' : 'var(--border-color)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Comptes Valides</span>
            <CheckCircle2 size={20} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#34d399', marginTop: '0.25rem' }}>
            {verifiedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Approuvés par OCR ou Admin</div>
        </div>

        <div 
          className={`glass-card glass-card-interactive ${filterStatus === 'REJECTED' ? 'selected' : ''}`}
          onClick={() => setFilterStatus('REJECTED')}
          style={{ borderColor: filterStatus === 'REJECTED' ? '#ef4444' : 'var(--border-color)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Dépôts Rejetés</span>
            <XCircle size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f87171', marginTop: '0.25rem' }}>
            {rejectedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Pièces non conformes</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Rechercher un dépôt KYC par nom client, téléphone, NIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.75rem', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(4, 37, 45, 0.7)', padding: '0.35rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <button 
            className={`btn btn-sm ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus('ALL')}
          >
            Tous ({kycRecords.length})
          </button>
          <button 
            className={`btn btn-sm ${filterStatus === 'PENDING' ? 'btn-gold' : 'btn-secondary'}`}
            onClick={() => setFilterStatus('PENDING')}
          >
            A vérifier ({pendingCount})
          </button>
        </div>
      </div>

      {/* KYC Table */}
      <div className="glass-card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Client & Contact</th>
                <th>Type de Pièce</th>
                <th>NIN (N° CNI) Extrait</th>
                <th>Score Confiance OCR</th>
                <th>Statut OCR & Résultat</th>
                <th>Date Soumission</th>
                <th>Action Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Aucun dossier KYC correspondant à vos critères.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const isLowConf = record.ocrConfidencePercent < 85;
                  return (
                    <tr key={record.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{record.clientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{record.clientPhone}</div>
                      </td>
                      <td>
                        <span className="badge badge-gray">{record.documentType}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#D8C911' }}>
                          {record.extractedNin}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isLowConf ? 'badge-yellow' : 'badge-emerald'}`}>
                          {record.ocrConfidencePercent}% {isLowConf ? ' (Inconcluant)' : ' (Concluant)'}
                        </span>
                      </td>
                      <td>
                        {record.status === 'PENDING_MANUAL_CHECK' ? (
                          <span className="badge badge-yellow">
                            <AlertTriangle size={12} />
                            <span>Double Check Requis</span>
                          </span>
                        ) : record.status === 'VERIFIED' ? (
                          <span className="badge badge-emerald">
                            <CheckCircle2 size={12} />
                            <span>Compte Validé</span>
                          </span>
                        ) : (
                          <span className="badge badge-gray" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                            <XCircle size={12} />
                            <span>Rejeté</span>
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{record.submittedAt}</td>
                      <td>
                        <button 
                          className={`btn btn-sm ${record.status === 'PENDING_MANUAL_CHECK' ? 'btn-gold' : 'btn-secondary'}`}
                          onClick={() => onOpenKycModal(record)}
                        >
                          <Eye size={14} />
                          <span>Inspecter</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
