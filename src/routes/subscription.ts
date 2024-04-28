import express from 'express';
import {
  createSubscriptionPlan,
  getAll,
  test
} from '../controller/subscription';

// Controllers


const router = express.Router();

router.get("/getAll", getAll);
router.post("/createSubscriptionPlan", createSubscriptionPlan);
router.post("/test", test);

export default router; 