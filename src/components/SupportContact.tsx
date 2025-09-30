import React from 'react';
import { MessageCircle, Mail, Phone, Calendar } from 'lucide-react';

interface SupportContactProps {
  className?: string;
}

export const SupportContact: React.FC<SupportContactProps> = ({ className = '' }) => {
  return (
    <div className={`plan-change-card ${className}`}>
      <div className="card-header">
        <div className="icon-wrapper">
          <MessageCircle className="card-icon" />
        </div>
        <div className="header-content">
          <h3 className="card-title">Alteração de Plano</h3>
          <p className="card-subtitle">Entre em contato para fazer upgrade ou downgrade</p>
        </div>
      </div>
      
      <div className="card-body">
        <p className="description">
          Caso queira realizar um <span className="highlight">downgrade</span> ou <span className="highlight">upgrade</span> no seu plano, 
          favor entrar em contato com nosso suporte especializado!
        </p>
        
        <div className="contact-section">
          <h4 className="contact-title">Informações de Contato</h4>
          
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon-wrapper">
                <Mail className="contact-icon" />
              </div>
              <div className="contact-info">
                <span className="contact-label">E-mail</span>
                <span className="contact-value">leadbaze@gmail.com</span>
              </div>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon-wrapper">
                <Phone className="contact-icon" />
              </div>
              <div className="contact-info">
                <span className="contact-label">Telefone</span>
                <span className="contact-value">(11) 99999-9999</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="schedule-section">
          <div className="schedule-icon">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="schedule-content">
            <span className="schedule-label">Horário de Atendimento</span>
            <span className="schedule-value">Segunda a Sexta, das 9h às 18h</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ===== RESET E BASE ===== */
        .plan-change-card {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* ===== MODO CLARO - DESIGN COMPLETO ===== */
        .plan-change-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          box-shadow: 
            0 1px 3px 0 rgba(0, 0, 0, 0.1),
            0 1px 2px 0 rgba(0, 0, 0, 0.06);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .plan-change-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8, #1e40af);
        }

        .plan-change-card:hover {
          transform: translateY(-4px);
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: #3b82f6;
        }

        /* HEADER - MODO CLARO */
        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 24px 24px 16px 24px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .icon-wrapper {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .card-icon {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .header-content {
          flex: 1;
          min-width: 0;
        }

        .card-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px 0;
          line-height: 1.3;
        }

        .card-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
          font-weight: 500;
        }

        /* BODY - MODO CLARO */
        .card-body {
          padding: 0 24px 24px 24px;
        }

        .description {
          font-size: 15px;
          color: #374151;
          margin: 0 0 24px 0;
          line-height: 1.6;
        }

        .highlight {
          background: linear-gradient(120deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          padding: 2px 6px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
        }

        /* CONTACT SECTION - MODO CLARO */
        .contact-section {
          margin-bottom: 20px;
        }

        .contact-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 16px 0;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .contact-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .contact-card:hover {
          background: #f3f4f6;
          border-color: #3b82f6;
          transform: translateY(-1px);
        }

        .contact-icon-wrapper {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          background: #eff6ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .contact-icon {
          color: #3b82f6;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .contact-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .contact-value {
          font-size: 14px;
          color: #111827;
          font-weight: 600;
          word-break: break-all;
        }

        /* SCHEDULE SECTION - MODO CLARO */
        .schedule-section {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border: 1px solid #bfdbfe;
          border-radius: 12px;
        }

        .schedule-icon {
          flex-shrink: 0;
          color: #3b82f6;
        }

        .schedule-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .schedule-label {
          font-size: 12px;
          color: #1e40af;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .schedule-value {
          font-size: 14px;
          color: #1e40af;
          font-weight: 500;
        }

        /* ===== MODO ESCURO - DESIGN COMPLETO ===== */
        @media (prefers-color-scheme: dark) {
          .plan-change-card {
            background: #1f2937;
            border-color: #374151;
            box-shadow: 
              0 1px 3px 0 rgba(0, 0, 0, 0.3),
              0 1px 2px 0 rgba(0, 0, 0, 0.2);
          }

          .plan-change-card::before {
            background: linear-gradient(90deg, #60a5fa, #3b82f6, #2563eb);
          }

          .plan-change-card:hover {
            box-shadow: 
              0 20px 25px -5px rgba(0, 0, 0, 0.3),
              0 10px 10px -5px rgba(0, 0, 0, 0.2);
            border-color: #60a5fa;
          }

          /* HEADER - MODO ESCURO */
          .card-header {
            background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
          }

          .icon-wrapper {
            background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
            box-shadow: 0 4px 12px rgba(96, 165, 250, 0.25);
          }

          .card-title {
            color: #f9fafb;
          }

          .card-subtitle {
            color: #9ca3af;
          }

          /* BODY - MODO ESCURO */
          .description {
            color: #d1d5db;
          }

          .highlight {
            background: linear-gradient(120deg, #1e3a8a 0%, #1e40af 100%);
            color: #dbeafe;
          }

          /* CONTACT SECTION - MODO ESCURO */
          .contact-title {
            color: #f9fafb;
          }

          .contact-card {
            background: #374151;
            border-color: #4b5563;
          }

          .contact-card:hover {
            background: #4b5563;
            border-color: #60a5fa;
          }

          .contact-icon-wrapper {
            background: #1e3a8a;
          }

          .contact-icon {
            color: #60a5fa;
          }

          .contact-label {
            color: #9ca3af;
          }

          .contact-value {
            color: #f9fafb;
          }

          /* SCHEDULE SECTION - MODO ESCURO */
          .schedule-section {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            border-color: #3b82f6;
          }

          .schedule-icon {
            color: #dbeafe;
          }

          .schedule-label {
            color: #dbeafe;
          }

          .schedule-value {
            color: #bfdbfe;
          }
        }

        /* ===== RESPONSIVIDADE ===== */
        @media (max-width: 768px) {
          .card-header {
            padding: 20px 20px 16px 20px;
          }

          .card-body {
            padding: 0 20px 20px 20px;
          }

          .contact-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .contact-card {
            padding: 14px;
          }
        }

        @media (max-width: 480px) {
          .card-header {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }

          .icon-wrapper {
            align-self: center;
          }

          .card-title {
            font-size: 18px;
          }

          .description {
            font-size: 14px;
          }
        }

        /* ===== ANIMAÇÕES ===== */
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .plan-change-card {
          animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* ===== ACESSIBILIDADE ===== */
        @media (prefers-reduced-motion: reduce) {
          .plan-change-card,
          .contact-card {
            transition: none;
            animation: none;
          }
          
          .plan-change-card:hover {
            transform: none;
          }
          
          .contact-card:hover {
            transform: none;
          }
        }

        /* ===== FOCUS STATES ===== */
        .contact-card:focus-within {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        @media (prefers-color-scheme: dark) {
          .contact-card:focus-within {
            outline-color: #60a5fa;
          }
        }
      `}</style>
    </div>
  );
};

export default SupportContact;

