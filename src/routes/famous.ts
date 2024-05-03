import express from 'express';
import { create, getAll, getByNumber } from '../controller/famous';

const router = express.Router();

router.get("/getAll", getAll);
router.get("/getByNumber/:number", getByNumber);
router.post("/create", create);

export default router; 