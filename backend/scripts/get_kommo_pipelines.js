/**
 * Script para buscar pipelines e statuses disponíveis no Kommo
 * Rode: node backend/scripts/get_kommo_pipelines.js
 */

const { createClient } = require('@supabase/supabase-js');
const KommoCRMService = require('../services/crm/KommoCRMService');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getPipelines() {
    try {
        console.log('🔍 Buscando integração Kommo...\n');

        // Get integration from database (use your user email or ID)
        const { data: integration, error } = await supabase
            .from('crm_integrations')
            .select('*')
            .eq('crm_provider', 'kommo')
            .eq('is_active', true)
            .single();

        if (error || !integration) {
            console.error('❌ Integração Kommo não encontrada');
            console.log('Dica: Verifique se há uma integração ativa no banco de dados');
            return;
        }

        console.log('✅ Integração encontrada!\n');

        // Create Kommo service
        const kommoService = new KommoCRMService(integration);

        // Get pipelines
        console.log('📋 Buscando pipelines e seus statuses...\n');
        const pipelines = await kommoService.getPipelines();

        console.log('\n='.repeat(60));
        console.log('📊 RESUMO:');
        console.log('='.repeat(60));
        console.log(`Total de pipelines: ${pipelines.length}\n`);

        pipelines.forEach((pipeline, idx) => {
            console.log(`${idx + 1}. ${pipeline.name}`);
            console.log(`   Pipeline ID: ${pipeline.id}`);
            console.log(`   Statuses:`);

            if (pipeline._embedded?.statuses) {
                pipeline._embedded.statuses.forEach(status => {
                    console.log(`     - ${status.name} (ID: ${status.id})`);
                });
            }
            console.log('');
        });

        console.log('='.repeat(60));
        console.log('\n💡 COMO USAR:');
        console.log('1. Encontre o pipeline "BDR" (ou similar) na lista acima');
        console.log('2. Anote o Pipeline ID e o Status ID desejado');
        console.log('3. Configure no banco de dados:\n');
        console.log('   UPDATE crm_integrations');
        console.log('   SET crm_config = jsonb_set(');
        console.log('     crm_config,');
        console.log("     '{pipeline_id}',");
        console.log('     \'"PIPELINE_ID_AQUI"\'');
        console.log('   )');
        console.log("   WHERE crm_provider = 'kommo' AND is_active = true;");
        console.log('');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error(error);
    }
}

getPipelines();
