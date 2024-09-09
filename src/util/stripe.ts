// Stripe
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);

// Models
import DepositListModel from "../model/depositList";
import { DonationModel } from "../model/donation";
import { DonationNonUserModel } from "../model/donationNonUser";
import { HumanMemorial } from "../model/humanMemorial";
import PaymentListModel from "../model/paymentList";
import { SubscriptionPlanModel } from "../model/subscriptionPlan";
import UpgreadModel from "../model/upgrade";
import { UserModel } from "../model/user";
import { dateGetDate, dateGetTime } from "./date";
import {
  sendDepositConfirmation,
  sendEmailNonUserDonationReceiver,
  sendEmailNonUserDonationSender,
  sendEmailSubscriptionUpgraded,
} from "./email";
import { addToWallet } from "./wallet";

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET!;

export const stripeWebhook = async (
  sig: any,
  event: any,
  res: any,
  req: any
) => {
  try {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("event", event);
      console.log("event type", event["type"]);
      switch (event["type"]) {
        case "checkout.session.completed":
          handleCheckoutSessionCompleted(event);
          break;
        case "payment_intent.succeeded":
          handlePaymentSucceeded(event.data.object);
          break;
        case "invoice.payment_failed":
          handlePaymentFailed(event.data.object);
          break;
        case "customer.subscription.deleted":
          handleSubscriptionCanceled(event.data.object);
          break;
        case "customer.subscription.updated":
          handleSubscriptionUpdated(event.data.object);
          break;
      }

      res.json({ received: true });
    } catch (err: any) {
      console.error(err);
      res.status(407).send(`Webhook Error: ${err.message}`);
      return;
    }
  } catch (e) {
    console.error(e);
  }
};

function handlePaymentSucceeded(invoice: any) {
  const subscriptionId = invoice.subscription;
  const metadata = invoice.metadata;
}

async function handleCheckoutSessionCompleted(event: any) {
  console.log("checkout session started");
  const checkOutId = event.data.object.id;
  const paymentStatus = event.data.object.payment_status;
  console.log("Payment Status: ", paymentStatus);
  console.log("CheckoutId", checkOutId);
  if (paymentStatus === "paid") {
    // Check Subscription Payment
    const CheckSubscriptionPayment = await PaymentListModel.findOne({
      paymentId: checkOutId,
    });
    console.log("check subscription payment", CheckSubscriptionPayment);
    if (CheckSubscriptionPayment) {
      console.log("check subscription payment inside");
      const paidd = await PaymentListModel.updateOne(
        {
          paymentId: checkOutId,
        },
        {
          paid: true,
        }
      );

      const user = await PaymentListModel.findOne({
        paymentId: checkOutId,
      });

      console.log("user", user);

      await UserModel.updateOne(
        {
          _id: user!.userId,
        },
        {
          subscribed: true,
          paid: true,
          firstTimePaid: true,
          subscriptionId: event.data.object.subscription,
        }
      );

      console.log("Paid: ", paidd);
    }

    // Check Deposit Payment
    const CheckDeposit = await DepositListModel.findOne({
      paymentId: checkOutId,
    });

    if (CheckDeposit) {
      console.log("Balance Update");

      const doubleCheck = await DepositListModel.findOne({
        paymentId: checkOutId,
      });

      if (doubleCheck?.paid) {
        console.log("Already Paid");
      } else {
        const paidd = await DepositListModel.updateOne(
          {
            paymentId: checkOutId,
          },
          {
            paid: true,
          }
        );

        await UserModel.updateOne(
          {
            _id: CheckDeposit.userId,
          },
          {
            $inc: {
              balance: CheckDeposit.amount,
            },
          }
        );

        const user = await UserModel.findOne({ _id: CheckDeposit.userId });

        // Send Deposit Successful Email
        sendDepositConfirmation({
          name: user!.firstName + " " + user!.lastName,
          email: user!.email,
          amount: CheckDeposit.amount,
          date: new Date().toISOString().split("T")[0],
        })
          .then((response) => {
            console.log(response);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }

    // Upgrade Function
    const CheckUpgrade = await UpgreadModel.findOne({
      paymentId: checkOutId,
    });

    if (CheckUpgrade) {
      const userInfo = await UserModel.findById(CheckUpgrade.userId);

      const subscrptionType = await SubscriptionPlanModel.findOne({
        label: CheckUpgrade.upgreadType,
      });

      if (userInfo && subscrptionType) {
        if (userInfo.subscriptionType == "free") {
          // Update User Model
          await UserModel.updateOne(
            {
              _id: userInfo.id,
            },
            {
              subscriptionType: CheckUpgrade.upgreadType,
              subscriptionId: event.data.object.subscription,
              storage: subscrptionType.storagePerk,
              firstTimePaid: true,
              paid: true,
              subscribed: true,
            }
          );

          const user = await UserModel.findById(userInfo.id);

          // Update Upgrade Model
          await UpgreadModel.updateOne(
            { paymentId: checkOutId },
            {
              paid: true,
            }
          );

          await sendEmailSubscriptionUpgraded({
            name: userInfo!.firstName + " " + userInfo!.lastName,
            email: userInfo!.email,
            subscription:
              CheckUpgrade.upgreadType == "silver" ? "Silver" : "Gold",
            date: dateGetDate(CheckUpgrade!.createdAt),
            payment: CheckUpgrade.upgreadType == "silver" ? "5.00" : "9.99",
            time: dateGetTime(CheckUpgrade!.createdAt),
          })
            .then((response) => {
              console.log(response);
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          if (userInfo.subscriptionId != "") {
            stripe.subscriptions
              .cancel(userInfo.subscriptionId)
              .then(async (response: any) => {
                const status = response.status;
                if (status == "canceled") {
                  // Update User Model
                  await UserModel.updateOne(
                    {
                      _id: userInfo.id,
                    },
                    {
                      subscriptionType: CheckUpgrade.upgreadType,
                      subscriptionId: event.data.object.subscription,
                      storage: subscrptionType.storagePerk,
                      subscribed: true,
                      firstTimePaid: true,
                      paid: true,
                    }
                  );

                  // Update User Model
                  await UpgreadModel.updateOne(
                    { paymentId: checkOutId },
                    {
                      paid: true,
                    }
                  );

                  await sendEmailSubscriptionUpgraded({
                    name: userInfo!.firstName + " " + userInfo!.lastName,
                    email: userInfo!.email,
                    subscription:
                      CheckUpgrade.upgreadType == "silver" ? "Silver" : "Gold",
                    date: dateGetDate(CheckUpgrade!.createdAt),
                    payment:
                      CheckUpgrade.upgreadType == "silver" ? "5.00" : "9.99",
                    time: dateGetTime(CheckUpgrade!.createdAt),
                  })
                    .then((response) => {
                      console.log(response);
                    })
                    .catch((error) => {
                      console.error(error);
                    });
                } else {
                  throw "couldnt cancel request";
                }
              });
          } else {
            // Update User Model
            await UserModel.updateOne(
              {
                _id: userInfo.id,
              },
              {
                subscriptionType: CheckUpgrade.upgreadType,
                subscriptionId: event.data.object.subscription,
                storage: subscrptionType.storagePerk,
                firstTimePaid: true,
                subscribed: true,
                paid: true,
              }
            );

            // Update Upgrade Model
            await UpgreadModel.updateOne(
              { paymentId: checkOutId },
              {
                paid: true,
              }
            );

            await sendEmailSubscriptionUpgraded({
              name: userInfo!.firstName + " " + userInfo!.lastName,
              email: userInfo!.email,
              subscription:
                CheckUpgrade.upgreadType == "silver" ? "Silver" : "Gold",
              date: dateGetDate(CheckUpgrade!.createdAt),
              payment: CheckUpgrade.upgreadType == "silver" ? "5.00" : "9.99",
              time: dateGetTime(CheckUpgrade!.createdAt),
            })
              .then((response) => {
                console.log(response);
              })
              .catch((error) => {
                console.error(error);
              });
          }
        }
      } else {
        throw "Error fetching users selection";
      }
    }

    // Non-User Donation
    const checkNonUserDonation = await DonationNonUserModel.findOne({
      paymentId: checkOutId,
    });

    if (checkNonUserDonation) {
      // Update Donation Model
      await DonationNonUserModel.updateOne(
        { paymentId: checkOutId },
        {
          paid: true,
        }
      );

      const donate = new DonationModel({
        to: checkNonUserDonation.to,
        amount: checkNonUserDonation.amount,
        note: checkNonUserDonation.note || "",
        name: checkNonUserDonation.name || "",
        relation: checkNonUserDonation.relation || "",
        description: checkNonUserDonation.description || "Donation",
      });

      await donate.save();

      // Update Human Memorial
      await HumanMemorial.updateOne(
        { _id: checkNonUserDonation.to },
        {
          $push: {
            donations: donate._id,
          },
        }
      );

      const humanMemorial = await HumanMemorial.findOne({
        _id: checkNonUserDonation.to,
      });

      const mainUser: any = await UserModel.findOne({
        _id: humanMemorial!.author,
      });

      addToWallet(mainUser!._id, checkNonUserDonation.amount);

      await sendEmailNonUserDonationSender({
        name: checkNonUserDonation.name,
        email: checkNonUserDonation.email,
        amount: checkNonUserDonation.amount,
        donatedFor: humanMemorial!.name,
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
        email: checkNonUserDonation.email,
        amount: checkNonUserDonation.amount,
        donatedFor: humanMemorial!.name,
        date: new Date().toISOString().split("T")[0],
        type: "Donation",
        confirmation: "Confirmed",
        memorialLink: `${process.env.DOMAIN}/memory/human/${
          checkNonUserDonation!.to
        }`,
        recieverEmail: mainUser!.email,
      })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }
}

// subscription end and failure

// Handles payment failed
async function handlePaymentFailed(invoice: any) {
  const subscriptionId = invoice.subscription;
  const customerId = invoice.customer;
  // const user = await UserModel.findOne({ subscriptionId });
  console.log(`Payment failed for user ${customerId}`);
}

// Handles subscription cancellation (either automatic or manual)
async function handleSubscriptionCanceled(subscription: any) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer;
  const user = await UserModel.findOne({ subscriptionId });

  if (user) {
    await UserModel.updateOne(
      { _id: user._id },
      {
        subscribed: false,
        subscriptionId: "",
        paid: false,
        firstTimePaid: false,
      }
    );
    console.log(`Subscription canceled for user ${user.email}`);
  }
}

// Handles subscription updates
async function handleSubscriptionUpdated(subscription: any) {
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const user = await UserModel.findOne({ subscriptionId });

  if (user) {
    if (status === "active") {
      await UserModel.updateOne(
        { _id: user._id },
        { subscribed: true, paid: true, firstTimePaid: true }
      );
      console.log(`Subscription updated for user ${user.email}`);
    } else if (status === "canceled") {
      await UserModel.updateOne(
        { _id: user._id },
        {
          subscribed: false,
          subscriptionId: "",
          paid: false,
          firstTimePaid: false,
        }
      );
      console.log(`Subscription canceled for user ${user.email}`);
    }
  }
}
