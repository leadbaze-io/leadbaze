// API Configuration
// IMPORTANTE: Para testar novas funcionalidades (Admin), precisamos usar o backend LOCAL
// pois o backend de produção ainda não tem as novas rotas.
const API_BASE_URL = 'http://localhost:3001';

export const apiClient = {
    get: async (endpoint: string) => {
        const { supabase } = await import('./supabaseClient');
        const { data: { session } } = await supabase.auth.getSession();

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${session?.access_token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    },

    post: async (endpoint: string, data?: any) => {
        const { supabase } = await import('./supabaseClient');
        const { data: { session } } = await supabase.auth.getSession();

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session?.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }
};
