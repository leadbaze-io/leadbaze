const { createClient } = require('@supabase/supabase-js');
const { marked } = require('marked');

const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMarkdownContent() {
    console.log('🔄 Corrigindo conteúdo Markdown...');
    
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .like('content', '%##%');
    
    if (error) {
        console.error('❌ Erro:', error);
        return;
    }
    
    console.log(`📝 Encontrados ${posts.length} posts com Markdown`);
    
    for (const post of posts) {
        const htmlContent = marked(post.content);
        
        const { error: updateError } = await supabase
            .from('blog_posts')
            .update({ content: htmlContent })
            .eq('id', post.id);
        
        if (updateError) {
            console.error(`❌ Erro ao atualizar post ${post.id}:`, updateError);
        } else {
            console.log(`✅ Post ${post.id} corrigido`);
        }
    }
    
    console.log('�� Correção concluída!');
}

fixMarkdownContent();
