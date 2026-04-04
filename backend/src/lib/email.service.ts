import nodemailer from 'nodemailer';

export const sendCaregiverInvitationEmail = async (patientName: string, caregiverEmail: string, relationship: string) => {
  // If SMTP is not fully configured, send via Ethereal or log warning
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn(`[Email Service] SMTP credentials not fully configured in .env. Falling back to mock logic for email: ${caregiverEmail}`);
    return true; 
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: { user, pass },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Adherence AI" <no-reply@adherence.com>`,
      to: caregiverEmail,
      subject: `You've been invited as a Caregiver by ${patientName}`,
      text: `${patientName} has invited you to be their caregiver (${relationship}) in the Adherence AI platform. Please login or register to accept the invite and monitor their adherence.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
           <div style="background-color: #5a4ae6; padding: 24px; text-align: center; color: white;">
              <h2 style="margin: 0;">Caregiver Invitation</h2>
           </div>
           <div style="padding: 32px; background-color: #fff; color: #333;">
              <p style="font-size: 16px;">Hello,</p>
              <p style="font-size: 16px; line-height: 1.5;">
                 <strong>${patientName}</strong> has invited you to act as their caregiver (${relationship}) on the Adherence AI platform.
              </p>
              <p style="font-size: 16px; line-height: 1.5;">
                 Accepting this invitation will allow you to receive critical alerts about missed or delayed medications and oversee their adherence score.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                 <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background-color: #5a4ae6; color: white; border-radius: 8px; padding: 12px 24px; text-decoration: none; font-weight: bold;">
                    Login To Accept
                 </a>
              </div>
           </div>
        </div>
      `,
    });

    console.log(`[Email Service] Message sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${caregiverEmail}:`, error);
    throw error;
  }
};
