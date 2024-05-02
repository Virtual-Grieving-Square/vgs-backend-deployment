import { Request, Response } from "express";
import nodemailer from 'nodemailer';
import ContactDetailModel from "../model/contact";

export const contactUs = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }

    await ContactDetailModel.create({
      name: name,
      email: email,
      phoneNumber: phone,
      message: message
    });

    const transporter = await nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const mailOptions = {
      from: '"VGS" <verification@virtualgrievingsquare.com>',
      to: "verification@virtualgrievingsquare.com",
      subject: `Contact Form Submission: ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone Number: ${phone}
        Message: ${message}
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "Your message has been sent successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while sending your message." });
  }
};
