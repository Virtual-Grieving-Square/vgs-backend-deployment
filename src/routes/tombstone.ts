import multer from "multer";
import { Router } from 'express';

// Controllers
import {
  create,
  getAll,
  getById,
  deleteTombstone,
} from '../controller/tombstone';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.get("/getAll", getAll);
router.get("/getById/:id", getById);
router.post("/create", upload.single("image"), create);
router.delete("/delete/:id", deleteTombstone);

export default router;