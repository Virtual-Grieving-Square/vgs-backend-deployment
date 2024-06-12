import express from "express";
import {
  viewDepositPage,
  viewSubscriptionCancelPage,
  viewSubscriptionDowngradePage,
  viewSubscritionUpgradePage
} from "../controller/pages";

const router = express.Router();

// Deposit Emails
router.get("/viewDepositPage", viewDepositPage);

// Subscription Emails
router.get("/viewSubscritionUpgradePage", viewSubscritionUpgradePage);
router.get("/viewSubscriptionDowngradePage", viewSubscriptionDowngradePage);
router.get("/viewSubscriptionCancelPage", viewSubscriptionCancelPage);

export default router;