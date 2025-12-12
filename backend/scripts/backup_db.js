const fs = require('fs');
const path = require('path');

// Tentar carregar config.env de vários locais possíveis
const pathsToTry = [
    path.join(__dirname, '../config.env'), // Se rodar de dentro de scripts/ ou via node scripts/
    path.join(process.cwd(), 'config.env'), // Se rodar da raiz backend/
    path.join(__dirname, 'config.env')
];

let configLoaded = false;
for (const p of pathsToTry) {
    if (fs.existsSync(p)) {
        console.log(`📁 Carregando config de: ${p}`);
        require('dotenv').config({ path: p });
        configLoaded = true;
        break;
    }
}

if (!configLoaded) {
    console.error('❌ Nenhum arquivo config.env encontrado.');
    // Tentar carregar padrão (.env)
    require('dotenv').config();
}

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TABLES_TO_BACKUP = [
    'user_profiles',
    'user_payment_subscriptions',
    'leads_delivery_tracking',
    'evolution_instances',
    'user_usage_limits',
    'webhook_events' // Adicionar outras tabelas se descobrir
];

async function backupTable(tableName) {
    console.log(`📦 Fazendo backup da tabela: ${tableName}...`);

    // Paginação simples para garantir que pegamos tudo (limite Supabase default é 1000)
    let allData = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
            if (error.code === '42P01') { // table does not exist
                console.warn(`⚠️ Tabela ignorada (não encontrada): ${tableName}`);
                return null;
            }
            throw new Error(`Erro ao ler ${tableName}: ${error.message}`);
        }

        if (data.length > 0) {
            allData = allData.concat(data);
            page++;
        } else {
            hasMore = false;
        }
    }

    console.log(`✅ ${tableName}: ${allData.length} registros recuperados.`);
    return allData;
}

async function runBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../supabase/backups');

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFile = path.join(backupDir, `full_backup_${timestamp}.json`);
    const backupData = {
        timestamp: new Date().toISOString(),
        tables: {}
    };

    try {
        for (const table of TABLES_TO_BACKUP) {
            const data = await backupTable(table);
            if (data) {
                backupData.tables[table] = data;
            }
        }

        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
        console.log(`\n🎉 Backup concluído com sucesso!`);
        console.log(`📁 Arquivo salvo em: ${backupFile}`);
        console.log(`📊 Tamanho total: ${(fs.statSync(backupFile).size / 1024 / 1024).toFixed(2)} MB`);

    } catch (error) {
        console.error('\n❌ Falha no backup:', error);
        process.exit(1);
    }
}

runBackup();
