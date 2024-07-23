import express from 'express';
import { login, signup } from '../controller/admin';
import { getFeePercentage, setFeePercentage } from '../controller/Admin/FeePercentage';

const router = express.Router();

router.post('/login', login);
router.post("/signup", signup);

router.post("/admin/addFee", setFeePercentage);
router.post("/admin/getFee", getFeePercentage);
export default router;