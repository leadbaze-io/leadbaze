require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Erro: Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetPassword() {
    const userId = 'f20ceb6a-0e59-477c-9a85-afc39ea90afe';
    const newPassword = 'Go975432'; // Senha definida pelo usuário

    console.log(`Tentando redefinir a senha para o usuário: ${userId}...`);

    try {
        const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);

        if (userError) {
            console.error('Erro ao buscar usuário:', userError.message);
            return;
        }

        if (!user || !user.user) {
            console.error('Usuário não encontrado.');
            return;
        }

        console.log(`Usuário encontrado: ${user.user.email}`);

        const { data, error } = await supabase.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        );

        if (error) {
            console.error('Erro ao atualizar a senha:', error.message);
        } else {
            console.log('\n✅ SUCESSO!');
            console.log(`A senha do usuário ${user.user.email} foi redefinida.`);
            console.log(`Nova senha: ${newPassword}`);
            console.log('\nPor favor, faça login e altere esta senha imediatamente.');
        }

    } catch (err) {
        console.error('Erro inesperado:', err);
    }
}

resetPassword();
