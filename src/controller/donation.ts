import { Response, Request } from "express";
import { DonationModel } from "../model/donation";
import { UserModel } from "../model/user";
import { ProductModel } from "../model/Product";
import { HumanMemorial } from "../model/humanMemorial";
import { FlowerDonationModel } from "../model/flowerDonation";

export const makeDonation = async (req: Request, res: Response) => {
  const { from, to, amount, description } = req.body;

  if (!from || !to || !amount) {
    res.status(403).send({ msg: "required field missing" });
  } else {
    try {
      const user = await HumanMemorial.findOne({ _id: to });

      if (!user) {
        res.status(402).send({ msg: "User not found" });
      } else {

        const checkUser = await HumanMemorial.findOne({
          author: from
        });

        if (checkUser) {
          res.status(402).send({ msg: "You can't donate to yourself" });
        } else {

          const checDonatorBalance = await UserModel.findOne({ _id: from });

          if (checDonatorBalance!.balance < amount) {
            res.status(405).send({ msg: "Insufficient balance" });
          } else {
            const donate = new DonationModel({
              from: from,
              to: user!._id,
              amount: amount,
              description: description || "Donation",
            });

            await donate.save();

            await HumanMemorial.updateOne({
              _id: user!._id,
            }, {
              $push: {
                donations: donate._id,
              },
            });
            res.status(200).json({ message: "Donated successfully", donate });
          }

        }

      }
    } catch (error) {
      console.error("Error making Donation", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const donateFlower = async (req: Request, res: Response) => {
  try {
    const { from, to, id, amount } = req.body;

    if (!from || !to || !id || !amount) {
      res.status(403).send({ msg: "required field missing" });
    } else {

      const user = await HumanMemorial.findOne({ _id: to });
      if (!user) {
        res.status(402).send({ msg: "User not found" });
      } else {
        const checDonatorBalance = await UserModel.findOne({ _id: from });

        if (checDonatorBalance!.balance < amount) {
          res.status(405).send({ msg: "Insufficient balance" });
        } else {

          const donateFlower = new FlowerDonationModel({
            from: from,
            to: to,
            id: id,
            amount: amount,
          });

          await donateFlower.save();

          res.status(200).json({ message: "Donated successfully", donateFlower });
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function fetchDonationHistory(userId: string) {
  try {
    const donationHistory = await DonationModel.find({ to: userId });


    const populatedDonationHistory = await DonationModel.populate(donationHistory, {
      path: "product",
      model: ProductModel,
    });
    return populatedDonationHistory;
  } catch (error) {
    console.error("Error fetching donation history:", error);
    throw error;
  }
}

export const donationHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(id);

    const donation = await DonationModel.find({
      to: id,
    });

    res.status(200).json(donation);
  } catch (error) {
    console.error("Error making Donation", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const flowerDonationHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const flowerdonation = await FlowerDonationModel.find({
      to: id,
    });

    res.status(200).json(flowerdonation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
