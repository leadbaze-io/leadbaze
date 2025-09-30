import React from 'react';
import { MessageCircle, Mail, Phone } from 'lucide-react';

interface SupportContactProps {
  className?: string;
}

export const SupportContact: React.FC<SupportContactProps> = ({ className = '' }) => {
  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Alteração de Plano
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            Caso queira realizar um <strong>downgrade</strong> ou <strong>upgrade</strong> no seu plano, 
            favor entrar em contato com nosso suporte!
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Mail className="w-4 h-4" />
              <span className="text-sm">suporte@leadbaze.io</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Phone className="w-4 h-4" />
              <span className="text-sm">(11) 99999-9999</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Horário de atendimento:</strong> Segunda a Sexta, das 9h às 18h
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportContact;

