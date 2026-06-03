import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Tee Naturals 🌿" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html, // 👈 IMPORTANT (not text anymore)
  });
};

export default sendEmail;