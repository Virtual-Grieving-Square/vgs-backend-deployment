import express from 'express';

// Controllers
import {
  addSubscription,
  handleStripeWebhook,
  purchaseSubscription,
} from '../controller/subscription';

const router = express.Router();

router.post("/addSubscription", addSubscription);
router.post('/create-checkout-session/:local', purchaseSubscription);
router.post("/webhooks/stripe", handleStripeWebhook);

export default router; 