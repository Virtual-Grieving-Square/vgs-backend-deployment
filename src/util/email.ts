import path from "path";
import fs from "fs";
import ejs from "ejs";

import nodemailer from "nodemailer";

export const sendEmail = async (type: string, data: any) => {
  const env = process.env;

  var ejsTemplatePath;

  switch (type) {
    case 'signup':
      ejsTemplatePath = path.join(__dirname!, '../../src/pages/auth/signup.ejs');
      break;
    case 'forgotPassword':
      ejsTemplatePath = path.join(__dirname, "../templates/forgotPassword.ejs");
      break;

    default:
      ejsTemplatePath = path.join(__dirname, "../templates/signup.ejs");
  };


  const ejsTemplate = fs.readFileSync(ejsTemplatePath, "utf-8");
  const renderHtml = ejs.render(ejsTemplate, { name: `${data.firstName} ${data.lastName}`, code: data.verificationCode });

  const transporter = nodemailer.createTransport({
    host: env.NODEMAILER_HOST!,
    port: 465,
    secure: true,
    auth: {
      user: env.NODEMAILER_USER!,
      pass: env.NODEMAILER_PASS!,
    },
  });

  const info = await transporter.sendMail({
    from: '"Virtual Grieving Square" <verification@virtualgrievingsquare.com>',
    to: data.email,
    subject: "Virtual Grieving Square Verification",
    html: renderHtml,
  });

  if (info.accepted) return true;
  else return false;
} 