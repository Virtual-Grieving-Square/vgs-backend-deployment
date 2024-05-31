import express from 'express';
import { addStripeAccount, addStripeAccount2, createCheckoutSession, createPaymentIntent, transferFunds } from '../controller/stripe';

const router = express.Router();

router.get('/addStripeAccount', addStripeAccount);
router.post("/transferFunds", transferFunds);
router.post("/createPaymentIntent", createPaymentIntent);

// Test
router.post("/addStripeAccount2", addStripeAccount2);
router.post("/createCheckoutSession", createCheckoutSession);

export default router; 