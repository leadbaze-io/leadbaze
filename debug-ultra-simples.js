// SCRIPT ULTRA SIMPLES PARA DEBUG
// Cole este código no console do navegador (F12)

// Primeiro, vamos descobrir como o Supabase está configurado
console.log('🔍 Procurando Supabase na aplicação...');

// Verificar variáveis globais
console.log('📊 Variáveis globais disponíveis:');
console.log('- supabase:', typeof supabase);
console.log('- window.supabase:', typeof window.supabase);
console.log('- window.__supabase:', typeof window.__supabase);

// Verificar se há um cliente React/Vue
console.log('🔍 Procurando cliente em frameworks...');
if (window.React) {
    console.log('✅ React encontrado');
}
if (window.Vue) {
    console.log('✅ Vue encontrado');
}

// Função para testar se conseguimos acessar o Supabase
function testSupabaseAccess() {
    console.log('🧪 Testando acesso ao Supabase...');
    
    try {
        // Tentar diferentes formas de acessar
        if (typeof supabase !== 'undefined') {
            console.log('✅ Supabase encontrado como variável global');
            return supabase;
        }
        
        if (typeof window.supabase !== 'undefined') {
            console.log('✅ Supabase encontrado em window.supabase');
            return window.supabase;
        }
        
        // Tentar acessar via elementos da página
        const elements = document.querySelectorAll('*');
        for (const element of elements) {
            if (element.__reactInternalInstance || element._reactInternalFiber) {
                console.log('✅ Elemento React encontrado');
                // Tentar acessar props do React
                const props = element.__reactInternalInstance?.memoizedProps || element._reactInternalFiber?.memoizedProps;
                if (props && props.supabase) {
                    console.log('✅ Supabase encontrado nas props do React');
                    return props.supabase;
                }
            }
        }
        
        console.log('❌ Supabase não encontrado');
        return null;
        
    } catch (error) {
        console.log('❌ Erro ao procurar Supabase:', error);
        return null;
    }
}

// Função para testar autenticação
async function testAuth() {
    console.log('🔐 Testando autenticação...');
    
    const supabase = testSupabaseAccess();
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
    console.log('📊 Testando acesso às campanhas...');
    
    const supabase = testSupabaseAccess();
    if (!supabase) {
        console.log('❌ Não é possível testar sem Supabase');
        return false;
    }
    
    try {
        const user = await testAuth();
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

// Executar teste inicial
console.log('🚀 Executando teste inicial...');
testSupabaseAccess();

// Instruções
console.log('📋 INSTRUÇÕES:');
console.log('Execute: testAuth() - testCampaigns()');









