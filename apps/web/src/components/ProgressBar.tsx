import React from 'react';

interface ProgressBarProps {
  currentPercent: number; // 0 - 100+
  targetPercent?: number; // default 70%
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentPercent,
  targetPercent = 70,
  showLabel = true,
}) => {
  const boundedPercent = Math.min(Math.max(currentPercent, 0), 100);
  const isEligible = currentPercent >= targetPercent;

  return (
    <div className="progress-container">
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
          <span style={{ fontWeight: 600, color: isEligible ? '#fbbf24' : 'var(--text-main)' }}>
            Cotisé: {currentPercent.toFixed(1)}%
          </span>
          <span style={{ color: isEligible ? '#34d399' : 'var(--text-muted)', fontSize: '0.7rem' }}>
            Seuil Déblocage 100%: <strong>70%</strong>
          </span>
        </div>
      )}
      <div className="progress-track" title={`Progression actuelle: ${currentPercent}% (Seuil versement: 70%)`}>
        {/* Fill */}
        <div
          className={`progress-bar-fill ${isEligible ? 'eligible' : ''}`}
          style={{ width: `${boundedPercent}%` }}
        />
        {/* 70% Threshold Marker */}
        <div
          className="progress-marker-70"
          title="Seuil de déclenchement du versement 100% (70% cotisé)"
        />
      </div>
    </div>
  );
};
