import express from 'express';
import {
  addStripeAccount,
  addStripeAccount2,
  createCheckoutSession,
  createPaymentIntent,
  processPayout,
  stripeBalace,
  transferFunds,
} from '../controller/stripe';

const router = express.Router();

// Get
router.get("/balance", stripeBalace);

router.get('/addStripeAccount/:id', addStripeAccount);
router.post("/transferFunds", transferFunds);
router.post("/createPaymentIntent", createPaymentIntent);
router.post("/process-payout", processPayout);

// Test
router.post("/addStripeAccount2", addStripeAccount2);
router.post("/createCheckoutSession", createCheckoutSession);

export default router; 