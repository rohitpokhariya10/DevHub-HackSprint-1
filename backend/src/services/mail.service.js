const transporter = require("../config/mail");

// Thin mail service wrapper so controllers/hooks do not depend on nodemailer directly.
const sendmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });

    return info;
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
};

module.exports = sendmail;
