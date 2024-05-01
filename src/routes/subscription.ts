import express from 'express';
import {
  createSubscriptionPlan,
  getAll,
  pay,
  test,
  stripe_webhook,
  deposit
} from '../controller/subscription';

// Controllers


const router = express.Router();

router.get("/getAll", getAll);
router.post("/createSubscriptionPlan", createSubscriptionPlan);
router.post("/test", test);
router.post("/pay", pay);
router.post("/deposit", deposit);
router.post("/stripe_webhooks", express.raw({ type: 'application/json' }), stripe_webhook);

export default router; 