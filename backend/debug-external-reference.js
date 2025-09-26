// Simular a função extractInfoFromReference
function extractInfoFromReference(externalReference) {
  if (!externalReference) return { operationType: null, userId: null, planId: null };
  
  // Formato: operationType_userId_planId_timestamp
  const parts = externalReference.split('_');
  return {
    operationType: parts.length >= 4 ? parts[0] : 'new',
    userId: parts.length >= 4 ? parts[1] : null,
    planId: parts.length >= 4 ? parts[2] : null
  };
}

// Testar com o external_reference do último webhook
const externalReference = 'new_39dc6c62-6dea-4222-adb5-7075fd704189_1_1758755895723';

console.log('🔍 ===== DEBUG: EXTERNAL REFERENCE =====');
console.log('External Reference:', externalReference);
console.log('Parts:', externalReference.split('_'));

const result = extractInfoFromReference(externalReference);
console.log('Resultado:', result);

console.log('\n📋 Verificações:');
console.log('✅ operationType:', result.operationType);
console.log('✅ userId:', result.userId);
console.log('✅ planId:', result.planId);
console.log('✅ userId válido:', !!result.userId);
console.log('✅ planId válido:', !!result.planId);

if (!result.userId || !result.planId) {
  console.log('\n❌ PROBLEMA: userId ou planId é null!');
} else {
  console.log('\n✅ TUDO OK: external_reference está sendo extraído corretamente!');
}




