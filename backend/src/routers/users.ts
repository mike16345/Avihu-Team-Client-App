import express from "express";
import { UserController } from "../controllers/userController";

const router = express.Router();

// Get all users
router.get("/getItems", UserController.getUsers);

// Update user
router.put("/edit", UserController.updateUser);

// Update users
router.put("/edit/bulk", UserController.updateManyUsers);

// Get user by id
router.get("/getItem/:id", UserController.getUser);

//Delete user
router.delete("/delete", UserController.deleteUser);

// Get user by email
router.get("/byEmail/getItem/:email", UserController.getUserByEmail);

export default router;
