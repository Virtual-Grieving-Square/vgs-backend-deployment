import { Response, Request } from 'express';
import { EmailSubscribe } from '../model/emailSubscribe';

import path from "path";
import fs from "fs";
import ejs from "ejs";

import nodemailer from "nodemailer";

export const subscribeEmail = async (req: Request, res: Response) => {
  try {
    const { email, memorials } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    // Check if email is already subscribed
    const isSubscribed = await EmailSubscribe.findOne({ email });

    if (isSubscribed) {
      return res.status(403).json({ message: "Email is already subscribed" });
    }

    // // Subscribe email
    const newEmail = new EmailSubscribe({
      email: email,
      memorials: memorials
    });

    await newEmail.save();
    res.status(200).json({ message: "Email subscribed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const Test = async (req: Request, res: Response) => {
  try {
    const env = process.env;

    console.log("Email Test Route");
    console.log("Usernaem", process.env.NODEMAILER_USER_DONATION!);
    console.log("Password", process.env.NODEMAILER_PASS_DONATION!);

    var ejsTemplatePath = path.join(__dirname!, '../../src/pages/donation/money-donation-non-user-reciever.ejs');
    const ejsTemplate = fs.readFileSync(ejsTemplatePath, "utf-8");
    const renderHtml = ejs.render(ejsTemplate, {
      name: `${"Bereket"} ${"Isayas"}`,
      email: "bisayas@brukeylogistics.com",
      amount: "240",
      donatedFor: "SomeOne",
      date: "2024-12-12",
      type: "Donation",
      confirmation: "Confirmed",
      memorialLink: "http://localhost:3131/memory/human/6666fc46cbce1e5c31bfc0bb"
    });

    const transporter = nodemailer.createTransport({
      host: env.NODEMAILER_HOST!,
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_USER_DONATION!,
        pass: process.env.NODEMAILER_PASS_DONATION!,
      },
    });

    const info = await transporter.sendMail({
      from: '"Virtual Grieving Square" <donation@virtualgrievingsquare.com>',
      to: ["nattynengeda@gmail.com", "bisayas@brukeylogistics.com"],
      subject: "Donation Reciept",
      html: renderHtml,
    }).catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal server error", error: error });
    })

    return res.status(200).json({ message: "Email sent successfully", info: info });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}