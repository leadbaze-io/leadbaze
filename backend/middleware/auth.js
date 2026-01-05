const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Middleware para autenticar requisições via JWT do Supabase
 */
async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Token de autenticação não fornecido'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer '

        // Verificar token com Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Token inválido ou expirado'
            });
        }

        // Adicionar usuário ao request
        req.user = user;
        next();

    } catch (error) {
        console.error('❌ Erro na autenticação:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao validar autenticação'
        });
    }
}

module.exports = {
    authenticateToken
};
