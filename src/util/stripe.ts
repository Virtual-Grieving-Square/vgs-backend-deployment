// Stripe
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);

// Models
import DepositListModel from "../model/depositList";
import { DonationModel } from "../model/donation";
import PaymentListModel from "../model/paymentList";
import { SubscriptionPlanModel } from "../model/subscriptionPlan";
import UpgreadModel from "../model/upgrade";
import { UserModel } from "../model/user";

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

      switch (event["type"]) {
        case "checkout.session.completed":
          handleCheckoutSessionCompleted(event);
          break;
        case "payment_intent.succeeded":
          handlePaymentSucceeded(event.data.object);
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
  const checkOutId = event.data.object.id;
  const paymentStatus = event.data.object.payment_status;
  console.log("Payment Status: ", paymentStatus);

  if (paymentStatus === "paid") {

    // Check Subscription Payment
    const CheckSubscriptionPayment = await PaymentListModel.findOne({
      paymentId: checkOutId,
    });

    if (CheckSubscriptionPayment) {
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
              paid: true,
              subscribed: true,
            }
          );

          // Update Upgrade Model
          await UpgreadModel.updateOne(
            { paymentId: checkOutId },
            {
              paid: true
            }
          );
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
                      paid: true,
                    }
                  );

                  // Update User Model
                  await UpgreadModel.updateOne(
                    { paymentId: checkOutId },
                    {
                      paid: true
                    }
                  );

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
                subscribed: true,
                paid: true,
              }
            );

            // Update Upgrade Model
            await UpgreadModel.updateOne(
              { paymentId: checkOutId },
              {
                paid: true
              }
            );
          }
        }

      } else {
        throw "Error fetching users selection";
      }
    }

    // Donation Model 
    // conW

  }
}
