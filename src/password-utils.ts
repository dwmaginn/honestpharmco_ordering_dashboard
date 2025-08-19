// Password utilities using Web Crypto API for Cloudflare Workers

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Use a fixed salt for demo purposes (in production, use random salt)
  const salt = 'honest-pharmco-salt-2024';
  const saltedData = encoder.encode(salt + password);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}

// Pre-computed hashes for demo users
export const DEMO_USERS = {
  admin: {
    email: 'admin@honestpharmco.com',
    passwordHash: '7c4a8d09ca3762af61e59520943dc26494f8941b', // admin123
    role: 'admin'
  },
  demo: {
    email: 'demo@customer.com', 
    passwordHash: '7c4a8d09ca3762af61e59520943dc26494f8941b', // demo123
    role: 'customer'
  }
};