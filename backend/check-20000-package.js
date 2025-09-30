#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Erro: Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check20000Package() {
    console.log('🔍 VERIFICANDO PACOTE DE 20.000 LEADS');
    console.log('=====================================');

    try {
        // 1. Verificar todos os pacotes
        console.log('\n1️⃣ Verificando todos os pacotes...');
        const { data: allPackages, error: allError } = await supabase
            .from('lead_packages')
            .select('*')
            .order('leads', { ascending: true });

        if (allError) {
            console.error('❌ Erro ao buscar pacotes:', allError.message);
            return;
        }

        console.log(`📦 Total de pacotes: ${allPackages.length}`);
        allPackages.forEach(pkg => {
            const price = (pkg.price_cents / 100).toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
            });
            console.log(`   - ${pkg.name}: ${price} (${pkg.leads} leads) - Ativo: ${pkg.active}`);
        });

        // 2. Verificar pacotes ativos
        console.log('\n2️⃣ Verificando pacotes ativos...');
        const { data: activePackages, error: activeError } = await supabase
            .from('lead_packages')
            .select('*')
            .eq('active', true)
            .order('leads', { ascending: true });

        if (activeError) {
            console.error('❌ Erro ao buscar pacotes ativos:', activeError.message);
            return;
        }

        console.log(`📦 Pacotes ativos: ${activePackages.length}`);
        activePackages.forEach(pkg => {
            const price = (pkg.price_cents / 100).toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
            });
            console.log(`   - ${pkg.name}: ${price} (${pkg.leads} leads)`);
        });

        // 3. Verificar especificamente o pacote de 20.000
        console.log('\n3️⃣ Verificando pacote de 20.000 leads...');
        const { data: package20000, error: pkg20000Error } = await supabase
            .from('lead_packages')
            .select('*')
            .eq('package_id', 'leads_20000')
            .single();

        if (pkg20000Error) {
            console.error('❌ Pacote de 20.000 leads não encontrado:', pkg20000Error.message);
        } else {
            const price = (package20000.price_cents / 100).toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
            });
            console.log('✅ Pacote de 20.000 leads encontrado:');
            console.log(`   Nome: ${package20000.name}`);
            console.log(`   Leads: ${package20000.leads}`);
            console.log(`   Preço: ${price}`);
            console.log(`   Ativo: ${package20000.active}`);
            console.log(`   Código Perfect Pay: ${package20000.perfect_pay_code}`);
        }

        // 4. Verificar se há pacotes com preço 0
        console.log('\n4️⃣ Verificando pacotes com preço 0...');
        const { data: zeroPricePackages, error: zeroError } = await supabase
            .from('lead_packages')
            .select('*')
            .eq('price_cents', 0);

        if (zeroError) {
            console.error('❌ Erro ao buscar pacotes com preço 0:', zeroError.message);
        } else {
            console.log(`📦 Pacotes com preço 0: ${zeroPricePackages.length}`);
            zeroPricePackages.forEach(pkg => {
                console.log(`   - ${pkg.name}: R$ 0,00 (${pkg.leads} leads)`);
            });
        }

    } catch (error) {
        console.error('❌ Erro inesperado:', error.message);
    } finally {
        console.log('\n✅ Verificação concluída.');
    }
}

check20000Package();