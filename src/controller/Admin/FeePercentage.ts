import { Response, Request } from "express";
import { FeePayment } from "../../model/FeePercentage";

export const setFeePercentage = async (req: Request, res: Response) => {
  try {
    const { userId, percentage } = req.body;

    if (percentage <= 0) {
      return res
        .status(400)
        .json({ error: "Percentage must be greater than 0" });
    }

    await FeePayment.findOneAndUpdate(
      { _id: "feeRecord1" },
      { userId, percentage },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Fee percentage set successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error", error: error });
  }
};

export const getFeePercentage = async (req: Request, res: Response) => {
  try {
    const fee = await FeePayment.findOne({ _id: "feeRecord1" });
    if (!fee) {
      return res.status(404).json({ error: "Fee percentage not found" });
    }
    res.status(200).json({ percentage: fee.percentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error", error: error });
  }
};
