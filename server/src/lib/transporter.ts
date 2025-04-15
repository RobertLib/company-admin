import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

let transporter: nodemailer.Transporter;

if (process.env.NODE_ENV !== "production") {
  transporter = {
    sendMail: (mailOptions: any) => {
      logger.info("💌 Email would be sent in production:");
      logger.info(`To: ${mailOptions.to ?? "N/A"}`);
      logger.info(`Subject: ${mailOptions.subject ?? "N/A"}`);
      logger.info(`Text: ${mailOptions.text ?? "N/A"}`);
      logger.info(`HTML: ${mailOptions.html ?? "N/A"}`);

      return Promise.resolve({
        messageId: `dev-${Date.now()}`,
        envelope: { to: mailOptions.to, from: mailOptions.from },
      });
    },
  } as nodemailer.Transporter;
} else {
  transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export default transporter;
