require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Debug detalhado da função SQL...');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debugFunction() {
    try {
        // 1. Verificar se há triggers na tabela
        console.log('🔍 Verificando triggers na tabela n8n_blog_queue...');
        const { data: triggers, error: triggerError } = await supabase
            .from('information_schema.triggers')
            .select('*')
            .eq('event_object_table', 'n8n_blog_queue');
        
        if (triggerError) {
            console.error('❌ Erro ao verificar triggers:', triggerError);
        } else {
            console.log('📋 Triggers encontrados:', JSON.stringify(triggers, null, 2));
        }

        // 2. Verificar se há funções relacionadas
        console.log('🔍 Verificando funções relacionadas...');
        const { data: functions, error: funcError } = await supabase
            .from('information_schema.routines')
            .select('routine_name, routine_definition')
            .ilike('routine_definition', '%n8n_blog_queue%');
        
        if (funcError) {
            console.error('❌ Erro ao verificar funções:', funcError);
        } else {
            console.log('📋 Funções relacionadas:', JSON.stringify(functions, null, 2));
        }

        // 3. Verificar a estrutura da tabela
        console.log('🔍 Verificando estrutura da tabela...');
        const { data: columns, error: colError } = await supabase
            .from('information_schema.columns')
            .select('*')
            .eq('table_name', 'n8n_blog_queue');
        
        if (colError) {
            console.error('❌ Erro ao verificar colunas:', colError);
        } else {
            console.log('📋 Colunas da tabela:', JSON.stringify(columns, null, 2));
        }

        // 4. Testar a função com logs detalhados
        console.log('🚀 Testando função com logs detalhados...');
        const { data, error } = await supabase.rpc('process_n8n_blog_queue');
        
        if (error) {
            console.error('❌ Erro na função:', error);
        } else {
            console.log('✅ Resultado da função:', JSON.stringify(data, null, 2));
        }

    } catch (err) {
        console.error('💥 Erro geral:', err);
    }
}

debugFunction();
