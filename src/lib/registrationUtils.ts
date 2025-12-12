import { supabase } from './supabaseClient';

/**
 * Aguarda inteligentemente a criação do perfil do usuário no banco
 * Usa polling com backoff ao invés de delay fixo
 * 
 * @param userId - ID do usuário do Supabase Auth
 * @param maxAttempts - Número máximo de tentativas (padrão: 10)
 * @param initialDelay - Delay inicial em ms (padrão: 200ms)
 * @returns true se perfil foi criado, false se timeout
 */
export async function waitForUserCreation(
    userId: string,
    maxAttempts: number = 10,
    initialDelay: number = 200
): Promise<boolean> {
    let delay = initialDelay;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            // Verificar se perfil existe
            const { data } = await supabase
                .from('user_profiles')
                .select('user_id')
                .eq('user_id', userId)
                .maybeSingle();

            if (data) {
                console.log(`✅ Perfil encontrado após ${attempt + 1} tentativas (~${delay * attempt}ms)`);
                return true;
            }

            // Se não encontrou, aguardar antes de tentar novamente
            if (attempt < maxAttempts - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
                // Backoff exponencial: 200ms, 400ms, 800ms, etc (máx 2s)
                delay = Math.min(delay * 2, 2000);
            }
        } catch (err) {
            console.warn(`⚠️ Erro ao verificar perfil (tentativa ${attempt + 1}):`, err);
        }
    }

    console.warn(`⏰ Timeout ao aguardar criação do perfil após ${maxAttempts} tentativas`);
    return false;
}

/**
 * Cria perfil do usuário com retry automático em caso de erro de foreign key
 * 
 * @param userId - ID do usuário
 * @param profileData - Dados do perfil completo
 * @param maxRetries - Número máximo de retries (padrão: 1)
 * @returns Resultado da operação RPC
 */
export async function createProfileWithRetry(
    userId: string,
    profileData: Record<string, any>,
    maxRetries: number = 1
): Promise<{ data: any; error: any }> {
    const rpcParams = {
        p_user_id: userId,
        p_tax_type: profileData.tax_type,
        p_full_name: profileData.full_name,
        p_email: profileData.email,
        p_phone: profileData.phone,
        p_billing_street: profileData.billing_street,
        p_billing_number: profileData.billing_number,
        p_billing_neighborhood: profileData.billing_neighborhood,
        p_billing_city: profileData.billing_city,
        p_billing_state: profileData.billing_state,
        p_billing_zip_code: profileData.billing_zip_code,
        p_cpf: profileData.cpf,
        p_cnpj: profileData.cnpj,
        p_birth_date: profileData.birth_date,
        p_company_name: profileData.company_name,
        p_billing_complement: profileData.billing_complement,
        p_billing_country: 'BR',
        p_accepted_payment_methods: profileData.accepted_payment_methods,
        p_billing_cycle: profileData.billing_cycle,
        p_auto_renewal: profileData.auto_renewal,
        p_lgpd_consent: profileData.lgpd_consent,
        p_lgpd_consent_ip: profileData.lgpd_consent_ip,
        p_lgpd_consent_user_agent: profileData.lgpd_consent_user_agent
    };

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const { data, error } = await supabase.rpc('create_user_profile', rpcParams);

            // Sucesso!
            if (!error) {
                console.log(`✅ Perfil criado/atualizado com sucesso (tentativa ${attempt + 1})`);
                return { data, error: null };
            }

            // Se não é erro de FK, não adianta retry
            if (error.code !== '23503' || !error.message.includes('user_id')) {
                console.error(`❌ Erro ao criar perfil (não é FK):`, error);
                return { data: null, error };
            }

            // Se ainda temos retries, aguardar e tentar novamente
            if (attempt < maxRetries) {
                console.log(`🔄 Erro de FK - aguardando 1s antes de retry...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                console.error(`❌ Falha após ${attempt + 1} tentativas:`, error);
                return { data: null, error };
            }
        } catch (err: any) {
            console.error(`❌ Exceção ao criar perfil:`, err);
            return { data: null, error: err };
        }
    }

    // Não deveria chegar aqui, mas TypeScript exige
    return { data: null, error: new Error('Unexpected retry loop exit') };
}
