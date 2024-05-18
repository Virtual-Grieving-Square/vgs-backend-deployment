import * as fs from 'fs';

// Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!);

// Models
import DepositListModel from "../model/depositList";
import PaymentListModel from "../model/paymentList";
import { UserModel } from '../model/user';


const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET!;

export const stripeWebhook = async (sig: any, event: any, res: any, req: any) => {
  try {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      res.status(407).send(`Webhook Error: ${err.message}`);
      return;
    }

    switch (event['type']) {
      case "checkout.session.completed":
        const checkOutId = event.data.object.id;
        const paymentStatus = event.data.object.payment_status;
        console.log("Payment Status: ", paymentStatus)
        if (paymentStatus === "paid") {

          const checkPaymentType1 = await PaymentListModel.findOne({
            paymentId: checkOutId
          });

          if (checkPaymentType1) {
            const paidd = await PaymentListModel.updateOne({
              paymentId: checkOutId
            }, {
              paid: true
            });

            const user = await PaymentListModel.findOne({
              paymentId: checkOutId
            });

            await UserModel.updateOne({
              _id: user!.userId
            }, {
              paid: true,
              firstTimePaid: true,
            });

            console.log("Paid: ", paidd);
          }

          const checkPaymentType2 = await DepositListModel.findOne({
            paymentId: checkOutId
          });

          if (checkPaymentType2) {
            console.log("Balance Update");

            const doubleCheck = await DepositListModel.findOne({
              paymentId: checkOutId
            });

            if (doubleCheck?.paid) {
              console.log("Already Paid");
            } else {
              const paidd = await DepositListModel.updateOne({
                paymentId: checkOutId
              }, {
                paid: true
              });

              await UserModel.updateOne({
                _id: checkPaymentType2.userId
              }, {
                $inc: {
                  balance: checkPaymentType2.amount
                }
              });
            }
          }
        }
        fs.writeFileSync('event.json', JSON.stringify(event.data.object, null, 2));
        break;
    }

    res.json({ received: true });
  } catch (e) {
    console.error(e);
  }
}