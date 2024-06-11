import path from "path";
import fs from "fs";
import ejs from "ejs";

import nodemailer from "nodemailer";

export const sendEmailToSubscribers = async (data: any) => {
  const env = process.env;

  var ejsTemplatePath;
  ejsTemplatePath = path.join(__dirname!, '../../src/pages/newsletter/newsletter.ejs');




  const ejsTemplate = fs.readFileSync(ejsTemplatePath, "utf-8");
  const renderHtml = ejs.render(ejsTemplate, { name: `${data.firstName} ${data.lastName}`, description: data.description, memorialTitle: data.memorialTitle });

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
    subject: "Virtual Grieving Square News letter",
    html: renderHtml,
  });

  if (info.accepted) return true;
  else return false;
} 