const crypto = require('crypto');

// Gerar hash do e-mail do admin
function generateEmailHash(email) {
    const salt = process.env.EMAIL_HASH_SALT || 'leadflow-blog-automation-2024';
    return crypto.createHmac('sha256', salt).update(email).digest('hex');
}

const adminEmail = 'creaty12345@gmail.com';
const emailHash = generateEmailHash(adminEmail);

console.log('🔐 Hash do E-mail do Admin:');
console.log('📧 E-mail:', adminEmail);
console.log('🔑 Hash:', emailHash);
console.log('🧂 Salt:', process.env.EMAIL_HASH_SALT || 'leadflow-blog-automation-2024');
console.log('');
console.log('✅ Use este hash no frontend para verificação!');
