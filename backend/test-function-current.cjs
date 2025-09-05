require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Testando função atual no Supabase...');
console.log('🌐 SUPABASE_URL:', process.env.SUPABASE_URL ? 'OK' : '❌ Não definida');
console.log('🔑 SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : '❌ Não definida');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testFunction() {
    try {
        console.log('🚀 Chamando process_n8n_blog_queue()...');
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

testFunction();
