import express from 'express';
import { login, signup, viewAll } from '../controller/admin';
import { getFeePercentage, setFeePercentage } from '../controller/Admin/FeePercentage';

const router = express.Router();

router.get("/", viewAll);
router.post('/login', login);
router.post("/signup", signup);

router.post("/admin/addFee", setFeePercentage);
router.post("/admin/getFee", getFeePercentage);
export default router;