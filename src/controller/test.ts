import { Response, Request } from "express";
import { sendOtp, verifyOtp } from "../util/smsMethods";
import { sendNotification } from "../middleware/notification";

export const testSMS = async (req: Request, res: Response) => {
  try {
    const response = await sendOtp("+251936657001");
    res.status(200).json({ msg: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const testNotif = async (req: Request, res: Response) => {
  try {
    const { userID, authorTokens } = req.body;

    const payload = {
      title: "Your post got a new like!",
      body: `liked your post.`,
      data: { postId: userID },
    };
    await sendNotification({ token: authorTokens, payload });

    res.status(200).json({ msg: "Okay" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const testNotif3 = async (req: Request, res: Response) => {
  try {
    const { otp, pnum } = req.body;
    const response = await verifyOtp(otp, pnum);
    res.status(200).json({ msg: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
