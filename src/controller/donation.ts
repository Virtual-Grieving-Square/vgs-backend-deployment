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
  sendEmailNonUserDonationSender,
  sendEmailClaimer
} from "../util/email";
import LikeModel from "../model/like";
import { FCMModel } from "../model/fcmTokens";
import { sendNotification } from "../middleware/notification";
import { emitLikeUpdate } from "../util/event";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);

const YOUR_DOMAIN = process.env.DOMAIN;

export const makeDonation = async (req: Request, res: Response) => {
  try {
    const { from, to, amount, description, note, name } = req.body;
    const { type } = req.query || "";

    console.log(req.body, req.query);
    if (!from || !to || !amount) {
      res.status(403).send({ msg: "required field missing" });
    } else {
      if (type == "pet") {
        const pet = await PetMemorial.findOne({ _id: to });

        if (!pet) {
          res.status(402).send({ msg: "User not found" });
        } else {
          const checkUser = await PetMemorial.findOne({
            _id: to,
          });

          if (checkUser!.owner == from) {
            res.status(402).send({ msg: "You can't donate to yourself" });
          } else {
            const checDonatorBalance = await UserModel.findOne({ _id: from });

            if (checDonatorBalance!.balance < amount) {
              res.status(405).send({ msg: "Insufficient balance" });
            } else {
              const userFrom = await UserModel.findById(from);
              const donate = new DonationModel({
                from: from,
                to: pet!._id,
                amount: amount,
                description: description || "Donation",
                note: note,
                name: userFrom?.firstName + " " + userFrom?.lastName,
              });

              const newDonation = await donate.save();
              const donationId = newDonation._id;

              await PetMemorial.updateOne(
                {
                  _id: pet!._id,
                },
                {
                  $push: {
                    donations: donate._id,
                  },
                }
              );
              const user: any = await UserModel.findOne({ _id: pet!.owner });

              addToWallet(user!._id, amount);

              await UserModel.updateOne(
                {
                  _id: from,
                },
                {
                  $inc: {
                    balance: -amount,
                  },
                }
              );
              const reciver = await PetMemorial.findOne({
                _id: to,
              });
              console.log(reciver);
              if (reciver) {
                const authorTokens = await FCMModel.find({
                  userId: reciver.owner,
                });

                for (const tokenData of authorTokens) {
                  const payload = {
                    title: "Your memorial got donation!",
                    body: `${userFrom?.firstName} ${userFrom?.lastName} Donated to your memorial.`,
                    data: {
                      fromid: from.toString(),
                      toid: reciver.owner.toString(),
                      type: "donation-pet",
                      memorialid: to.toString(),
                      donationid: donationId?.toString(),
                    },
                  };
                  await sendNotification({ token: tokenData.token, payload });
                }
                await emitLikeUpdate(
                  reciver.owner,
                  `${userFrom?.firstName} ${userFrom?.lastName} Donated to your Memorial.`,
                  "Memorial Donation",
                  from,
                  to
                );
              }
              res.status(200).json({ message: "Donated successfully", donate });
            }
          }
        }
      } else {
        const user = await HumanMemorial.findOne({ _id: to });
        const userFrom = await UserModel.findById(from);
        if (!user) {
          res.status(402).send({ msg: "User not found" });
        } else {
          const checkUser = await HumanMemorial.findOne({
            _id: to,
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
                note: note,
                name: userFrom?.firstName + " " + userFrom?.lastName,
              });

              const newDonation = await donate.save();
              const donationId = newDonation._id;

              await HumanMemorial.updateOne(
                {
                  _id: user!._id,
                },
                {
                  $push: {
                    donations: donate._id,
                  },
                }
              );

              const memorial = await HumanMemorial.findOne({ _id: user!._id });

              const mainUser: any = await UserModel.findOne({
                _id: user!.author,
              });

              addToWallet(mainUser!._id, amount);

              await UserModel.updateOne(
                {
                  _id: from,
                },
                {
                  $inc: {
                    balance: -amount,
                  },
                }
              );
              const reciver = await HumanMemorial.findOne({
                _id: to,
              });
              console.log(reciver);
              if (reciver) {
                const authorTokens = await FCMModel.find({
                  userId: reciver.author,
                });

                for (const tokenData of authorTokens) {
                  const payload = {
                    title: "Your memorial got donation!",
                    body: `${userFrom?.firstName} ${userFrom?.lastName} Donated to your memorial.`,
                    data: {
                      fromid: from.toString(),
                      toid: reciver.author.toString(),
                      type: "donation-human",
                      memorialid: to.toString(),
                      donationid: donationId?.toString(),
                    },
                  };
                  await sendNotification({ token: tokenData.token, payload });
                }
                await emitLikeUpdate(
                  reciver.author,
                  `${userFrom?.firstName} ${userFrom?.lastName} Donated to your Memorial.`,
                  "Memorial Donation",
                  from,
                  to
                );
              }
              await sendEmailNonUserDonationSender({
                name:
                  checDonatorBalance!.firstName +
                  " " +
                  checDonatorBalance!.lastName,
                email: checDonatorBalance!.email,
                amount: amount,
                donatedFor: memorial!.name,
                date: new Date().toISOString().split("T")[0],
                type: "Donation",
                confirmation: "Confirmed",
              })
                .then((response: any) => {
                  console.log(response);
                })
                .catch((error) => {
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
                memorialLink: `${process.env.DOMAIN}/memory/human/${
                  memorial!._id
                }`,
                recieverEmail: mainUser!.email,
              })
                .then((response) => {
                  console.log(response);
                })
                .catch((error) => {
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
        _id: to,
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
        name: name || "anonymous",
        email: email || "",
        relation: relation || "",
        note: note || "",
        description: description || "Donation",
      });

      const newDonation: any = await donate.save();
      const reciver = user._id?.toString();
      const sender = newDonation._id.toString();
      if (sender !== reciver) {
        const authorTokens = await FCMModel.find({ userId: reciver });
        console.log(authorTokens);
        for (const tokenData of authorTokens) {
          const payload = {
            title: "Your Memorie got a new Donation!",
            body: `${name} donated to your memorial.`,

            data: {
              fromid: user?._id?.toString(),
              toid: user._id?.toString(),
              type: "non-user-donation",
              memorialid: to.toString(),
            },
          };
          await sendNotification({ token: tokenData.token, payload });
        }

        await emitLikeUpdate(
          reciver,
          `${name} donated to your memorial.`,
          "Non-User Donation",
          sender,
          to
        );
      }

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
};

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
              name:
                checDonatorBalance?.firstName +
                " " +
                checDonatorBalance?.lastName,
              type: flowerType!.type,
            });

            const newDonation = await donateFlower.save();
            const donationId = newDonation._id;

            await UserModel.findOneAndUpdate(
              { _id: from },
              { $inc: { balance: -amount } }
            );

            const mainUser: any = await UserModel.findOne({ _id: pet!.owner });

            addToWalletFlower(mainUser!._id, amount);
            // const reciver = await PetMemorial.findOne({
            //   _id: to,
            // });
            // console.log(reciver);
            if (mainUser) {
              const authorTokens = await FCMModel.find({
                userId: mainUser!._id,
              });

              for (const tokenData of authorTokens) {
                const payload = {
                  title: "Your memorial got donation!",
                  body: `${checDonatorBalance?.firstName} ${checDonatorBalance?.lastName} Donated to your memorial.`,

                  data: {
                    fromid: from.toString(),
                    toid: mainUser!._id.toString(),
                    type: "flower-pet",
                    memorialid: to.toString(),
                    donationid: donationId?.toString(),
                  },
                };
                await sendNotification({ token: tokenData.token, payload });
              }
              await emitLikeUpdate(
                mainUser!._id,
                `${checDonatorBalance?.firstName} ${checDonatorBalance?.lastName} Donated to your Memorial.`,
                "Memorial Donation",
                from,
                to
              );
            }
            console.log("Pet Flower Donation Successful");
            res
              .status(200)
              .json({ message: "Donated successfully", donateFlower });
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
              name:
                checDonatorBalance?.firstName +
                " " +
                checDonatorBalance?.lastName,
              flowerImage: flowerType!.photos,
              type: flowerType!.type,
            });

            const newDonation = await donateFlower.save();
            const donationID = newDonation._id;

            await UserModel.findOneAndUpdate(
              { _id: from },
              { $inc: { balance: -amount } }
            );

            const mainUser: any = await UserModel.findOne({
              _id: user!.author,
            });

            addToWalletFlower(mainUser!._id, amount);

            const reciver = await HumanMemorial.findOne({
              _id: to,
            });
            if (reciver) {
              const authorTokens = await FCMModel.find({
                userId: reciver.author,
              });

              for (const tokenData of authorTokens) {
                const payload = {
                  title: "Your memorial got donation!",
                  body: `${checDonatorBalance?.firstName} ${checDonatorBalance?.lastName} Donated to your memorial.`,

                  data: {
                    fromid: from.toString(),
                    toid: reciver.author.toString(),
                    type: "flower-human",
                    memorialid: to.toString(),
                    donationid: donationID?.toString(),
                  },
                };
                await sendNotification({ token: tokenData.token, payload });
              }
              await emitLikeUpdate(
                reciver.author,
                `${checDonatorBalance?.firstName} ${checDonatorBalance?.lastName} Donated to your memorial.`,
                "Memorial donation",
                from,
                to
              );
            }
            res.status(200).json({
              message: "Donated successfully",
              donateFlower,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

async function fetchDonationHistory(userId: string) {
  try {
    const donationHistory = await DonationModel.find({ to: userId });

    const populatedDonationHistory = await DonationModel.populate(
      donationHistory,
      {
        path: "product",
        model: ProductModel,
      }
    );
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
};

export const likeDonationComment = async (req: Request, res: Response) => {
  try {
    const { postId, likerId } = req.body;

    const likes = await LikeModel.find({
      postId: postId,
      likerId: likerId,
    });
    let user = await UserModel.findById(likerId);

    if (likes.length > 0) {
      await LikeModel.deleteMany({
        postId: postId,
        likerId: likerId,
      });

      await DonationModel.findByIdAndUpdate(postId, { $inc: { likes: -1 } });

      return res
        .status(200)
        .json({ like: false, message: "Note unliked successfully" });
    } else {
      const like = new LikeModel({
        postId: postId,
        Lname: user?.firstName + " " + user?.lastName,
        likerId: likerId,
      });

      const newLike = await like.save();
      const likeId = newLike._id;

      await DonationModel.findByIdAndUpdate(postId, { $inc: { likes: 1 } });

      const donation = await DonationModel.findById(postId);
      // const donator = await HumanMemorial.findById(donation?.to);

      if (donation && user?._id !== likerId) {
        const authorTokens = await FCMModel.find({ userId: donation.from });

        for (const tokenData of authorTokens) {
          const payload = {
            title: "Your comment got a new like!",
            body: `${user?.firstName} ${user?.lastName} liked your comment.`,

            data: {
              fromid: user?._id?.toString(),
              toid: donation.from?.toString(),
              type: "donation-like",
              likeid: likeId?.toString(),
              donationid: postId.toString(),
            },
          };
          await sendNotification({ token: tokenData.token, payload });
        }
        await emitLikeUpdate(
          donation.from,
          `${user?.firstName} ${user?.lastName} liked your comment.`,
          "Memorial Donation",
          likerId,
          postId
        );
      }
      return res
        .status(200)
        .json({ like: true, message: "Note liked successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likeFlowerDonationComment = async (
  req: Request,
  res: Response
) => {
  try {
    const { postId, likerId } = req.body;

    const likes = await LikeModel.find({
      postId: postId,
      likerId: likerId,
    });
    let user = await UserModel.findById(likerId);

    if (likes.length > 0) {
      await LikeModel.deleteMany({
        postId: postId,
        likerId: likerId,
      });

      await FlowerDonationModel.findByIdAndUpdate(postId, {
        $inc: { likes: -1 },
      });

      return res
        .status(200)
        .json({ like: false, message: "Note unliked successfully" });
    } else {
      const like = new LikeModel({
        postId: postId,
        Lname: user?.firstName + " " + user?.lastName,
        likerId: likerId,
      });

      const newLike = await like.save();
      const likeId = newLike._id;

      await FlowerDonationModel.findByIdAndUpdate(postId, {
        $inc: { likes: 1 },
      });

      const flower = await FlowerDonationModel.findById(postId);
      // const donator = await HumanMemorial.findById(flower?.to);
      if (flower && user?._id !== likerId) {
        const authorTokens = await FCMModel.find({ userId: flower?.from });

        for (const tokenData of authorTokens) {
          const payload = {
            title: "Your comment got a new like!",
            body: `${user?.firstName} ${user?.lastName} liked your comment.`,
            data: {
              fromid: user?._id?.toString(),
              toid: flower?.from.toString(),
              type: "flower-like",
              likeid: likeId?.toString(),
              donationid: postId.toString(),
            },
          };
          await sendNotification({ token: tokenData.token, payload });
        }
        await emitLikeUpdate(
          flower?.from,
          `${user?.firstName} ${user?.lastName} liked your comment.`,
          "Memorial comment Like",
          likerId,
          postId
        );
      }
      return res
        .status(200)
        .json({ like: true, message: "Note liked successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const donations = await DonationModel.find();

    res.status(200).json({ donations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

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
        ...(Array.isArray(petDonation[0]) ? petDonation[0] : []),
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
        ...(Array.isArray(humanFlowerDonation[0])
          ? humanFlowerDonation[0]
          : []),
        ...(Array.isArray(petFlowerDonation[0]) ? petFlowerDonation[0] : []),
      ];

      const donationTotal = allDonation.reduce(
        (acc, donation) => acc + donation.amount,
        0
      );
      const flowerTotal = allFlower.reduce(
        (acc, flower) => acc + flower.amount,
        0
      );

      res.status(200).json({
        allDonation: donationTotal,
        allFlower: flowerTotal,
      });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", msg: error });
  }
};

export const claimMoneyDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    
    const user = await UserModel.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const wallet = await WalletModel.findOne({ userId: id });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

   
    if (wallet.balance === 0) {
      return res.status(403).json({ message: "No balance to claim" });
    }

    
    const transfer = await stripe.transfers.create({
      amount: wallet.balance * 100, 
      currency: "usd",
      destination: user.stripeAccountId,
    });

  
    await WalletModel.updateOne({ userId: id }, { $set: { balance: 0 } });


    res.status(200).json({ wallet, transfer });
  } catch (error: any) {
    console.error(error);

    if (error.response && error.response.data) {
      return res.status(500).json({
        message: "Stripe error occurred",
        details: error.response.data,
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const claimFlowerDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const user = await UserModel.findOne({ _id: id });
    var wallet;
    wallet = await WalletModel.findOne({ userId: id });

    const transfer = await stripe.transfers.create({
      amount: wallet!.flower * 100,
      currency: "usd",
      destination: user!.stripeAccountId,
    });

    wallet = await WalletModel.updateOne(
      { userId: id },
      { $set: { flower: 0 } }
    );

    res.status(200).json({ wallet: wallet, transfer: transfer });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", msg: error });
  }
};

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
            email: email,
          });
        }
        res.status(200).json({
          type: "email",
          email: email,
          message: "OTP code sent successfully",
        });
      } else {
        res.status(408).json({ message: "Unable to send Email at the Moment" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", msg: error });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { id, otp } = req.body;

    const user = await UserModel.findById(id);

    const checkOTP = await DonationClaimOtpModel.findOne({
      email: user!.email,
    });

    if (checkOTP!.otp == otp) {
      res.status(200).json({ message: "OTP verified successfully" });
    } else {
      res.status(403).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", msg: error });
  }
};

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
            amount: donation[i].amount,
            type: "Donation",
          });
        } else {
          donors.push({
            name: user!.firstName + " " + user!.lastName,
            note: donation[i].note,
            amount: donation[i].amount,
            type: "Donation",
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
            amount: flower[i].amount,
            type: "Flower Donation",
          });
        } else {
          donors.push({
            name: user!.firstName + " " + user!.lastName,
            note: flower[i].note,
            amount: flower[i].amount,
            type: "Flower Donation",
          });
        }
      }
    }

    if (nonUserDonation) {
      for (let i = 0; i < nonUserDonation.length; i++) {
        donors.push({
          name: nonUserDonation[i].name,
          note: nonUserDonation[i].note,
          amount: nonUserDonation[i].amount,
          type: "Non User Donation",
        });
      }
    }

    donors = donors.filter(
      (donor, index, self) =>
        index === self.findIndex((t) => t.name === donor.name)
    );

    res.status(200).json({
      donors: donors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", msg: error });
  }
};
