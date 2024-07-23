import express from 'express';
import { login, signup, viewAll } from '../controller/admin';

const router = express.Router();

router.get("/", viewAll);
router.post('/login', login);
router.post("/signup", signup);

export default router;