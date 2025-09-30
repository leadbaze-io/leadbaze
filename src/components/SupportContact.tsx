import React from 'react';
import { MessageCircle, Mail, Phone, Calendar } from 'lucide-react';
import styles from './SupportContact.module.css';

interface SupportContactProps {
  className?: string;
}

export const SupportContact: React.FC<SupportContactProps> = ({ className = '' }) => {
  return (
    <div className={`${styles.planChangeCard} ${className}`}>
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper}>
          <MessageCircle className={styles.cardIcon} />
        </div>
        <div className={styles.headerContent}>
          <h3 className={styles.cardTitle}>Alteração de Plano</h3>
          <p className={styles.cardSubtitle}>Entre em contato para fazer upgrade ou downgrade</p>
        </div>
      </div>
      
      <div className={styles.cardBody}>
        <p className={styles.description}>
          Caso queira realizar um <span className={styles.highlight}>downgrade</span> ou <span className={styles.highlight}>upgrade</span> no seu plano, 
          favor entrar em contato com nosso suporte especializado!
        </p>
        
        <div className={styles.contactSection}>
          <h4 className={styles.contactTitle}>Informações de Contato</h4>
          
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <div className={styles.contactIconWrapper}>
                <Mail className={styles.contactIcon} />
              </div>
              <div className={styles.contactInfo}>
                <span className={styles.contactLabel}>E-mail</span>
                <span className={styles.contactValue}>leadbaze@gmail.com</span>
              </div>
            </div>
            
            <div className={styles.contactCard}>
              <div className={styles.contactIconWrapper}>
                <Phone className={styles.contactIcon} />
              </div>
              <div className={styles.contactInfo}>
                <span className={styles.contactLabel}>Telefone</span>
                <span className={styles.contactValue}>(11) 99999-9999</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.scheduleSection}>
          <div className={styles.scheduleIcon}>
            <Calendar className="w-4 h-4" />
          </div>
          <div className={styles.scheduleContent}>
            <span className={styles.scheduleLabel}>Horário de Atendimento</span>
            <span className={styles.scheduleValue}>Segunda a Sexta, das 9h às 18h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportContact;

