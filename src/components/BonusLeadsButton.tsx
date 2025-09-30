import React from 'react';
import { Settings } from 'lucide-react';

interface BonusLeadsButtonProps {
  onAdjustQuantity: () => void;
}

export const BonusLeadsButton: React.FC<BonusLeadsButtonProps> = ({ onAdjustQuantity }) => {
  return (
    <button
      onClick={onAdjustQuantity}
      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto"
    >
      <Settings className="w-5 h-5" />
      Ajustar Quantidade
    </button>
  );
};








