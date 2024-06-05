import { Response, Request } from 'express';
import { EmailSubscribe } from '../model/emailSubscribe';

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