import nodemailer from 'nodemailer';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'apikey', // SendGrid uses 'apikey' as the username
    pass: process.env.SMTP_PASS, // Your SendGrid API Key
  },
});

/**
 * Sends an email using the configured SMTP transport.
 * 
 * @param {Object} options 
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version of the message
 * @param {string} options.html - HTML version of the message
 * @returns {Promise<any>}
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP_PASS is not set. Email will not be sent.');
    return { success: false, error: 'SMTP configuration missing' };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"ATS Platform" <noreply@example.com>', // sender address
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};
