import { Request, Response } from "express";
import { SubscriptionPlanModel } from "../model/subscriptionPlan";
import { Console } from "console";
const stripe = require('stripe')('sk_test_51OymSXFEZ2nUxcULzejGwRxAzINWLkEcSOnnrLpr9n50FyLZaUyZfoxP8jljlN97tW8fdZOycCiH41FIKiR6x82l00LCRfG9TS');

const YOUR_DOMAIN = 'http://localhost:4242';

export const getAll = async (req: Request, res: Response) => {
  try {
    const subscriptions = await SubscriptionPlanModel.find();

    res.status(200).json({
      msg: "All Subscription Plans",
      subscription: subscriptions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error
    });
  }
}

export const createSubscriptionPlan = async (req: Request, res: Response) => {
  try {
    const { name, price, description, details } = req.body;
    await SubscriptionPlanModel.create({
      name: name,
      price: price,
      description: description,
      details: details
    });

    res.status(200).json({
      msg: "Subscription Plan Created"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error
    });
  }
}

export const test = async (req: Request, res: Response) => {
  try {

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: 'price_1PA8MtFEZ2nUxcULpROyvFrW',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${YOUR_DOMAIN}?success=true`,
      cancel_url: `${YOUR_DOMAIN}?canceled=true`,
      automatic_tax: { enabled: true },
    });

    // res.redirect(303, session.url);
    res.status(200).json({
      request: "success",
      session: session
    })

  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error
    });
  }
}