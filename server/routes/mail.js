import express from 'express';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

// POST /api/mail/send-acknowledgement
router.post('/send-acknowledgement', async (req, res) => {
  const { email, candidateName } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const subject = `Acknowledgement: CV Received for ${candidateName || 'Candidate'}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Application Received</h2>
      <p>Hello ${candidateName || ''},</p>
      <p>This is an acknowledgement that we have received your CV. Your application is currently under checklist and review.</p>
      <p>We will inform you as soon as an interview gets scheduled or if there are any further updates regarding your application.</p>
      <br />
      <p>Best regards,</p>
      <p><strong>The Recruitment Team</strong></p>
    </div>
  `;
  const text = `Hello ${candidateName || ''},\n\nThis is an acknowledgement that we have received your CV. Your application is currently under checklist and review.\n\nWe will inform you as soon as an interview gets scheduled.\n\nBest regards,\nThe Recruitment Team`;

  const result = await sendEmail({
    to: email,
    subject,
    text,
    html,
  });

  if (result.success) {
    res.json({ success: true, message: 'Acknowledgement email sent' });
  } else {
    res.status(500).json({ error: result.error || 'Failed to send email' });
  }
});

// POST /api/mail/test
router.post('/test', async (req, res) => {
  const result = await sendEmail({
    to: req.body.to || 'test@example.com',
    subject: 'Test Email from ATS',
    text: 'This is a test email to verify SMTP configuration.',
    html: '<p>This is a test email to verify <strong>SMTP configuration</strong>.</p>',
  });

  if (result.success) {
    res.json({ success: true, message: 'Test email sent successfully' });
  } else {
    res.status(500).json({ error: result.error || 'Failed to send test email' });
  }
});

export default router;
