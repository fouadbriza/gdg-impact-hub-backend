import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
console.log(process.env.EMAIL_FROM);

/**
 * sendResetEmail(email, resetUrl)
 * - email: destination
 * - resetUrl: url to reset password
 */
export async function sendResetEmail(email, resetUrl) {
  const msg = {
    to: email,
    from: {email: process.env.EMAIL_FROM}, 
    subject: 'Password reset',
    html: `
      <p>You have requested to reset your password.</p>
      <p>Click on the following link to set a new password:</p>
      <p><a href="${resetUrl}">Reset my password</a></p>
      <p>If you did not request this operation, ignore this email.</p>
    `,
  };

  return sgMail.send(msg);
}


