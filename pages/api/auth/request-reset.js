import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import { sendEmail } from '../../../lib/email';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(200).json({ message: 'If the email exists, a reset link was sent.' });

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      token,
      expiresAt,
      user: { connect: { id: user.id } },
    },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your MotoMarket password',
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto">
          <h2>Reset your password</h2>
          <p>Click the link below to choose a new password. This link expires in 1 hour.</p>
          <p><a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px">Reset password</a></p>
          <p style="color:#666;font-size:12px">If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[request-reset] send failed:', err);
    return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }

  res.status(200).json({ message: 'If the email exists, a reset link was sent.' });
}
