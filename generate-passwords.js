import bcrypt from 'bcryptjs';

// Generate password hashes for seed data
async function generateHashes() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const demoHash = await bcrypt.hash('demo123', 10);
  
  console.log('Admin password hash (admin123):', adminHash);
  console.log('Demo password hash (demo123):', demoHash);
  
  console.log('\nUpdate seed.sql with these hashes:');
  console.log(`Admin: '${adminHash}'`);
  console.log(`Demo: '${demoHash}'`);
}

generateHashes();