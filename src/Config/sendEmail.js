import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async ({ to, subject, text, html }) => {

    if (process.env.NODE_ENV === "production") {
        console.log("Email skipped (SMTP blocked on Vercel)");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
    });

};

export default sendEmail;