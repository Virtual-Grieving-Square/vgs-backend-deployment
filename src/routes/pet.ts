import express from 'express';

// Controller
import {
  createPetMemorial
} from '../controller/pet';

const router = express.Router();

router.post("/create", createPetMemorial);

export default router; 