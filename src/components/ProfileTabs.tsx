import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, Settings, CreditCard, Package } from 'lucide-react';
import LeadPackagesTab from './LeadPackagesTab';

interface ProfileTabsProps {
  userId: string;
  currentLeads: number;
  onLeadsUpdate: (newLeads: number) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  userId, 
  currentLeads, 
  onLeadsUpdate 
}) => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Perfil
        </TabsTrigger>
        <TabsTrigger value="subscription" className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Assinatura
        </TabsTrigger>
        <TabsTrigger value="lead-packages" className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          Pacotes de Leads
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Configurações
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Informações do Perfil</h2>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e preferências de conta.
          </p>
          {/* Conteúdo do perfil aqui */}
        </div>
      </TabsContent>

      <TabsContent value="subscription" className="mt-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Gerenciar Assinatura</h2>
          <p className="text-muted-foreground">
            Visualize e gerencie sua assinatura atual.
          </p>
          {/* Conteúdo da assinatura aqui */}
        </div>
      </TabsContent>

      <TabsContent value="lead-packages" className="mt-6">
        <LeadPackagesTab 
          userId={userId}
          currentLeads={currentLeads}
          onLeadsUpdate={onLeadsUpdate}
        />
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Configurações</h2>
          <p className="text-muted-foreground">
            Personalize sua experiência na plataforma.
          </p>
          {/* Conteúdo das configurações aqui */}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
