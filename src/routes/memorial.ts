import express from "express";

// Human Memorial
import {
  createHumanMemorial,
  getAllHumanMemorial,
  getMemorialByUserId,
  getImage,
  getObituaries,
  getHumanMemorialById,
  searchHumanMemorial,
} from "../controller/humanMemorial";
// Pet Memorial

import {
  getAllPetMemorial,
  createPetMemorial,
  fetchpetImage,
  getPetMemorialByUserId,
  getPetById,
  // searchPetMemorial,
} from "../controller/pet";

import multer from "multer";
import { removeSpaces } from "../util/removeSpace";

const router = express.Router();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
// Human Memorial
// Get
router.get("/human/getAll", getAllHumanMemorial);
router.get("/human/get/userId/:id", getMemorialByUserId);
router.get("/human/getById/:id", getHumanMemorialById);

// Get Image
router.get("/human/getImage", getImage);

// Search
router.get("/human/search", searchHumanMemorial);

// Create
router.post("/human/create", upload.single("image"), createHumanMemorial);

// Pet Memorial
router.get('/pet/getAll', getAllPetMemorial);
router.get('/pet/getById/:id', getPetById);
router.post("/pet/create", upload.single("image"), createPetMemorial);
router.get("/pet/get/userId/:id", getPetMemorialByUserId);
router.get("/pet/getImage", fetchpetImage);

// Search Pet
// router.get("/pet/search", searchPetMemorial);


// Get Obituaries 
router.get("/obituaries", getObituaries);


export default router;
