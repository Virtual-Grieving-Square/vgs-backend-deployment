import { Response, Request } from "express";
import { DonationModel } from "../model/donation";
import { UserModel } from "../model/user";

export const makeDonation = async (req: Request, res: Response) => {
  const { from, to, amount, productId, description } = req.body;

  console.log(req.body);

  if (!from || !to || !amount || !productId) {
    res.status(403).send({ msg: "required field missing" });
  } else {

    try {

      const user = await UserModel.findOne({ email: to });

      if (!user) {
        res.status(402).send({ msg: "User not found" });
      } else {

        const donate = new DonationModel({
          from: from,
          to: user!._id,
          amount: amount,
          product: "660c2759fd9d921b6498ca26",
          description: description,
        });

        await donate.save();
        res.status(200).json({ message: "Donated successfully", donate });
      }
    } catch (error) {
      console.error("Error making Donation", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

async function fetchDonationHistory(userId: string) {
  try {
    const donationHistory = await DonationModel.find({ to: userId });

    const populatedDonationHistory = await DonationModel.populate(
      donationHistory,
      { path: "products", model: "Product" }
    );

    return populatedDonationHistory;
  } catch (error) {
    console.error("Error fetching donation history:", error);
    throw error;
  }
}

export const donationHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const donationHistory = await fetchDonationHistory(userId);

    if (!userId) {
      res.status(200).send({ msg: "User Id Missing" });
    }


    res.status(201).json({ donationHistory });
  } catch (error) {
    console.error("Error making Donation", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
