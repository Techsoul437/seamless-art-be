import express from "express";
import { getAllSubscribers, subscribe} from "../../controllers/newsletterController.js";

const router = express.Router();

router.post("/", subscribe);
router.get("/", getAllSubscribers);

export default router;