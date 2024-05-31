import { Request, Response } from "express";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);

const YOUR_DOMAIN = "http://localhost:3131";

export const addStripeAccount = async (req: Request, res: Response) => {
  try {
    const account = await stripe.accounts.create({
      type: "express",
    });

    res.status(200).json({ account });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, msg: "Internal Server Error" });
  }
}
