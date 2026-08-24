import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'gold' | 'purple' | 'blue';
  trend?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'emerald',
  trend,
}) => {
  return (
    <div className={`glass-card kpi-card ${variant}`}>
      <div className="kpi-header">
        <span className="kpi-label">{title}</span>
        <div className="kpi-icon">
          <Icon size={20} />
        </div>
      </div>
      <div className="kpi-value">{value}</div>
      {(subtitle || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
          {subtitle && <span className="kpi-subtitle">{subtitle}</span>}
          {trend && (
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
