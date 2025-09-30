import React from 'react';
import { Settings, Gift } from 'lucide-react';
import '../styles/bonus-leads-alert.css';

interface SimpleBonusLeadsAlertProps {
  leadsRemaining: number;
  onAdjustQuantity: () => void;
}

export const SimpleBonusLeadsAlert: React.FC<SimpleBonusLeadsAlertProps> = ({
  leadsRemaining,
  onAdjustQuantity
}) => {
  // Se não há leads restantes, não renderizar o componente
  if (leadsRemaining <= 0) {
    return null;
  }
  
  const handleAdjustQuantity = () => {
    onAdjustQuantity();
  };

  // Detectar se está no modo escuro
  const isDark = document.documentElement.classList.contains('dark');
  
  const containerStyle = {
    background: isDark ? '#374151' : 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)',
    borderColor: '#fb923c'
  };
  
  const titleStyle = {
    color: isDark ? '#ffffff' : '#9a3412',
    fontWeight: '700',
    fontSize: '20px'
  };
  
  const descriptionStyle = {
    color: isDark ? '#ffffff' : '#c2410c',
    fontWeight: '500',
    fontSize: '16px'
  };

  return (
    <div 
      className="bonus-leads-alert"
      style={containerStyle}
    >
      <div className="bonus-leads-header">
        <div className="bonus-leads-info">
          <div className="bonus-leads-icon bonus-leads-icon-light dark:bonus-leads-icon-dark">
            <Gift className="bonus-leads-icon-light dark:bonus-leads-icon-dark" />
          </div>
          <div>
            <h3 style={titleStyle}>
              🎁 Leads Bônus Disponíveis
            </h3>
            <p style={descriptionStyle}>
              Você tem {leadsRemaining} leads bônus restantes
            </p>
          </div>
        </div>
      </div>
      
      <div className="bonus-leads-buttons">
        <button
          onClick={handleAdjustQuantity}
          className="bonus-leads-btn-adjust bonus-leads-btn-adjust-light dark:bonus-leads-btn-adjust-dark"
        >
          <Settings />
          Ajustar Quantidade
        </button>
        
        <button
          onClick={() => window.location.href = '/plans'}
          className="bonus-leads-btn-plans bonus-leads-btn-plans-light dark:bonus-leads-btn-plans-dark"
        >
          Ver Planos
        </button>
      </div>
    </div>
  );
};
