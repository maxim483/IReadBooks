import nodemailer from 'nodemailer';

export const sendPasswordResetEmail = async (to, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: '"BookApp 📚" <no-reply@bookapp.com>',
    to,
    subject: 'Reset Your Password',
    html: `
      <h3>Hi there,</h3>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you didn't request this, just ignore this email.</p>
      <p>Happy reading! 📖</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
