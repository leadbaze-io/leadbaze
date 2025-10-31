// SCRIPT ULTRA SIMPLES PARA DEBUG
// Cole este código no console do navegador (F12)

// Função para encontrar o Supabase
function findSupabase() {
    console.log('🔍 Procurando Supabase...');
    
    // Procurar em variáveis globais
    const globalKeys = Object.keys(window);
    for (const key of globalKeys) {
        try {
            const value = window[key];
            if (value && typeof value === 'object' && value.from && value.auth) {
                console.log('✅ Supabase encontrado em window.' + key);
                return value;
            }
        } catch (e) {
            // Ignorar erros
        }
    }
    
    console.log('❌ Supabase não encontrado');
    return null;
}

// Função para testar autenticação
async function testAuth() {
    console.log('🔐 Testando autenticação...');
    
    const supabase = findSupabase();
    if (!supabase) {
        console.log('❌ Supabase não encontrado');
        return false;
    }
    
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            console.log('❌ Erro na autenticação:', error);
            return false;
        }
        
        if (user) {
            console.log('✅ Usuário autenticado:', user.id, user.email);
            return user;
        } else {
            console.log('❌ Nenhum usuário autenticado');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro inesperado:', error);
        return false;
    }
}

// Função para testar campanhas
async function testCampaigns() {
    console.log('📊 Testando campanhas...');
    
    const supabase = findSupabase();
    if (!supabase) {
        console.log('❌ Supabase não encontrado');
        return false;
    }
    
    try {
        const user = await testAuth();
        if (!user) {
            console.log('❌ Sem usuário autenticado');
            return false;
        }
        
        const { data: campaigns, error } = await supabase
            .from('bulk_campaigns')
            .select('*')
            .eq('user_id', user.id);
        
        if (error) {
            console.log('❌ Erro ao buscar campanhas:', error);
            return false;
        }
        
        console.log('✅ Campanhas encontradas:', campaigns.length);
        console.log('📋 Dados:', campaigns);
        return campaigns;
    } catch (error) {
        console.log('❌ Erro inesperado:', error);
        return false;
    }
}

// Função para testar criação
async function testCreate() {
    console.log('📝 Testando criação...');
    
    const supabase = findSupabase();
    if (!supabase) {
        console.log('❌ Supabase não encontrado');
        return false;
    }
    
    try {
        const user = await testAuth();
        if (!user) {
            console.log('❌ Sem usuário autenticado');
            return false;
        }
        
        const campaignData = {
            name: 'Teste Debug - ' + new Date().toISOString(),
            user_id: user.id,
            status: 'active'
        };
        
        console.log('📝 Tentando criar:', campaignData);
        
        const { data: newCampaign, error } = await supabase
            .from('bulk_campaigns')
            .insert([campaignData])
            .select()
            .single();
        
        if (error) {
            console.log('❌ Erro ao criar:', error);
            return false;
        }
        
        console.log('✅ Campanha criada:', newCampaign);
        return newCampaign;
    } catch (error) {
        console.log('❌ Erro inesperado:', error);
        return false;
    }
}

// Executar teste inicial
console.log('🚀 Executando teste inicial...');
findSupabase();

// Instruções
console.log('📋 INSTRUÇÕES:');
console.log('Execute: testAuth() - testCampaigns() - testCreate()');


















