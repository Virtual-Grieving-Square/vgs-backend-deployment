import express from 'express';
import {
  createSubscriptionPlan,
  getAll,
  pay,
  test,
  stripe_webhook
} from '../controller/subscription';

// Controllers


const router = express.Router();

router.get("/getAll", getAll);
router.post("/createSubscriptionPlan", createSubscriptionPlan);
router.post("/test", test);
router.post("/pay", pay);
router.post("/stripe_webhooks", express.raw({ type: 'application/json' }), stripe_webhook);

export default router; 