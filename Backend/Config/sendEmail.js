import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "SendGrid",
  auth: {
    user: "apikey", // this is literally the string "apikey"
    pass: process.env.SENDGRID_API_KEY,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: `"Character Wiki" <no-reply@yourdomain.com>`, // use a verified sender
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;
