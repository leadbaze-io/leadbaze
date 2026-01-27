/**
 * Script para configurar Pipeline ID no Kommo
 * Rode: node backend/scripts/configure_kommo_pipeline.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ⚙️ CONFIGURE AQUI:
const PIPELINE_ID = '12641367'; // Pipeline BDR
const STATUS_ID = null; // Deixe null para usar o status padrão do pipeline

async function configurePipeline() {
    try {
        console.log('🔧 Configurando Pipeline ID no Kommo...\n');

        // Get current integration
        const { data: integration, error: fetchError } = await supabase
            .from('crm_integrations')
            .select('*')
            .eq('crm_provider', 'kommo')
            .eq('is_active', true)
            .single();

        if (fetchError || !integration) {
            console.error('❌ Integração Kommo não encontrada');
            return;
        }

        console.log('✅ Integração encontrada:');
        console.log(`   User ID: ${integration.user_id}`);
        console.log(`   Subdomain: ${integration.crm_config?.subdomain}\n`);

        // Update crm_config with pipeline_id
        const updatedConfig = {
            ...integration.crm_config,
            pipeline_id: PIPELINE_ID
        };

        if (STATUS_ID) {
            updatedConfig.status_id = STATUS_ID;
        }

        const { data, error } = await supabase
            .from('crm_integrations')
            .update({
                crm_config: updatedConfig,
                updated_at: new Date().toISOString()
            })
            .eq('id', integration.id)
            .select()
            .single();

        if (error) {
            console.error('❌ Erro ao atualizar:', error);
            return;
        }

        console.log('✅ Pipeline configurado com sucesso!\n');
        console.log('📋 Nova configuração:');
        console.log(JSON.stringify(data.crm_config, null, 2));
        console.log('\n🎯 A partir de agora, todos os leads irão para:');
        console.log(`   Pipeline ID: ${PIPELINE_ID}`);
        if (STATUS_ID) {
            console.log(`   Status ID: ${STATUS_ID}`);
        } else {
            console.log('   Status: Primeiro status do pipeline (padrão)');
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

configurePipeline();
