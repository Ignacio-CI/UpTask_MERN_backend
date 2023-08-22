import nodemailer from 'nodemailer';

export const emailRegister = async (data) => {
  const { name, email, token } = data;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Email Information

  const info = await transport.sendMail({
    from: '"UpTask - Project Manager" <account@uptask.com>',
    to: email,
    subject: "UpTask - Confirm your account",
    text: "Confirm your account in UpTask",
    html: `<p>Hi ${name}! Welcome to Uptask. Please confirm your account by clicking the link below:</p>
    <a href="${process.env.FRONTEND_URL}/confirm/${token}">Confirm Your Account</a>
    <p>If you did not create this account, please ignore this message.</p>`
  })
}

export const emailForgotPassword = async (data) => {
  const { name, email, token } = data;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Email Information

  const info = await transport.sendMail({
    from: '"UpTask - Project Manager" <account@uptask.com>',
    to: email,
    subject: "UpTask - Reset your password",
    text: "Reset your password in UpTask",
    html: `<p>Hi ${name}! You have required to reset your password. Please click the link below and follow the instructions to generate a new password:</p>
    <a href="${process.env.FRONTEND_URL}/forgot-password/${token}">Reset Password</a>
    <p>If you have not required to reset your password, please ignore this message.</p>`
  })
}

