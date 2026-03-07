const nodemailer = require("nodemailer");
const twilio = require("twilio");

// Email Transporter Setup
let transporter;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
} else {
    console.warn("⚠️ SMTP credentials missing. Emails will not be sent.");
}

// Twilio Setup
let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} else {
    console.warn("⚠️ Twilio credentials missing. WhatsApp messages will not be sent.");
}

/**
 * Send an email
 * @param {Object} options - { to, subject, text, html }
 */
const sendEmail = async ({ to, subject, text, html }) => {
    if (!transporter) {
        console.log(`[Mock Email] To: ${to} | Subject: ${subject}`);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'Switch2iTech'}" <${process.env.SMTP_FROM}>`,
            to,
            subject,
            text,
            html,
        });
        console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
    } catch (error) {
        console.error(`💥 Error sending email to ${to}:`, error);
    }
};

/**
 * Send a WhatsApp message
 * @param {Object} options - { to, message }
 */
const sendWhatsApp = async ({ to, message }) => {
    if (!twilioClient) {
        console.log(`[Mock WhatsApp] To: ${to} | Message: ${message}`);
        return;
    }

    try {
        // Ensure the phone number starts with 'whatsapp:' and has a '+' country code prefix
        const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to.startsWith('+') ? to : '+' + to}`;

        const info = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886', // Twilio Sandbox default
            to: formattedTo,
        });
        console.log(`💬 WhatsApp sent to ${to}: ${info.sid}`);
    } catch (error) {
        console.error(`💥 Error sending WhatsApp to ${to}:`, error);
    }
};

/**
 * Send verification codes during registration
 */
const sendVerificationCodes = async (user, emailCode, phoneCode) => {
    // 1. Send Email
    await sendEmail({
        to: user.email,
        subject: "Welcome! Verify your Email",
        text: `Hello ${user.name},\n\nYour email verification code is: ${emailCode}\n\nPlease enter this code to verify your account.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to Switch2iTech, ${user.name}!</h2>
                <p>Thank you for registering. Please use the verification code below to confirm your email address:</p>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
                    ${emailCode}
                </div>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        `,
    });

    // 2. Send WhatsApp
    if (user.phoneNo && phoneCode) {
        await sendWhatsApp({
            to: user.phoneNo,
            message: `Hi ${user.name}, welcome to Switch2iTech! Your phone verification code is: *${phoneCode}*`,
        });
    }
};

/**
 * Send generic activity notification (useful for Project Management)
 */
const sendActivityNotification = async (user, activityTitle, activityDetails) => {
    // Format the email
    const htmlEmail = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
            <h3>${activityTitle}</h3>
            <p>Hello ${user.name},</p>
            <p>${activityDetails}</p>
            <br>
            <p>Best Regards,<br>The Switch2iTech Team</p>
        </div>
    `;

    // 1. Send Email
    await sendEmail({
        to: user.email,
        subject: activityTitle,
        text: `Hello ${user.name},\n\n${activityTitle}\n\n${activityDetails}`,
        html: htmlEmail,
    });

    // 2. Send WhatsApp
    if (user.phoneNo) {
        await sendWhatsApp({
            to: user.phoneNo,
            message: `*${activityTitle}*\n\nHi ${user.name},\n${activityDetails}`,
        });
    }
};

module.exports = {
    sendEmail,
    sendWhatsApp,
    sendVerificationCodes,
    sendActivityNotification,
};
