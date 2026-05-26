import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { APP_NAME, GOOGLE_APP_EMAIL, GOOGLE_APP_PASSWORD } from "../../../config/config";
import { BadRequestException } from "../../exceptions";


// Create a transporter using SMTP

export const sendEmail = async ({ to, cc, bcc, subject, html, attachments = [] }: Mail.Options): Promise<void> => {

  if (!to && !cc && !bcc) {
    throw new BadRequestException('Invalid Request')
  }

  if (!(html as string)?.length && !attachments?.length) {
    throw new BadRequestException('Invalid Request')
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GOOGLE_APP_EMAIL,
      pass: GOOGLE_APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `"OTP for verification" <${APP_NAME}>`, // sender address
    to,
    cc,
    bcc,
    subject,
    html,
    attachments,
  });
  console.log("Message sent: %s", info.messageId);
};
