// LOGS JAVASCRIPT SIMPLES PARA CONSOLE F12 - DISPARADOR
// Cole este script no console do navegador (F12) para diagnosticar problemas

// Função para fazer log no console
function logToConsole(message, data = null) {
    console.log('DISPARADOR DEBUG:', message);
    if (data) {
        console.log('DADOS:', data);
    }
}

// Função para testar autenticação
async function testAuth() {
    try {
        logToConsole('Testando autenticação...');
        
        // Verificar se há usuário autenticado
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            logToConsole('ERRO na autenticação:', error);
            return false;
        }
        
        if (user) {
            logToConsole('Usuário autenticado:', {
                id: user.id,
                email: user.email
            });
            return user;
        } else {
            logToConsole('Nenhum usuário autenticado');
            return false;
        }
    } catch (error) {
        logToConsole('ERRO inesperado na autenticação:', error);
        return false;
    }
}

// Função para testar acesso às campanhas
async function testCampaignsAccess() {
    try {
        logToConsole('Testando acesso às campanhas...');
        
        const user = await testAuth();
        if (!user) {
            logToConsole('Não é possível testar campanhas sem usuário autenticado');
            return false;
        }
        
        // Testar SELECT de campanhas
        const { data: campaigns, error } = await supabase
            .from('bulk_campaigns')
            .select('*')
            .eq('user_id', user.id);
        
        if (error) {
            logToConsole('ERRO ao buscar campanhas:', error);
            return false;
        }
        
        logToConsole('Campanhas encontradas:', {
            count: campaigns.length,
            campaigns: campaigns
        });
        
        return campaigns;
    } catch (error) {
        logToConsole('ERRO inesperado ao buscar campanhas:', error);
        return false;
    }
}

// Função para testar criação de campanhas
async function testCampaignCreation() {
    try {
        logToConsole('Testando criação de campanha...');
        
        const user = await testAuth();
        if (!user) {
            logToConsole('Não é possível criar campanha sem usuário autenticado');
            return false;
        }
        
        const campaignData = {
            name: 'Teste Log - ' + new Date().toISOString(),
            user_id: user.id,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        logToConsole('Tentando criar campanha:', campaignData);
        
        const { data: newCampaign, error } = await supabase
            .from('bulk_campaigns')
            .insert([campaignData])
            .select()
            .single();
        
        if (error) {
            logToConsole('ERRO ao criar campanha:', error);
            return false;
        }
        
        logToConsole('Campanha criada com sucesso:', newCampaign);
        return newCampaign;
    } catch (error) {
        logToConsole('ERRO inesperado ao criar campanha:', error);
        return false;
    }
}

// Função para diagnóstico completo
async function fullDiagnostic() {
    logToConsole('INICIANDO DIAGNÓSTICO COMPLETO...');
    
    const authResult = await testAuth();
    const campaignsResult = await testCampaignsAccess();
    const creationResult = await testCampaignCreation();
    
    logToConsole('RESUMO DO DIAGNÓSTICO:', {
        auth: authResult ? 'OK' : 'ERRO',
        campaigns: campaignsResult ? 'OK' : 'ERRO',
        creation: creationResult ? 'OK' : 'ERRO'
    });
    
    logToConsole('DIAGNÓSTICO COMPLETO FINALIZADO');
    
    return {
        auth: authResult,
        campaigns: campaignsResult,
        creation: creationResult
    };
}

// Função para verificar políticas RLS
async function checkRLSPolicies() {
    try {
        logToConsole('Verificando políticas RLS...');
        
        // Tentar acessar dados sem filtro (deve falhar se RLS estiver ativo)
        const { data: allCampaigns, error: allError } = await supabase
            .from('bulk_campaigns')
            .select('*');
        
        if (allError) {
            logToConsole('RLS está ativo (erro esperado):', allError.message);
        } else {
            logToConsole('RLS pode não estar ativo - acesso total permitido');
        }
        
        // Tentar acessar dados com filtro de usuário
        const user = await testAuth();
        if (user) {
            const { data: userCampaigns, error: userError } = await supabase
                .from('bulk_campaigns')
                .select('*')
                .eq('user_id', user.id);
            
            if (userError) {
                logToConsole('ERRO ao acessar campanhas do usuário:', userError);
            } else {
                logToConsole('Acesso às campanhas do usuário OK:', {
                    count: userCampaigns.length
                });
            }
        }
        
    } catch (error) {
        logToConsole('ERRO inesperado ao verificar RLS:', error);
    }
}

// Função para verificar estrutura da tabela
async function checkTableStructure() {
    try {
        logToConsole('Verificando estrutura da tabela...');
        
        const { data: structure, error } = await supabase
            .from('bulk_campaigns')
            .select('*')
            .limit(1);
        
        if (error) {
            logToConsole('ERRO ao verificar estrutura:', error);
        } else {
            logToConsole('Estrutura da tabela:', {
                columns: structure.length > 0 ? Object.keys(structure[0]) : 'Nenhum dado encontrado'
            });
        }
        
    } catch (error) {
        logToConsole('ERRO inesperado ao verificar estrutura:', error);
    }
}

// Função principal para executar todos os testes
async function runAllTests() {
    logToConsole('EXECUTANDO TODOS OS TESTES...');
    
    await testAuth();
    await testCampaignsAccess();
    await testCampaignCreation();
    await checkRLSPolicies();
    await checkTableStructure();
    
    logToConsole('TODOS OS TESTES CONCLUÍDOS');
}

// Instruções de uso
console.log('INSTRUÇÕES DE USO:');
console.log('1. Execute uma das funções:');
console.log('   testAuth()                    - Testar autenticação');
console.log('   testCampaignsAccess()         - Testar acesso às campanhas');
console.log('   testCampaignCreation()       - Testar criação de campanhas');
console.log('   fullDiagnostic()             - Diagnóstico completo');
console.log('   checkRLSPolicies()           - Verificar políticas RLS');
console.log('   checkTableStructure()        - Verificar estrutura da tabela');
console.log('   runAllTests()                - Executar todos os testes');
console.log('2. Analise os logs no console para identificar o problema');

// Exportar funções para uso global
window.disparadorDebug = {
    testAuth,
    testCampaignsAccess,
    testCampaignCreation,
    fullDiagnostic,
    checkRLSPolicies,
    checkTableStructure,
    runAllTests
};

console.log('Funções de debug carregadas! Use window.disparadorDebug para acessar as funções.');











