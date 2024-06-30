import { Response, Request } from "express";

// Model
import { DonationModel } from "../model/donation";
import { UserModel } from "../model/user";
import { ProductModel } from "../model/Product";
import { HumanMemorial } from "../model/humanMemorial";
import { FlowerDonationModel } from "../model/flowerDonation";
import { PetMemorial } from "../model/petMemorial";
import FlowerModel from "../model/flowers";
import { WalletModel } from "../model/wallet";
import { DonationClaimOtpModel } from "../model/donationclaimotp";
import { DonationNonUserModel } from "../model/donationNonUser";

// Utils
import { addToWallet, addToWalletFlower } from "../util/wallet";
import { verificationCodeGenerator } from "../util/verificationCodeGenerator";

import {
  sendEmail,
  sendEmailNonUserDonationReceiver,
  sendEmailNonUserDonationSender
} from "../util/email";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);

const YOUR_DOMAIN = process.env.DOMAIN;

export const makeDonation = async (req: Request, res: Response) => {
  try {
    const { from, to, amount, description } = req.body;
    const { type } = req.query || "";

    console.log(req.body, req.query)
    if (!from || !to || !amount) {
      res.status(403).send({ msg: "required field missing" });
    } else {

      if (type == "pet") {

        const pet = await PetMemorial.findOne({ _id: to });

        if (!pet) {
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
                to: pet!._id,
                amount: amount,
                description: description || "Donation",
              });

              await donate.save();

              await PetMemorial.updateOne({
                _id: pet!._id,
              }, {
                $push: {
                  donations: donate._id,
                },
              });
              const user: any = await UserModel.findOne({ _id: pet!.owner });

              addToWallet(user!._id, amount);

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

              const memorial = await HumanMemorial.findOne({ _id: user!._id });

              const mainUser: any = await UserModel.findOne({ _id: user!.author });

              addToWallet(mainUser!._id, amount);

              await UserModel.updateOne({
                _id: from,
              }, {
                $inc: {
                  balance: -amount,
                },
              });

              await sendEmailNonUserDonationSender({
                name: checDonatorBalance!.firstName + " " + checDonatorBalance!.lastName,
                email: checDonatorBalance!.email,
                amount: amount,
                donatedFor: memorial!.name,
                date: new Date().toISOString().split("T")[0],
                type: "Donation",
                confirmation: "Confirmed"
              }).then((response: any) => {
                console.log(response);
              }).catch((error) => {
                console.error(error);
              });


              await sendEmailNonUserDonationReceiver({
                name: mainUser!.firstName + " " + mainUser!.lastName,
                email: checDonatorBalance!.email,
                amount: amount,
                donatedFor: memorial!.name,
                date: new Date().toISOString().split("T")[0],
                type: "Donation",
                confirmation: "Confirmed",
                memorialLink: `${process.env.DOMAIN}/memory/human/${memorial!._id}`,
                recieverEmail: mainUser!.email,
              }).then((response) => {
                console.log(response);
              }).catch((error) => {
                console.error(error);
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
    const { to, amount, name, email, relation, note, description } = req.body;

    const user = await HumanMemorial.findOne({ _id: to });

    if (!user) {
      res.status(402).send({ msg: "User not found" });
    } else {

      const checkUser = await HumanMemorial.findOne({
        _id: to
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

      const donate = new DonationNonUserModel({
        paymentId: session.id,
        to: user!._id,
        amount: amount,
        name: name || "",
        email: email || "",
        relation: relation || "",
        note: note || "",
        description: description || "Donation",
      });

      await donate.save();

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
    const { from, to, id, amount, note } = req.body;
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

            const flowerType = await FlowerModel.findOne({ _id: id });

            const donateFlower = new FlowerDonationModel({
              from: from,
              to: to,
              id: id,
              amount: amount,
              flowerId: flowerType!._id,
              flowerImage: flowerType!.photos,
              note: note,
              type: flowerType!.type,
            });

            await donateFlower.save();

            await UserModel.findOneAndUpdate({ _id: from }, { $inc: { balance: -amount } });

            const mainUser: any = await UserModel.findOne({ _id: pet!.owner });

            addToWalletFlower(mainUser!._id, amount);

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

            const flowerType = await FlowerModel.findOne({ _id: id });

            const donateFlower = new FlowerDonationModel({
              from: from,
              to: to,
              id: id,
              amount: amount,
              flowerId: flowerType!._id,
              note: note,
              flowerImage: flowerType!.photos,
              type: flowerType!.type,
            });

            await donateFlower.save();

            await UserModel.findOneAndUpdate({ _id: from }, { $inc: { balance: -amount } });

            const mainUser: any = await UserModel.findOne({ _id: user!.author });

            addToWalletFlower(mainUser!._id, amount);

            res.status(200).json({
              message: "Donated successfully",
              donateFlower
            });
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

export const claimMoneyDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const user = await UserModel.findOne({ _id: id });
    var wallet;
    wallet = await WalletModel.findOne({ userId: id });

    if (wallet!.balance == 0) {
      return res.status(403).json({ message: "No balance to claim" });
    }
    const transfer = await stripe.transfers.create({
      amount: wallet!.balance * 100,
      currency: 'usd',
      destination: user!.stripeAccountId,
    });

    wallet = await WalletModel.updateOne({ userId: id }, { $set: { balance: 0 } });

    res.status(200).json({ wallet: wallet, transfer: transfer });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", msg: error });
  }
}

export const claimFlowerDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const user = await UserModel.findOne({ _id: id });
    var wallet;
    wallet = await WalletModel.findOne({ userId: id });

    const transfer = await stripe.transfers.create({
      amount: wallet!.flower * 100,
      currency: 'usd',
      destination: user!.stripeAccountId,
    });

    wallet = await WalletModel.updateOne({ userId: id }, { $set: { flower: 0 } });

    res.status(200).json({ wallet: wallet, transfer: transfer });


  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", msg: error });
  }

}

export const claimOTP = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    const user = await UserModel.findById(id);

    const firstName = user!.firstName;
    const lastName = user!.lastName;
    const email = user!.email;
    const verificationCode = verificationCodeGenerator(6);

    sendEmail("donation-withdrawal", {
      firstName: firstName,
      lastName: lastName,
      email: email,
      verificationCode: verificationCode,
    }).then(async (response) => {
      if (response == true) {
        const checkOTP = await DonationClaimOtpModel.findOne({ email: email });

        if (checkOTP) {
          await DonationClaimOtpModel.updateOne(
            { email: email },
            { $set: { otp: verificationCode } }
          );
        } else {
          await DonationClaimOtpModel.create({
            otp: verificationCode,
            email: email
          })
        }
        res.status(200).json({
          type: "email",
          email: email,
          message: "OTP code sent successfully",
        });
      } else {
        res
          .status(408)
          .json({ message: "Unable to send Email at the Moment" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", msg: error });
  }
}

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { id, otp } = req.body;

    const user = await UserModel.findById(id);

    const checkOTP = await DonationClaimOtpModel.findOne({ email: user!.email });

    if (checkOTP!.otp == otp) {
      res.status(200).json({ message: "OTP verified successfully" });
    } else {
      res.status(403).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", msg: error });
  }
}



export const fetchDonors = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    var donors = [];

    const donation: any = await DonationModel.find({ to: id });
    const nonUserDonation = await DonationNonUserModel.find({ to: id });
    const flower: any = await FlowerDonationModel.find({ to: id });

    if (donation) {
      for (let i = 0; i < donation.length; i++) {
        const user = await UserModel.findOne({ _id: donation[i].from });

        if (!user) {
          donors.push({
            name: "Unknown User",
            note: donation[i].note,
            type: "Donation"
          });
        } else {
          donors.push({
            name: user!.firstName + " " + user!.lastName,
            note: donation[i].note,
            type: "Donation"
          });
        }
      }
    }

    if (flower) {
      for (let i = 0; i < flower.length; i++) {
        const user = await UserModel.findOne({ _id: flower[i].from });

        if (!user) {
          donors.push({
            name: "Unknown User",
            note: flower[i].note,
            type: "Flower Donation"
          });
        } else {
          donors.push({
            name: user!.firstName + " " + user!.lastName,
            note: flower[i].note,
            type: "Flower Donation"
          });
        }
      }
    }

    if (nonUserDonation) {
      for (let i = 0; i < nonUserDonation.length; i++) {
        donors.push({
          name: nonUserDonation[i].name,
          note: nonUserDonation[i].note,
          type: "Non User Donation"
        });
      }
    }



    donors = donors.filter((donor, index, self) =>
      index === self.findIndex((t) => (
        t.name === donor.name
      ))
    );

    res.status(200).json({
      donors: donors,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", msg: error });
  }
}