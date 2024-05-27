import express from 'express';
import {
  createSubscriptionPlan,
  getAll,
  pay,
  test,
  deposit,
  cancelSubscription,
  checkSubscriptions
} from '../controller/subscription';

// Controllers


const router = express.Router();

router.get("/getAll", getAll);
router.post("/createSubscriptionPlan", createSubscriptionPlan);
router.post("/test", test);

// Subscription
router.post("/pay", pay);
router.post("/cancel", cancelSubscription);

router.post("/deposit", deposit);

// Check Subscriptions
router.get("/checkSubscription", checkSubscriptions);

export default router; 