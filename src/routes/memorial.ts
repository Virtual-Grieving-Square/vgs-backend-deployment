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
  deleteHumanMemorial,
  updateHumanMemorial,
} from "../controller/humanMemorial";

// Pet Memorial
import {
  getAllPetMemorial,
  createPetMemorial,
  fetchpetImage,
  getPetMemorialByUserId,
  getPetById,
  deletePetMemorial,
  // searchPetMemorial,
} from "../controller/pet";

import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// Human Memorial
// Create
router.post("/human/create", upload.single("image"), createHumanMemorial);

// Delete
router.delete("/human/delete/:id", deleteHumanMemorial);

// Get
router.get("/human/getAll", getAllHumanMemorial);
router.get("/human/get/userId/:id", getMemorialByUserId);
router.get("/human/getById/:id", getHumanMemorialById);

// Get Image
router.get("/human/getImage", getImage);

// Search
router.get("/human/search", searchHumanMemorial);

// Update
router.post("/human/update", upload.single("image"), updateHumanMemorial);

// Pet Memorial
router.get('/pet/getAll', getAllPetMemorial);
router.get('/pet/getById/:id', getPetById);
router.post("/pet/create", upload.single("image"), createPetMemorial);
router.get("/pet/get/userId/:id", getPetMemorialByUserId);
router.get("/pet/getImage", fetchpetImage);


// Delete
router.delete("/pet/delete/:id", deletePetMemorial);

// Search Pet
// router.get("/pet/search", searchPetMemorial);

// Get Obituaries 
router.get("/obituaries", getObituaries);


export default router;
