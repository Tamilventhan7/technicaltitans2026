import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_PORT || '2525'),
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
});

const defaultFrom = process.env.EMAIL_FROM || '"TransitOps+ Alerts" <alerts@transitops.com>';

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  // If credentials are not set, log and bypass actual mail sending to avoid crashes
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[Email Service Fallback] Sending Mail: To: ${to} | Subject: ${subject}`);
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: defaultFrom,
      to,
      subject,
      html
    });
    console.log(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Email sending failed to ${to}:`, error);
    return false;
  }
}

export async function sendOtpEmail(to: string, otp: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #1a73e8; text-align: center;">TransitOps+ Security Verification</h2>
      <p>Hello,</p>
      <p>You requested a password reset or security verification code. Use the One-Time Password (OTP) below to authenticate:</p>
      <div style="background-color: #f1f3f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 4px; color: #202124;">
        ${otp}
      </div>
      <p style="color: #5f6368; font-size: 12px; margin-top: 20px; text-align: center;">This code will expire in 10 minutes. If you did not make this request, please contact administrator immediately.</p>
    </div>
  `;
  return sendEmail(to, 'TransitOps+ Security OTP Code', html);
}

export async function sendCriticalAlertEmail(to: string, alertMessage: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fce8e6; border-radius: 8px; background-color: #fdf5f5;">
      <h2 style="color: #d93025; text-align: center;">TransitOps+ Critical SOS Alert</h2>
      <p>Hello,</p>
      <p>A critical event has been triggered in the operations network:</p>
      <div style="border-left: 4px solid #d93025; padding-left: 15px; margin: 20px 0; font-style: italic; color: #202124;">
        ${alertMessage}
      </div>
      <p>Log in to the dashboard immediately to coordinate emergency response.</p>
    </div>
  `;
  return sendEmail(to, 'CRITICAL WARNING: TransitOps+ System Alert', html);
}
