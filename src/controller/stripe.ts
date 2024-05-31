import { Request, Response } from "express";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);

const YOUR_DOMAIN = "http://localhost:3131";

export const addStripeAccount = async (req: Request, res: Response) => {
  try {
    stripe.accounts.create({
      type: "express",
    }).then((response: any) => {
      const accountId = response.id;
      return accountId;
      // res.status(200).json({ accountId: accountId });
    }).then(async (response: any) => {
      const accountId = response;
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${YOUR_DOMAIN}/refresh`,
        return_url: `${YOUR_DOMAIN}/return`,
        type: 'account_onboarding',
      });

      res.status(200).json({ url: accountLink.url });
    })
      .catch((error: any) => {
        console.error(error);
        res.status(400).json({ error: error, msg: "Error in creating account" });
      })

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, msg: "Internal Server Error" });
  }
}

export const addStripeAccount2 = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const account = await stripe.accounts.create({
      type: "express",
      email: email,
    }).then((response: any) => {
      const accountId = response.id;
      return accountId;
    }).then(async (response: any) => {
      const accountId = response;
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${YOUR_DOMAIN}/refresh`,
        return_url: `${YOUR_DOMAIN}/return`,
        type: 'account_onboarding',
      });

      res.status(200).json({ url: accountLink.url });
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, msg: "Internal Server Error" });
  }
}

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { amount, currency, customerEmail } = req.body;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: "Add Balance",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success.html`,
      cancel_url: `${YOUR_DOMAIN}/cancel.html`,
      customer_email: customerEmail,
    })

    res.status(200).json({ id: session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, msg: "Internal Server Error" });
  }
}

export const transferFunds = async (req: Request, res: Response) => {
  try {
    const { amount, userId } = req.body;

    const transfer = await stripe.transfers.create({
      amount: amount * 100,
      currency: 'usd',
      destination: userId,
    });

    res.status(200).json({ success: true, transfer: transfer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, msg: "Internal Server Error" });
  }
}

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount, currency, customerEmail } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: currency,
      receipt_email: customerEmail,
      metadata: { integration_check: 'accept_a_payment' },
    });

    res.status(200).json({ client_secret: paymentIntent });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, msg: "Internal Server Error" });
  }
}
