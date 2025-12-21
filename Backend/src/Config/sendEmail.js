import { Resend } from "resend";

let resendClient;

const getResendClient = () => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY missing");
    }
    if (!resendClient) {
        resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
};

const sendEmail = async ({ to, subject, text, html }) => {
    const resend = getResendClient();
    return resend.emails.send({
        from: "Character Hub <onboarding@resend.dev>",
        to,
        subject,
        text,
        html,
        reply_to: "patelp149201@gmail.com"
    });
};

export default sendEmail;
