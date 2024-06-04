import express from "express";
import { weighInsController } from "../controllers/weighInsController";

const router = express.Router();

router.post("/:id", weighInsController.addWeighIn);

export default router;
