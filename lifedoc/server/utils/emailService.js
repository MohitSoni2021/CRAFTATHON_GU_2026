const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Base send email function
const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: '"LifeDoc System" <noreply@lifedoc.com>',
        to,
        subject,
        html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        return false;
    }
};

// 1. Doctor Verification Emails
exports.sendVerificationStatus = async (doctorEmail, status, feedback) => {
    let subject = "";
    let html = "";

    if (status === 'approved') {
        subject = "🎉 Doctor Verification Approved - LifeDoc";
        html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #16a34a;">Congratulations! You are Verified.</h2>
                <p>We are pleased to inform you that your doctor verification application has been <strong>APPROVED</strong>.</p>
                <p>You now have full access to the <strong>Doctor Dashboard</strong> where you can:</p>
                <ul>
                    <li>Review patient consultations</li>
                    <li>Provide expert second opinions</li>
                    <li>Participate in case conferences</li>
                </ul>
                <p>Log in now to start assisting patients.</p>
                <a href="http://localhost:3000/doctor/dashboard" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
            </div>
        `;
    } else {
        subject = "Doctor Verification Status Update";
        html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #dc2626;">Application Status Update</h2>
                <p>Your application for doctor verification has been <strong>REJECTED</strong>.</p>
                <p><strong>Reason/Feedback:</strong></p>
                <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #dc2626;">${feedback}</blockquote>
                <p>You may update your documents and re-apply via your dashboard.</p>
            </div>
        `;
    }

    return await sendEmail(doctorEmail, subject, html);
};

// 2. Meeting Approval Emails
exports.sendMeetingApproval = async (doctorEmail, topic, meetingLink, reason, scheduledAt) => {
    const formattedTime = new Date(scheduledAt).toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const subject = `🚨 Emergency Case Conference: ${topic}`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #dc2626;">Emergency Case Conference Scheduled</h2>
            <p>A new emergency case conference requires your attention.</p>
            
            <div style="background: #fff1f2; padding: 15px; border-radius: 8px; border: 1px solid #fecdd3; margin: 20px 0;">
                <p><strong>Topic:</strong> ${topic}</p>
                <p><strong>Time:</strong> <span style="font-size: 1.1em; font-weight: bold;">${formattedTime}</span></p>
                <p><strong>Reason:</strong> ${reason}</p>
            </div>

            <a href="${meetingLink}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Join Google Meet</a>
            
            <p style="margin-top: 20px; font-size: 0.9em; color: #666;">Please mark your calendar.</p>
        </div>
    `;

    return await sendEmail(doctorEmail, subject, html);
};

// 3. Patient Consultation Review Emails
exports.sendConsultationResult = async (userEmail, patientName, doctorName, diagnosis, advice) => {
    const subject = `🩺 Expert Review Completed: ${diagnosis || 'Medical Opinion'}`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4f46e5;">Expert Verification Complete</h2>
            <p>Hello ${patientName},</p>
            <p><strong>Dr. ${doctorName}</strong> has reviewed your recent consultation request.</p>
            
            <div style="background: #eef2ff; padding: 15px; border-radius: 8px; border: 1px solid #c7d2fe; margin: 20px 0;">
                <h3 style="color: #3730a3; margin-top: 0;">Doctor's Expert Opinion:</h3>
                <p style="font-style: italic; white-space: pre-line;">"${advice}"</p>
            </div>

            <p>You can view the full details and AI analysis in your dashboard.</p>
            <a href="http://localhost:3000/consultation" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Full Report</a>
        </div>
    `;

    return await sendEmail(userEmail, subject, html);
};
