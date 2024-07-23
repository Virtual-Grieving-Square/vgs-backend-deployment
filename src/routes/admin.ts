import express from 'express';
import { login, signup, viewAll } from '../controller/admin';

const router = express.Router();

router.get("/", viewAll);
router.post("/", signup);
router.post('/login', login);

export default router;