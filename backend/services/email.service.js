import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a certificate completion email using Resend API
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.userName - User's name
 * @param {string} options.courseTitle - Title of the completed course
 * @param {number} options.score - Quiz score
 */
export const sendCertificateEmail = async ({ email, userName, courseTitle, score }) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn("⚠️ RESEND_API_KEY is not set. Email will not be sent.");
            return { success: false, error: "API Key missing" };
        }

        const { data, error } = await resend.emails.send({
            from: 'MindForgeAI <onboarding@resend.dev>', // Update this with a verified domain in production
            to: [email],
            subject: `🎉 Congratulations ${userName}! Your Certificate is Ready`,
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9; border-radius: 12px; max-width: 600px; margin: auto;">
                <h2 style="color: #3B82F6; text-align: center;">Congratulations ${userName}!</h2>
                <p style="font-size: 16px; line-height: 1.5; text-align: center;">
                    You have successfully completed the course:<br>
                    <b style="font-size: 20px; color: #1F2937;">${courseTitle}</b>
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <div style="text-align: center; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
                    <p style="margin: 0; color: #6B7280; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Final Score</p>
                    <p style="margin: 5px 0 0; font-size: 32px; font-weight: bold; color: #10B981;">${score}%</p>
                </div>
                <p style="margin-top: 30px; line-height: 1.6;">
                    Your accomplishment has been recorded. You can view, download, or share your certificate 
                    directly from your <b>MindForgeAI Dashboard</b> at any time.
                </p>
                <p style="font-size: 14px; color: #6B7280; margin-top: 40px; border-top: 1px solid #eee; pt-20px; text-align: center;">
                    This is an automated achievement notification from the <b>MindForgeAI Platform</b>.
                </p>
            </div>
            `
        });

        if (error) {
            console.error("❌ Resend API Error:", error);
            return { success: false, error };
        }

        console.log("✅ Email sent via Resend:", data.id);
        return { success: true, data };

    } catch (err) {
        console.error("❌ Unexpected Error in sendCertificateEmail:", err);
        return { success: false, error: err.message };
    }
};
