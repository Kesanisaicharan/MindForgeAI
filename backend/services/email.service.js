import { Resend } from 'resend';

const client = () => new Resend(process.env.RESEND_API_KEY);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const buildCertificateHtml = ({ userName, courseTitle, score, verifyUrl }) => `
<div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9; border-radius: 12px; max-width: 600px; margin: auto;">
  <h2 style="color: #3B82F6; text-align: center;">Congratulations ${esc(userName)}!</h2>
  <p style="font-size: 16px; line-height: 1.5; text-align: center;">You have successfully completed the course:<br>
    <b style="font-size: 20px; color: #1F2937;">${esc(courseTitle)}</b></p>
  <div style="text-align: center; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
    <p style="margin: 0; color: #6B7280; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Final Score</p>
    <p style="margin: 5px 0 0; font-size: 32px; font-weight: bold; color: #10B981;">${esc(score)}%</p>
  </div>
  <p style="margin-top: 30px; line-height: 1.6;">Your certificate is saved on your <b>MindForgeAI Dashboard</b>.${verifyUrl ? ` Anyone can verify it here: <a href="${esc(verifyUrl)}">${esc(verifyUrl)}</a>` : ''}</p>
  <p style="font-size: 14px; color: #6B7280; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">Automated notification from the <b>MindForgeAI Platform</b>.</p>
</div>`;

/** Sends the completion email. Returns { success, reason } where reason is a short machine-readable code. */
export const sendCertificateEmail = async ({ email, userName, courseTitle, score, certificateId }) => {
    if (!process.env.RESEND_API_KEY) return { success: false, reason: 'api_key_missing' };
    const base = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
    try {
        const { data, error } = await client().emails.send({
            from: process.env.RESEND_FROM || 'MindForgeAI <onboarding@resend.dev>', // set RESEND_FROM to a verified-domain address to email any learner
            to: [email],
            subject: `Congratulations ${userName}! Your Certificate is Ready`,
            html: buildCertificateHtml({ userName, courseTitle, score, verifyUrl: base && certificateId ? `${base}/verify/${certificateId}` : '' }),
        });
        if (error) { console.error('Resend error:', error); return { success: false, reason: 'provider_rejected' }; }
        console.log('Email sent via Resend:', data.id);
        return { success: true };
    } catch (err) {
        console.error('Unexpected email error:', err);
        return { success: false, reason: 'send_failed' };
    }
};
