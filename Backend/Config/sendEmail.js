import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL,
            to,
            subject,
            text,
            html,
        });

        if (error) {
            console.error('Resend error:', error);
            throw error;
        }

        console.log('Email sent via Resend:', data);
        return data;
    } catch (err) {
        console.error('Error sending email via Resend:', err);
        throw err;
    }
};

export default sendEmail;