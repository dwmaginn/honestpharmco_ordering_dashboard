// Test authentication by computing the correct password hashes

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = 'honest-pharmco-salt-2024';
  const saltedData = encoder.encode(salt + password);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

async function main() {
  const adminHash = await hashPassword('admin123');
  const demoHash = await hashPassword('demo123');
  
  console.log('Password hashes for Web Crypto API:');
  console.log('admin123 hash:', adminHash);
  console.log('demo123 hash:', demoHash);
  
  console.log('\nSQL commands to update database:');
  console.log(`UPDATE users SET password_hash = '${adminHash}' WHERE email = 'admin@honestpharmco.com';`);
  console.log(`UPDATE users SET password_hash = '${demoHash}' WHERE email = 'demo@customer.com';`);
}

main();