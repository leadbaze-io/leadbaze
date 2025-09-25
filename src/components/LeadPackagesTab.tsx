import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Loader2, CheckCircle, Zap, Rocket, Target, Crown, Sparkles } from 'lucide-react';
import '../styles/lead-packages.css';

interface LeadPackage {
  id: string;
  name: string;
  leads: number;
  price_cents: number;
  price_formatted: string;
  description: string;
  popular: boolean;
  icon: string;
}

interface LeadPackagesTabProps {
  userId: string;
  currentLeads: number;
  onLeadsUpdate: (newLeads: number) => void;
}

const LeadPackagesTab: React.FC<LeadPackagesTabProps> = ({ 
  userId, 
  currentLeads, 
  onLeadsUpdate: _onLeadsUpdate 
}) => {
  const [packages, setPackages] = useState<LeadPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/lead-packages');
      const data = await response.json();
      
      if (data.success) {
        setPackages(data.packages);
      } else {
        console.error('Erro ao carregar pacotes:', data.message);
      }
    } catch (error) {
      console.error('Erro ao buscar pacotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageData: LeadPackage) => {
    if (!userId) {
      return;
    }

    setPurchasing(packageData.id);

    try {
      const response = await fetch('/api/lead-packages/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          packageId: packageData.id,
          leads: packageData.leads
        })
      });

      const data = await response.json();

      if (data.success && data.checkout_url) {
        window.open(data.checkout_url, '_blank');
      } else {
        console.error('Erro ao processar compra:', data.message);
      }
    } catch (error) {
      console.error('Erro na compra:', error);
    } finally {
      setPurchasing(null);
    }
  };

  const getPackageIcon = (icon: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      '📊': <Zap className="w-6 h-6" />,
      '🚀': <Rocket className="w-6 h-6" />,
      '⚡': <Sparkles className="w-6 h-6" />,
      '🎯': <Target className="w-6 h-6" />,
      '💎': <Crown className="w-6 h-6" />
    };
    return iconMap[icon] || <Zap className="w-6 h-6" />;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando pacotes...</span>
      </div>
    );
  }

  return (
    <div className="lead-packages-container space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="package-title text-3xl font-bold">
          Pacotes de Leads Extras
        </h2>
        <p className="support-text max-w-2xl mx-auto">
          Compre leads extras para suas campanhas sem comprometer sua assinatura mensal. 
          Os leads são adicionados instantaneamente ao seu saldo atual.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="support-text">
            Saldo atual: <span className="current-balance number">{currentLeads.toLocaleString()} leads</span>
          </span>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg: LeadPackage) => (
          <Card 
            key={pkg.id} 
            className={`lead-package-card package-gradient-${pkg.leads} ${pkg.popular ? 'popular' : ''} ${
              purchasing === pkg.id ? 'package-loading' : ''
            }`}
          >
            {pkg.popular && (
              <div className="popular-badge absolute top-0 right-0 px-3 py-1 text-xs font-semibold rounded-bl-lg">
                MAIS POPULAR
              </div>
            )}
            
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="package-icon p-3 rounded-full text-white">
                  {getPackageIcon(pkg.icon)}
                </div>
                <Badge variant="secondary" className="leads-badge text-xs">
                  {pkg.leads.toLocaleString()} leads
                </Badge>
              </div>
              
              <CardTitle className="package-title text-xl font-bold">
                {pkg.name}
              </CardTitle>
              
              <p className="support-text text-sm">
                {pkg.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="package-price text-3xl font-bold">
                  {pkg.price_formatted}
                </div>
                <div className="support-text text-sm">
                  Pagamento único
                </div>
              </div>

              <Button 
                onClick={() => handlePurchase(pkg)}
                disabled={purchasing === pkg.id}
                className="package-button w-full text-white font-semibold"
              >
                {purchasing === pkg.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    Comprar Agora
                    <span className="ml-2 text-xs opacity-80">
                      +{pkg.leads.toLocaleString()}
                    </span>
                  </>
                )}
              </Button>

              <div className="support-text text-center text-xs">
                Leads adicionados instantaneamente
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Section */}
      <Card className="info-section">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <CheckCircle className="info-icon w-8 h-8 text-green-500 mx-auto" />
              <h3 className="package-title font-semibold">Pagamento Seguro</h3>
              <p className="support-text text-sm">
                Processado pelo Perfect Pay com segurança total
              </p>
            </div>
            <div className="space-y-2">
              <Zap className="info-icon w-8 h-8 text-blue-500 mx-auto" />
              <h3 className="package-title font-semibold">Entrega Instantânea</h3>
              <p className="support-text text-sm">
                Leads adicionados ao seu saldo imediatamente
              </p>
            </div>
            <div className="space-y-2">
              <Target className="info-icon w-8 h-8 text-purple-500 mx-auto" />
              <h3 className="package-title font-semibold">Sem Recorrência</h3>
              <p className="support-text text-sm">
                Compra única, sem cobranças mensais
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadPackagesTab;
