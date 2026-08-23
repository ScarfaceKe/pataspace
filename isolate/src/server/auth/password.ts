import bcrypt from 'bcryptjs';

const BCRYPT_COST = Number(process.env.PATASPACE_BCRYPT_COST ?? 12);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;
  if (storedHash.startsWith('scrypt:')) {
    // Legacy hashes are intentionally not accepted in production migration mode.
    // Users with legacy hashes should reset passwords through the secure recovery flow.
    return false;
  }
  return bcrypt.compare(password, storedHash);
}
