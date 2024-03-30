import express from 'express';

// Controllers
import {
  addSubscription,
  handleStripeWebhook,
} from '../controller/user/subscription';

const router = express.Router();

router.post("/addSubscription", addSubscription);
router.post("/webhooks/stripe", handleStripeWebhook);

export default router; 