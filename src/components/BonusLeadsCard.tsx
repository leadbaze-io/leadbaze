import React from 'react';
import { Gift } from 'lucide-react';
import '../styles/bonus-leads-card.css';

interface BonusLeadsCardProps {
  profile: {
    bonus_leads?: number;
    bonus_leads_used?: number;
  };
  className?: string;
}

export const BonusLeadsCard: React.FC<BonusLeadsCardProps> = ({ 
  profile, 
  className = '' 
}) => {
  const formatLeads = (count: number) => {
    return new Intl.NumberFormat('pt-BR').format(count);
  };

  const leadsRemaining = (profile.bonus_leads || 0) - (profile.bonus_leads_used || 0);
  const usagePercentage = (profile.bonus_leads || 0) > 0 
    ? Math.round(((profile.bonus_leads_used || 0) / (profile.bonus_leads || 1)) * 100)
    : 0;

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bonus-leads-card-progress-red';
    if (percentage >= 70) return 'bonus-leads-card-progress-yellow';
    return 'bonus-leads-card-progress-green';
  };

  return (
    <div className={`bonus-leads-card ${className}`}>
      {/* Header */}
      <div className="bonus-leads-card-header">
        <div className="bonus-leads-card-title">
          <div className="bonus-leads-card-status-dot"></div>
          <span className="bonus-leads-card-title-text">Leads Gratuitos</span>
        </div>
        <Gift className="bonus-leads-card-icon" />
      </div>

      {/* Leads Disponíveis */}
      <div className="bonus-leads-card-content">
        <div className="bonus-leads-card-info-row">
          <span className="bonus-leads-card-label">Leads disponíveis</span>
          <span className="bonus-leads-card-value">{formatLeads(leadsRemaining)}</span>
        </div>
        
        {/* Barra de Progresso */}
        <div className="bonus-leads-card-progress-container">
          <div 
            className={`bonus-leads-card-progress-bar ${getUsageColor(usagePercentage)}`}
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
        
        {/* Status */}
        <div className="bonus-leads-card-status-row">
          <div className="bonus-leads-card-status-indicator">
            <div className="bonus-leads-card-status-dot-small"></div>
            <span>Status: Ativo</span>
          </div>
          <span>{formatLeads(profile.bonus_leads_used || 0)} de {formatLeads(profile.bonus_leads || 0)} usados</span>
        </div>
      </div>
    </div>
  );
};

export default BonusLeadsCard;
