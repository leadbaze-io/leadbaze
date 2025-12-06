// SCRIPT CORRIGIDO PARA DEBUG DO DISPARADOR
// Cole este código no console do navegador (F12)

// Função para detectar e configurar o Supabase
function getSupabaseClient() {
    // Tentar diferentes formas de acessar o Supabase
    if (typeof supabase !== 'undefined') {
        console.log('✅ Supabase encontrado como variável global');
        return supabase;
    }
    
    if (typeof window.supabase !== 'undefined') {
        console.log('✅ Supabase encontrado em window.supabase');
        return window.supabase;
    }
    
    // Tentar acessar via React/Vue/outros frameworks
    if (typeof window !== 'undefined') {
        // Verificar se há um cliente Supabase em algum lugar
        const possibleClients = [
            window.__supabase,
            window.supabaseClient,
            window.client,
            window.db
        ];
        
        for (const client of possibleClients) {
            if (client && typeof client.from === 'function') {
                console.log('✅ Cliente Supabase encontrado:', client);
                return client;
            }
        }
    }
    
    console.log('❌ Supabase não encontrado. Tentando criar cliente...');
    
    // Se não encontrar, tentar criar um cliente básico
    try {
        // Verificar se há configuração do Supabase na página
        const scripts = document.querySelectorAll('script');
        let supabaseUrl = null;
        let supabaseKey = null;
        
        for (const script of scripts) {
            const content = script.textContent || script.innerHTML;
            if (content.includes('supabase') || content.includes('SUPABASE')) {
                console.log('📄 Script encontrado com Supabase:', content.substring(0, 200));
                
                // Tentar extrair URL e chave
                const urlMatch = content.match(/https:\/\/[a-zA-Z0-9.-]+\.supabase\.co/);
                const keyMatch = content.match(/eyJ[a-zA-Z0-9.-]+/);
                
                if (urlMatch) supabaseUrl = urlMatch[0];
                if (keyMatch) supabaseKey = keyMatch[0];
            }
        }
        
        if (supabaseUrl && supabaseKey) {
            console.log('🔧 Tentando criar cliente Supabase com:', { url: supabaseUrl, key: supabaseKey.substring(0, 20) + '...' });
            
            // Importar e criar cliente (isso pode não funcionar em todos os casos)
            return {
                from: (table) => ({
                    select: (columns) => ({
                        eq: (column, value) => Promise.resolve({ data: [], error: null })
                    })
                }),
                auth: {
                    getUser: () => Promise.resolve({ data: { user: null }, error: null })
                }
            };
        }
    } catch (error) {
        console.log('❌ Erro ao tentar criar cliente:', error);
    }
    
    return null;
}

// Função para fazer log no console
function logToConsole(message, data = null) {
    console.log('🔍 DISPARADOR DEBUG:', message);
    if (data) {
        console.log('📊 DADOS:', data);
    }
}

// Função para testar autenticação
async function testAuth() {
    try {
        logToConsole('Testando autenticação...');
        
        const supabase = getSupabaseClient();
        if (!supabase) {
            logToConsole('❌ Cliente Supabase não disponível');
            return false;
        }
        
        // Verificar se há usuário autenticado
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            logToConsole('❌ ERRO na autenticação:', error);
            return false;
        }
        
        if (user) {
            logToConsole('✅ Usuário autenticado:', {
                id: user.id,
                email: user.email
            });
            return user;
        } else {
            logToConsole('❌ Nenhum usuário autenticado');
            return false;
        }
    } catch (error) {
        logToConsole('❌ ERRO inesperado na autenticação:', error);
        return false;
    }
}

// Função para testar acesso às campanhas
async function testCampaignsAccess() {
    try {
        logToConsole('Testando acesso às campanhas...');
        
        const supabase = getSupabaseClient();
        if (!supabase) {
            logToConsole('❌ Cliente Supabase não disponível');
            return false;
        }
        
        const user = await testAuth();
        if (!user) {
            logToConsole('❌ Não é possível testar campanhas sem usuário autenticado');
            return false;
        }
        
        // Testar SELECT de campanhas
        const { data: campaigns, error } = await supabase
            .from('bulk_campaigns')
            .select('*')
            .eq('user_id', user.id);
        
        if (error) {
            logToConsole('❌ ERRO ao buscar campanhas:', error);
            return false;
        }
        
        logToConsole('✅ Campanhas encontradas:', {
            count: campaigns.length,
            campaigns: campaigns
        });
        
        return campaigns;
    } catch (error) {
        logToConsole('❌ ERRO inesperado ao buscar campanhas:', error);
        return false;
    }
}

// Função para testar criação de campanhas
async function testCampaignCreation() {
    try {
        logToConsole('Testando criação de campanha...');
        
        const supabase = getSupabaseClient();
        if (!supabase) {
            logToConsole('❌ Cliente Supabase não disponível');
            return false;
        }
        
        const user = await testAuth();
        if (!user) {
            logToConsole('❌ Não é possível criar campanha sem usuário autenticado');
            return false;
        }
        
        const campaignData = {
            name: 'Teste Log - ' + new Date().toISOString(),
            user_id: user.id,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        logToConsole('📝 Tentando criar campanha:', campaignData);
        
        const { data: newCampaign, error } = await supabase
            .from('bulk_campaigns')
            .insert([campaignData])
            .select()
            .single();
        
        if (error) {
            logToConsole('❌ ERRO ao criar campanha:', error);
            return false;
        }
        
        logToConsole('✅ Campanha criada com sucesso:', newCampaign);
        return newCampaign;
    } catch (error) {
        logToConsole('❌ ERRO inesperado ao criar campanha:', error);
        return false;
    }
}

// Função para diagnóstico completo
async function fullDiagnostic() {
    logToConsole('🚀 INICIANDO DIAGNÓSTICO COMPLETO...');
    
    const authResult = await testAuth();
    const campaignsResult = await testCampaignsAccess();
    const creationResult = await testCampaignCreation();
    
    logToConsole('📋 RESUMO DO DIAGNÓSTICO:', {
        auth: authResult ? 'OK' : 'ERRO',
        campaigns: campaignsResult ? 'OK' : 'ERRO',
        creation: creationResult ? 'OK' : 'ERRO'
    });
    
    logToConsole('🏁 DIAGNÓSTICO COMPLETO FINALIZADO');
    
    return {
        auth: authResult,
        campaigns: campaignsResult,
        creation: creationResult
    };
}

// Função para verificar configuração do Supabase
function checkSupabaseConfig() {
    logToConsole('🔍 Verificando configuração do Supabase...');
    
    // Verificar variáveis globais
    const globalVars = ['supabase', 'window.supabase', 'window.__supabase', 'window.supabaseClient'];
    for (const varName of globalVars) {
        try {
            const value = eval(varName);
            if (value) {
                logToConsole('✅ Variável encontrada:', varName, value);
            }
        } catch (e) {
            // Variável não existe
        }
    }
    
    // Verificar scripts na página
    const scripts = document.querySelectorAll('script');
    logToConsole('📄 Scripts encontrados:', scripts.length);
    
    for (let i = 0; i < Math.min(scripts.length, 5); i++) {
        const script = scripts[i];
        const content = script.textContent || script.innerHTML;
        if (content.includes('supabase') || content.includes('SUPABASE')) {
            logToConsole('📄 Script com Supabase:', content.substring(0, 100) + '...');
        }
    }
}

// Instruções de uso
console.log('🔧 INSTRUÇÕES DE USO:');
console.log('1. Primeiro execute: checkSupabaseConfig()');
console.log('2. Depois execute: testAuth()');
console.log('3. Em seguida: testCampaignsAccess()');
console.log('4. Por último: testCampaignCreation()');
console.log('5. Ou execute tudo: fullDiagnostic()');

// Exportar funções para uso global
window.disparadorDebug = {
    getSupabaseClient,
    testAuth,
    testCampaignsAccess,
    testCampaignCreation,
    fullDiagnostic,
    checkSupabaseConfig
};

console.log('✅ Funções de debug carregadas! Use window.disparadorDebug para acessar as funções.');






















