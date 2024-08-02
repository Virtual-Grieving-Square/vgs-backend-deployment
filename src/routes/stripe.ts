import express from 'express';
import {
  addStripeAccount,
  addStripeAccount2,
  checkAccountStatus,
  createCheckoutSession,
  createPaymentIntent,
  disconnectAccount,
  logintToAccount,
  processPayout,
  stripeBalace,
  transferFunds,
  updateAccountRegistration,
} from '../controller/stripe';

const router = express.Router();

// Get
router.get("/balance", stripeBalace);

// Account
router.get('/addStripeAccount/:id', addStripeAccount);
router.get("/updateAccountRegistration/:id", updateAccountRegistration);
router.get("/loginToCustomerAccount/:id", logintToAccount);

// Transfer
router.post("/transferFunds", transferFunds);
router.post("/createPaymentIntent", createPaymentIntent);
router.post("/process-payout", processPayout);

// Test
router.post("/checkaccoutStatus", checkAccountStatus);
router.post("/disconectAccount", disconnectAccount)
router.post("/addStripeAccount2", addStripeAccount2);
router.post("/createCheckoutSession", createCheckoutSession);

export default router; 