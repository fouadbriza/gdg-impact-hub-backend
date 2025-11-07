import crypto from 'crypto';

export function generateResetToken() {
  // generated token
  const rawToken = crypto.randomBytes(32).toString('hex'); 
  // hashed to be stored in DB
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
}


