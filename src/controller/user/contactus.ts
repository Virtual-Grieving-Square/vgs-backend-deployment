import { Request, Response } from "express";
import nodemailer from 'nodemailer';

export const contactUs = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    
    const mailOptions = {
      from: '"VGS" <verification@virtualgrievingsquare.com>', 
      to: "verification@virtualgrievingsquare.com", 
      subject: `Contact Form Submission: ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
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
