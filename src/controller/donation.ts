import { Response, Request } from "express";
import { DonationModel } from "../model/donation";
import { UserModel } from "../model/user";

export const makeDonation = async (req: Request, res: Response) => {
  const { from, to, amount, productId, desc } = req.body;

  if (!from || !to || !amount || !productId) {
    res.status(200).send({ msg: "required field missing" });
  }

  try {
    const user = await UserModel.findOne({ email: to });
    console.log(user);

    if (!user) {
      res.status(402).send({ msg: "User not found" });
    } else {
      const donate = new DonationModel({
        from: from,
        to: user!._id,
        amount: amount,
        product: productId,
        description: desc,
      });

      await donate.save();
      res.status(201).json({ message: "Donated successfully", donate });
    }
  } catch (error) {
    console.error("Error making Donation", error);
    res.status(500).json({ error: "Internal server error" });
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
  const { userId } = req.body;

  if (!userId) {
    res.status(200).send({ msg: "User Id Missing" });
  }

  try {
    const donationHistory = await fetchDonationHistory(userId);

    res.status(201).json({ donationHistory });
  } catch (error) {
    console.error("Error making Donation", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
