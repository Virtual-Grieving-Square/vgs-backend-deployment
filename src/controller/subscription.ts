import { Request, Response } from "express";
import SubscriptionModel from "../model/Subscription"; // Assuming you have a Subscription model
import { UserModel, User } from '../model/user';

const stripe = require('stripe')('sk_test_51MKj9YAvSHLhFTy6HvITvBfNUCsaaZ0yhChK6fqf3tEC4Jtr5gyW80e50wdG9HqrdQIvmbsgl8ZV6z3qb2DTNLpI000edftruE');

export const addSubscription = async (req: Request, res: Response) => {
  try {
    const { name, price, duration, description } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Please provide name and price for the subscription." });
    }

    const subscription = new SubscriptionModel({
      name,
      price,
      duration,
      description
    });


    await subscription.save();

    res.status(201).json({ message: "Subscription added successfully.", subscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while adding the subscription." });
  }
};



export const purchaseSubscription = async (req: Request, res: Response) => {
  try {
    const { local } = req.params;

    var price = 'price_1P0lbeAvSHLhFTy68CUSmgCJ';

    if (local == "PRO") price = 'price_1P0lbeAvSHLhFTy68CUSmgCJ';
    else if (local == "PLUS") price = 'price_1P0lnEAvSHLhFTy6Pw0DhSPk';
    else if (local == "SPECIAL") price = 'price_1P0lnwAvSHLhFTy6hCVvEOAo';

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: price,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://www.google.com/success.html`,
      cancel_url: `http://www.google.com/cancel.html`,
    });

    res.json({ msg: session.url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while processing the payment.' });
  }
  // const { subscriptionId, userID } = req.body;


  // const subscription = await SubscriptionModel.findById(subscriptionId);


  // if (!subscription) {
  //   return res.status(404).json({ message: 'Subscription not found.' });
  // }
  // const userId = userID;


  // const user: User | null = await UserModel.findById(userId);


  // if (!user) {
  //   return res.status(404).json({ message: 'User not found.' });
  // }

  // const paymentIntent = await stripeClient.paymentIntents.create({
  //   amount: subscription.price * 100,
  //   currency: 'usd',
  //   description: `Subscription purchase: ${subscription.name}`,
  //   metadata: {
  //     userId: user._id.toString(),
  //     subscriptionId: subscription._id.toString(),
  //   },
  // });


  // res.status(200).json({ clientSecret: paymentIntent.client_secret });
};


export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  // let event: stripe.Event;

  try {

    const rawBody = (req as any).rawBody;
    // event = stripeClient.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error: any) {
    console.error(error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // switch (event.type) {
  //   case 'payment_intent.succeeded':
  //     const paymentIntent = event.data.object as stripe.PaymentIntent;
  //     const userId = paymentIntent.metadata.userId;
  //     const subscriptionId = paymentIntent.metadata.subscriptionId;

  //     const user: User | null = await UserModel.findById(userId);

  //     if (!user) {
  //       return res.status(404).json({ message: 'User not found.' });
  //     }

  //     user.subscribed = true;
  //     user.subscriptionType = subscriptionId;
  //     user.subscribedDate = new Date();

  //     await user.save();

  //     console.log(`User ${userId} subscription updated successfully.`);
  //     res.status(200).json({ message: 'User subscription updated successfully.' });
  //     break;

  //   default:
  //     res.status(200).json({ received: true });
  // }
};
