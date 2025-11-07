// SCRIPT PARA ACESSAR SUPABASE ATRAVÉS DA APLICAÇÃO
// Cole este código no console do navegador (F12)

// Função para encontrar o Supabase na aplicação
function findSupabaseInApp() {
    console.log('🔍 Procurando Supabase na aplicação...');
    
    // Método 1: Procurar em elementos React
    const reactElements = document.querySelectorAll('*');
    for (const element of reactElements) {
        try {
            // Verificar se é um elemento React
            if (element._reactInternalFiber || element.__reactInternalInstance) {
                const fiber = element._reactInternalFiber || element.__reactInternalInstance;
                
                // Procurar nas props
                if (fiber.memoizedProps) {
                    const props = fiber.memoizedProps;
                    if (props.supabase) {
                        console.log('✅ Supabase encontrado nas props React');
                        return props.supabase;
                    }
                }
                
                // Procurar no state
                if (fiber.memoizedState) {
                    const state = fiber.memoizedState;
                    if (state.supabase) {
                        console.log('✅ Supabase encontrado no state React');
                        return state.supabase;
                    }
                }
            }
        } catch (e) {
            // Ignorar erros de acesso
        }
    }
    
    // Método 2: Procurar em variáveis globais do window
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
    
    // Método 3: Procurar em scripts
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
        const content = script.textContent || script.innerHTML;
        if (content.includes('supabase') || content.includes('SUPABASE')) {
            console.log('📄 Script com Supabase encontrado');
            console.log('Conteúdo:', content.substring(0, 200) + '...');
        }
    }
    
    console.log('❌ Supabase não encontrado na aplicação');
    return null;
}

// Função para testar autenticação usando o Supabase encontrado
async function testAuthWithFoundSupabase() {
    console.log('🔐 Testando autenticação com Supabase encontrado...');
    
    const supabase = findSupabaseInApp();
    if (!supabase) {
        console.log('❌ Não é possível testar sem Supabase');
        return false;
    }
    
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            console.log('❌ Erro na autenticação:', error);
            return false;
        }
        
        if (user) {
            console.log('✅ Usuário autenticado:', {
                id: user.id,
                email: user.email
            });
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

// Função para testar campanhas usando o Supabase encontrado
async function testCampaignsWithFoundSupabase() {
    console.log('📊 Testando acesso às campanhas...');
    
    const supabase = findSupabaseInApp();
    if (!supabase) {
        console.log('❌ Não é possível testar sem Supabase');
        return false;
    }
    
    try {
        const user = await testAuthWithFoundSupabase();
        if (!user) {
            console.log('❌ Não é possível testar campanhas sem usuário');
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

// Função para testar criação de campanha
async function testCreateCampaignWithFoundSupabase() {
    console.log('📝 Testando criação de campanha...');
    
    const supabase = findSupabaseInApp();
    if (!supabase) {
        console.log('❌ Não é possível testar sem Supabase');
        return false;
    }
    
    try {
        const user = await testAuthWithFoundSupabase();
        if (!user) {
            console.log('❌ Não é possível criar campanha sem usuário');
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
            console.log('❌ Erro ao criar campanha:', error);
            return false;
        }
        
        console.log('✅ Campanha criada:', newCampaign);
        return newCampaign;
    } catch (error) {
        console.log('❌ Erro inesperado:', error);
        return false;
    }
}

// Função para diagnóstico completo
async function fullDiagnosticWithFoundSupabase() {
    console.log('🚀 INICIANDO DIAGNÓSTICO COMPLETO...');
    
    const authResult = await testAuthWithFoundSupabase();
    const campaignsResult = await testCampaignsWithFoundSupabase();
    const creationResult = await testCreateCampaignWithFoundSupabase();
    
    console.log('📋 RESUMO DO DIAGNÓSTICO:', {
        auth: authResult ? 'OK' : 'ERRO',
        campaigns: campaignsResult ? 'OK' : 'ERRO',
        creation: creationResult ? 'OK' : 'ERRO'
    });
    
    console.log('🏁 DIAGNÓSTICO COMPLETO FINALIZADO');
    
    return {
        auth: authResult,
        campaigns: campaignsResult,
        creation: creationResult
    };
}

// Instruções de uso
console.log('🔧 INSTRUÇÕES DE USO:');
console.log('1. Execute: testAuthWithFoundSupabase()');
console.log('2. Execute: testCampaignsWithFoundSupabase()');
console.log('3. Execute: testCreateCampaignWithFoundSupabase()');
console.log('4. Ou execute tudo: fullDiagnosticWithFoundSupabase()');

// Exportar funções para uso global
window.disparadorDebugV2 = {
    findSupabaseInApp,
    testAuthWithFoundSupabase,
    testCampaignsWithFoundSupabase,
    testCreateCampaignWithFoundSupabase,
    fullDiagnosticWithFoundSupabase
};

console.log('✅ Funções de debug V2 carregadas! Use window.disparadorDebugV2 para acessar as funções.');




















