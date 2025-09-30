require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPlanMapping() {
  console.log('🔍 ===== VERIFICANDO MAPEAMENTO DE PLANOS =====\n');

  try {
    // 1. Buscar todos os planos
    console.log('1️⃣ Buscando todos os planos...');
    const { data: plans, error: plansError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_cents', { ascending: true });

    if (plansError) {
      console.error('❌ Erro ao buscar planos:', plansError.message);
      return;
    }

    console.log(`📊 Planos encontrados: ${plans.length}`);
    plans.forEach((plan, index) => {
      console.log(`\n📋 Plano ${index + 1}:`);
      console.log(`   ID: ${plan.id}`);
      console.log(`   Nome: ${plan.name}`);
      console.log(`   Display: ${plan.display_name}`);
      console.log(`   Preço: R$ ${(plan.price_cents / 100).toFixed(2)}`);
      console.log(`   Leads: ${plan.leads_included}`);
      console.log(`   Código Perfect Pay: ${plan.codigo_perfect_pay}`);
    });

    // 2. Verificar mapeamento atual no código
    console.log('\n2️⃣ Verificando mapeamento atual no código...');
    const currentMapping = {
      'PPLQQNGCL': '460a8b88-f828-4b18-9d42-4b8ad5333d61', // Start
      'PPLQQNGGM': 'e9004fad-85ab-41b8-9416-477e41e8bcc9', // Scale
      'PPLQQNGGN': 'a961e361-75d0-40cf-9461-62a7802a1948'  // Enterprise
    };

    console.log('📋 Mapeamento atual no código:');
    Object.entries(currentMapping).forEach(([code, uuid]) => {
      const plan = plans.find(p => p.id === uuid);
      if (plan) {
        console.log(`   ✅ ${code} -> ${uuid} (${plan.name})`);
      } else {
        console.log(`   ❌ ${code} -> ${uuid} (PLANO NÃO ENCONTRADO!)`);
      }
    });

    // 3. Verificar se os códigos estão corretos
    console.log('\n3️⃣ Verificando códigos Perfect Pay...');
    const perfectPayCodes = plans.map(p => p.codigo_perfect_pay).filter(Boolean);
    console.log('📋 Códigos Perfect Pay na base de dados:', perfectPayCodes);

    const codeMapping = {};
    plans.forEach(plan => {
      if (plan.codigo_perfect_pay) {
        codeMapping[plan.codigo_perfect_pay] = plan.id;
      }
    });

    console.log('\n📋 Mapeamento correto baseado na base de dados:');
    Object.entries(codeMapping).forEach(([code, uuid]) => {
      const plan = plans.find(p => p.id === uuid);
      console.log(`   ${code} -> ${uuid} (${plan.name})`);
    });

    // 4. Identificar problemas
    console.log('\n4️⃣ Identificando problemas...');
    const problems = [];

    // Verificar se códigos do mapeamento atual existem na base
    Object.keys(currentMapping).forEach(code => {
      if (!perfectPayCodes.includes(code)) {
        problems.push(`❌ Código ${code} no mapeamento não existe na base de dados`);
      }
    });

    // Verificar se códigos da base existem no mapeamento
    perfectPayCodes.forEach(code => {
      if (!currentMapping[code]) {
        problems.push(`❌ Código ${code} da base não está no mapeamento do código`);
      }
    });

    // Verificar se UUIDs estão corretos
    Object.entries(currentMapping).forEach(([code, uuid]) => {
      const plan = plans.find(p => p.id === uuid);
      if (!plan) {
        problems.push(`❌ UUID ${uuid} para código ${code} não existe na base`);
      } else if (plan.codigo_perfect_pay !== code) {
        problems.push(`❌ UUID ${uuid} está mapeado para código ${code} mas o plano tem código ${plan.codigo_perfect_pay}`);
      }
    });

    if (problems.length === 0) {
      console.log('✅ Nenhum problema encontrado no mapeamento!');
    } else {
      console.log('⚠️ Problemas encontrados:');
      problems.forEach(problem => console.log(`   ${problem}`));
    }

    // 5. Gerar código corrigido
    console.log('\n5️⃣ Código corrigido para o mapeamento:');
    console.log('```javascript');
    console.log('const planUuidMap = {');
    Object.entries(codeMapping).forEach(([code, uuid]) => {
      const plan = plans.find(p => p.id === uuid);
      console.log(`  '${code}': '${uuid}', // ${plan.name}`);
    });
    console.log('};');
    console.log('```');

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
}

checkPlanMapping();