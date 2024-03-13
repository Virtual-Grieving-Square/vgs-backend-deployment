import { Request, Response } from "express";
import { UserModel } from "../../model/user";

export const wallet = async (req: Request, res: Response) => {
  try {

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const updateWallet = async (req: Request, res: Response) => {
  try {
    const { id, amount } = req.body;

    if (!id || !amount) {
      return res.status(400).json({ message: "Invalid request" });
    }

    await UserModel.updateOne(
      { _id: id },
      {
        $inc: { balance: amount }
      }
    );

    res.status(200).json({ msg: "Update Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}