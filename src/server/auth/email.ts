import nodemailer from 'nodemailer';

interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_FROM);
}

async function sendEmail(message: EmailMessage): Promise<{ sent: boolean }> {
  if (!smtpConfigured()) return { sent: false };

  const port = Number(process.env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: message.to,
    subject: message.subject,
    text: message.text
  });

  return { sent: true };
}

export async function sendPasswordResetEmail(input: { to: string; resetToken: string }): Promise<{ sent: boolean }> {
  return sendEmail({
    to: input.to,
    subject: 'Reset your PataSpace password',
    text: [
      'Hello,',
      '',
      'Use this secure reset code to set a new password for your PataSpace account:',
      '',
      input.resetToken,
      '',
      'This code expires in 30 minutes. If you did not request this, you can ignore this email.',
      '',
      'PataSpace'
    ].join('\n')
  });
}

export async function sendEmailVerificationEmail(input: { to: string; verificationToken: string }): Promise<{ sent: boolean }> {
  return sendEmail({
    to: input.to,
    subject: 'Verify your PataSpace email address',
    text: [
      'Hello,',
      '',
      'Use this secure verification code to verify your PataSpace email address:',
      '',
      input.verificationToken,
      '',
      'This code expires in 24 hours. If you did not create this account, you can ignore this email.',
      '',
      'PataSpace'
    ].join('\n')
  });
}
