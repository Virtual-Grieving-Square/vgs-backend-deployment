import multer from "multer";
import { Router } from "express";

// Controllers
import {
  create,
  getAll,
  getById,
  deleteTombstone,
  usersTombstone,
  fetchUsersTombstone,
  getPetTombstone,
  petTombstone,
  getAllPetTombstones,
} from "../controller/tombstone";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.get("/getAll", getAll);
router.get("/getById/:id", getById);
router.post("/create", upload.single("image"), create);
router.delete("/delete/:id", deleteTombstone);

//users tombstone
router.post("/users/create", upload.single("image"), usersTombstone);
router.get("/users/tombstone:userId", fetchUsersTombstone);


// pet Tombstone 
router.post("/pets/create", upload.single("image"), petTombstone);
router.get("/pet/getTombstone:id", getPetTombstone);
router.get("/pet/getAllTombstone", getAllPetTombstones);
export default router;
