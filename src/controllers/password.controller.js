import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/hash.js';
import { generateResetToken } from '../utils/token.js';
import { sendResetEmail } from '../services/email.service.js';
import crypto from 'crypto';

const prisma = new PrismaClient();
const RESET_TOKEN_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes

export async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required.' });

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  const { rawToken, hashedToken } = generateResetToken();
  const expires = new Date(Date.now() + RESET_TOKEN_EXPIRATION_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expires,
    },
  });

  // Generating the URL that the user will click on
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

  try {
    await sendResetEmail(email, resetUrl);
    return res.json({ message: 'Reset email sent successfully.' });
  } catch (err) {
    // rollback token if email sending fails
    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: null, resetPasswordExpires: null },
    });
    console.error('SendGrid error:', err);
    if (err.response) {
      console.error('Body:', err.response.body);
    }
    return res.status(500).json({ error: 'Unable to send email. Please try again later.' });
  }
}

export async function resetPassword(req, res) {
  const { token, email, newPassword } = req.body;
  if (!token || !email || !newPassword)
    return res.status(400).json({ error: 'token, email and newPassword required.' });

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { gte: new Date() },
    },
  });

  if (!user) return res.status(400).json({ error: 'Token invalide or expired.' });

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // updatepassword and delet token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return res.json({ message: 'Password successfully reset.' });
}
