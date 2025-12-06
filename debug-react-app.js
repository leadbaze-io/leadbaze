// SCRIPT DIRETO PARA APLICAÇÕES REACT/VUE
// Cole este código no console do navegador (F12)

// Função para encontrar o Supabase em aplicações React/Vue
function findSupabaseInReactApp() {
    console.log('🔍 Procurando Supabase em aplicação React/Vue...');
    
    // Método 1: Procurar em elementos React
    const elements = document.querySelectorAll('*');
    for (const element of elements) {
        try {
            // Verificar se é um elemento React
            if (element._reactInternalFiber) {
                const fiber = element._reactInternalFiber;
                
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
    
    // Método 2: Procurar em variáveis globais
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
async function testAuthReact() {
    console.log('🔐 Testando autenticação...');
    
    const supabase = findSupabaseInReactApp();
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
async function testCampaignsReact() {
    console.log('📊 Testando campanhas...');
    
    const supabase = findSupabaseInReactApp();
    if (!supabase) {
        console.log('❌ Supabase não encontrado');
        return false;
    }
    
    try {
        const user = await testAuthReact();
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
async function testCreateReact() {
    console.log('📝 Testando criação...');
    
    const supabase = findSupabaseInReactApp();
    if (!supabase) {
        console.log('❌ Supabase não encontrado');
        return false;
    }
    
    try {
        const user = await testAuthReact();
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
findSupabaseInReactApp();

// Instruções
console.log('📋 INSTRUÇÕES:');
console.log('Execute: testAuthReact() - testCampaignsReact() - testCreateReact()');






















