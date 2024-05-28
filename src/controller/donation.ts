import { Response, Request } from "express";
import { DonationModel } from "../model/donation";
import { UserModel } from "../model/user";
import { ProductModel } from "../model/Product";
import { HumanMemorial } from "../model/humanMemorial";
import { FlowerDonationModel } from "../model/flowerDonation";
import { PetMemorial } from "../model/petMemorial";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);

const YOUR_DOMAIN = "https://uione.virtualgrievingsquare.com";

export const makeDonation = async (req: Request, res: Response) => {
  try {
    const { from, to, amount, description } = req.body;
    const { type } = req.query || "";

    console.log(req.body, req.query)
    if (!from || !to || !amount) {
      res.status(403).send({ msg: "required field missing" });
    } else {

      if (type == "pet") {

        const user = await PetMemorial.findOne({ _id: to });

        if (!user) {
          res.status(402).send({ msg: "User not found" });
        } else {

          const checkUser = await PetMemorial.findOne({
            _id: to
          });

          if (checkUser!.owner == from) {
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

              await PetMemorial.updateOne({
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
      } else {

        const user = await HumanMemorial.findOne({ _id: to });

        if (!user) {
          res.status(402).send({ msg: "User not found" });
        } else {

          const checkUser = await HumanMemorial.findOne({
            _id: to
          });

          if (checkUser!.author == from) {
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

              await UserModel.updateOne({
                _id: from,
              }, {
                $inc: {
                  balance: -amount,
                },
              });
              res.status(200).json({ message: "Donated successfully", donate });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error making Donation", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const makeDonationNonUser = async (req: Request, res: Response) => {
  try {
    const { from, to, amount, description } = req.body;

    const user = await HumanMemorial.findOne({ _id: to });

    if (!user) {
      res.status(402).send({ msg: "User not found" });
    } else {

      const checkUser = await HumanMemorial.findOne({
        _id: to
      });

      const donate = new DonationModel({
        from: "664b6f476efa78884d3a9af6",
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

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Donation",
              },
              unit_amount: amount * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${YOUR_DOMAIN}/donation?success=true`,
        cancel_url: `${YOUR_DOMAIN}/donation?canceled=true`,
        automatic_tax: { enabled: true },
      });

      res.status(200).json({
        request: "success",
        session: session,
        client_secret: session.client_secret,
      });



    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const donateFlower = async (req: Request, res: Response) => {
  try {
    const { from, to, id, amount } = req.body;
    const { type } = req.query || "";

    if (!from || !to || !id || !amount) {
      res.status(403).send({ msg: "required field missing" });
    } else {

      if (type == "pet") {

        const pet = await PetMemorial.findOne({ _id: to });

        if (!pet) {
          res.status(402).send({ msg: "Pet not found" });
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

export const getAll = async (req: Request, res: Response) => {
  try {
    const donations = await DonationModel.find();

    res.status(200).json({ donations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getDonationByUserId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let donation;
    let humanDonation = [];
    let petDonation = [];

    let flower;
    let humanFlowerDonation = [];
    let petFlowerDonation = [];

    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(403).json({ msg: "User not Found" });

    } else {
      const humanMemorial = await HumanMemorial.find({
        author: id,
      });

      const petMemorial = await PetMemorial.find({
        owner: id,
      });

      if (humanMemorial.length > 0) {
        for (let i = 0; i < humanMemorial.length; i++) {
          donation = await DonationModel.find({
            to: humanMemorial[i]._id,
          });
          humanDonation[i] = donation;
        }
      } else {
        humanDonation = [];
      }

      if (petMemorial.length > 0) {
        for (let i = 0; i < petMemorial.length; i++) {
          donation = await DonationModel.find({
            to: petMemorial[i]._id,
          });
          petDonation[i] = donation;
        }
      } else {
        petDonation = [];
      }

      const allDonation = [
        ...(Array.isArray(humanDonation[0]) ? humanDonation[0] : []),
        ...(Array.isArray(petDonation[0]) ? petDonation[0] : [])
      ];

      // Flower Donation
      if (humanMemorial.length > 0) {
        for (let i = 0; i < humanMemorial.length; i++) {
          flower = await FlowerDonationModel.find({
            to: humanMemorial[i]._id,
          });
          humanFlowerDonation[i] = flower;
        }
      } else {
        humanFlowerDonation = [];
      }

      if (petMemorial.length > 0) {
        for (let i = 0; i < petMemorial.length; i++) {
          flower = await FlowerDonationModel.find({
            to: petMemorial[i]._id,
          });
          petFlowerDonation[i] = flower;
        }
      } else {
        petFlowerDonation = [];
      }

      const allFlower = [
        ...(Array.isArray(humanFlowerDonation[0]) ? humanFlowerDonation[0] : []),
        ...(Array.isArray(petFlowerDonation[0]) ? petFlowerDonation[0] : [])
      ]

      const donationTotal = allDonation.reduce((acc, donation) => acc + donation.amount, 0);
      const flowerTotal = allFlower.reduce((acc, flower) => acc + flower.amount, 0);

      res.status(200).json({
        allDonation: donationTotal,
        allFlower: flowerTotal,
      });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", msg: error });
  }
}