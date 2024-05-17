import { Response, Request } from "express";
import { sendOtp, verifyOtp } from "../util/smsMethods";

export const testSMS = async (req: Request, res: Response) => {
  try {
    const response = await sendOtp("+251936657001");
    res.status(200).json({ msg: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const verifySMS = async (req: Request, res: Response) => {
  try {
    const { otp, pnum } = req.body;
    const response = await verifyOtp(otp, pnum);
    res.status(200).json({ msg: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
