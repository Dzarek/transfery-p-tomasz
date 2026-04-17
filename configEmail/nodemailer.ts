import nodemailer from "nodemailer";

const email = process.env.NEXT_PUBLIC_EMAIL_LOGIN;
const pass = process.env.NEXT_PUBLIC_EMAIL_PASSWORD;

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const mailOptions = {
  from: email,
  to: ["dzarekcoding@gmail.com"],
};
