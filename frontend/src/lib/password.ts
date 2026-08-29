import bcrypt from "bcryptjs";

// Node.js runtime only (route handlers) — bcryptjs work factor 12.
const SALT_ROUNDS = 12;

// A fixed, precomputed hash with no matching plaintext. Used to run a dummy comparison when a
// login is attempted for an email that doesn't exist, so the response takes roughly the same
// time whether or not the account is real — this avoids a user-enumeration timing side channel.
export const DUMMY_PASSWORD_HASH = "$2b$12$sEA3LG9bFlM7KdkTAhNj3euP52TbCj8998I1Q6OZ3iVTcuEx1RoLC";

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
