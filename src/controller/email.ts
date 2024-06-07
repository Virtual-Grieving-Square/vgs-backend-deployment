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

    var ejsTemplatePath = path.join(__dirname!, '../../src/pages/auth/test1.ejs');
    const ejsTemplate = fs.readFileSync(ejsTemplatePath, "utf-8");
    const renderHtml = ejs.render(ejsTemplate, { name: `${"Natnael"} ${"Engeda"}`, code: 938212 });

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
      to: "nattynengeda@gmail.com",
      subject: "Virtual Grieving Square Verification",
      html: renderHtml,
    });

    return res.status(200).json({ message: "Email sent successfully", info: info });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}