#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });
const PerfectPayService = require('./services/perfectPayService');

const perfectPayService = new PerfectPayService();

async function debugApiRoute() {
    console.log('🔍 DEBUGANDO ROTA DA API');
    console.log('========================');

    try {
        console.log('\n1️⃣ Testando consulta direta...');
        const { data: packages, error } = await perfectPayService.supabase
            .from('lead_packages')
            .select('*')
            .eq('active', true)
            .order('leads', { ascending: true });

        if (error) {
            console.error('❌ Erro na consulta:', error.message);
            return;
        }

        console.log(`✅ Consulta direta retornou ${packages.length} pacotes:`);
        packages.forEach(pkg => {
            const price = (pkg.price_cents / 100).toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
            });
            console.log(`   - ${pkg.name}: ${price} (${pkg.leads} leads)`);
        });

        console.log('\n2️⃣ Testando formatação da resposta...');
        const formattedPackages = packages.map(pkg => ({
            id: pkg.package_id,
            name: pkg.name,
            leads: pkg.leads,
            price_cents: pkg.price_cents,
            price_formatted: `R$ ${(pkg.price_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            description: pkg.description,
            popular: pkg.popular,
            icon: pkg.icon,
            perfect_pay_code: pkg.perfect_pay_code,
            checkout_url: pkg.checkout_url
        }));

        console.log(`✅ Formatação retornou ${formattedPackages.length} pacotes:`);
        formattedPackages.forEach(pkg => {
            console.log(`   - ${pkg.name}: ${pkg.price_formatted} (${pkg.leads} leads)`);
        });

        console.log('\n3️⃣ Testando resposta final...');
        const finalResponse = {
            success: true,
            packages: formattedPackages
        };

        console.log(`✅ Resposta final: ${finalResponse.packages.length} pacotes`);
        console.log('📋 Resposta JSON:');
        console.log(JSON.stringify(finalResponse, null, 2));

    } catch (error) {
        console.error('❌ Erro inesperado:', error.message);
    } finally {
        console.log('\n✅ Debug concluído.');
    }
}

debugApiRoute();


