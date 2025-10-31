// SCRIPT SIMPLES PARA DEBUG DO DISPARADOR
// Cole este código no console do navegador (F12)

// Testar autenticação
async function testAuth() {
    console.log('🔍 Testando autenticação...');
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.log('❌ ERRO na autenticação:', error);
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
        console.log('❌ ERRO inesperado:', error);
        return false;
    }
}

// Testar acesso às campanhas
async function testCampaigns() {
    console.log('🔍 Testando acesso às campanhas...');
    try {
        const user = await testAuth();
        if (!user) return false;
        
        const { data: campaigns, error } = await supabase
            .from('bulk_campaigns')
            .select('*')
            .eq('user_id', user.id);
        
        if (error) {
            console.log('❌ ERRO ao buscar campanhas:', error);
            return false;
        }
        
        console.log('✅ Campanhas encontradas:', campaigns.length);
        console.log('📊 Dados:', campaigns);
        return campaigns;
    } catch (error) {
        console.log('❌ ERRO inesperado:', error);
        return false;
    }
}

// Testar criação de campanha
async function testCreate() {
    console.log('🔍 Testando criação de campanha...');
    try {
        const user = await testAuth();
        if (!user) return false;
        
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
            console.log('❌ ERRO ao criar campanha:', error);
            return false;
        }
        
        console.log('✅ Campanha criada:', newCampaign);
        return newCampaign;
    } catch (error) {
        console.log('❌ ERRO inesperado:', error);
        return false;
    }
}

// Executar todos os testes
async function runTests() {
    console.log('🚀 INICIANDO TESTES...');
    await testAuth();
    await testCampaigns();
    await testCreate();
    console.log('🏁 TESTES CONCLUÍDOS');
}

// Instruções
console.log('📋 INSTRUÇÕES:');
console.log('Execute: testAuth() - testCampaigns() - testCreate() - runTests()');


















