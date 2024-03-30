import express from 'express';

// Controller
import {
  createPetMemorial
} from '../controller/user/pet';

const router = express.Router();

router.post("/create", createPetMemorial);

export default router; 