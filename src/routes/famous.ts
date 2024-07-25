import express from "express";
import {
  create,
  createPet,
  deleteData,
  deletePet,
  getAll,
  getAllPet,
  getById,
  getByNumber,
  getImage,
  getRandom,
  getRandomByNumber,
  getRandomByNumberPet
} from "../controller/famous";

import multer from "multer";
import { checkAdminState } from "../middleware/adminState";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Create Famous
router.post("/create", upload.single("image"), checkAdminState, create);

// Get Items
router.get("/getAll", getAll);
router.get('/getById/:id', getById);
router.get("/getRandom", getRandom);
router.get("/getRandom/:id", getRandomByNumber);

router.get("/getByNumber/:number", getByNumber);
router.get('/getImage', getImage);

// Delete Function
router.delete("/delete/:id", checkAdminState, deleteData);

// Pet upload
router.get("/pet/getAll", getAllPet);
router.get("/pet/getById/:id");
router.get("/pet/getRandom",);
router.get("/pet/getRandom/:id", getRandomByNumberPet);

// Create Pet
router.post("/pet/create", upload.single("image"), checkAdminState, createPet);

// Delete Pet
router.delete("/pet/delete/:id", checkAdminState, deletePet);




export default router;
