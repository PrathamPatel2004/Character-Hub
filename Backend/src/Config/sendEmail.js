import { Resend } from "resend";

import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const data = await resend.emails.send({
            from: "Character Hub <onboarding@resend.dev>",
            to,
            subject,
            text,
            html,
        });

        return data;
    } catch (error) {
        console.error("Resend error:", error);
        throw error;
    }

};

export default sendEmail;