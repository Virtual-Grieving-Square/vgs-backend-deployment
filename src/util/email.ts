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
    case 'donation-withdrawal':
      ejsTemplatePath = path.join(__dirname, "../../src/pages/auth/donationWithdrawal.ejs");
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

export const sendEmailNonUserDonationSender = async (data: any) => {
  try {
    const env = process.env;

    var ejsTemplatePath = path.join(__dirname!, '../../src/pages/donation/money-donation-non-user-sender.ejs');
    const ejsTemplate = fs.readFileSync(ejsTemplatePath, "utf-8");
    const renderHtml = ejs.render(ejsTemplate, {
      name: data.name,
      email: data.email,
      amount: data.amount,
      donatedFor: data.donatedFor,
      date: data.date,
      type: data.type,
      confirmation: "Confirmed"
    });

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
      subject: "VGS, Donation Reciept",
      html: renderHtml,
    });

    return [{ status: true, message: "Email sent successfully", info: info }];

  } catch (error) {
    console.error(error);
    return [{ status: false, message: "Internal server error", error: error }];
  }
}

export const sendEmailNonUserDonationReceiver = async (data: any) => {
  try {
    const env = process.env;

    var ejsTemplatePath = path.join(__dirname!, '../../src/pages/donation/money-donation-non-user-reciever.ejs');
    const ejsTemplate = fs.readFileSync(ejsTemplatePath, "utf-8");
    const renderHtml = ejs.render(ejsTemplate, {
      name: data.name,
      email: data.email,
      amount: data.amount,
      donatedFor: data.donatedFor,
      date: data.date,
      type: data.type,
      confirmation: "Confirmed",
      memorialLink: data.memorialLink
    });

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
      to: data.recieverEmail,
      subject: "VGS, Donation Notification",
      html: renderHtml,
    });

    return [{ status: true, message: "Email sent successfully", info: info }];
  } catch (error) {
    console.error(error);
    return [{ status: false, message: "Internal server error", error: error }];
  }
}