import express from "express";
import {register_ejs,login_ejs, login, logout, register } from "../controllers/auth.controller.js";
import { passthroughToken } from "../middleware/passthroughToken.js";

const router = express.Router();




router.get("/register",register_ejs);
router.get("/login", login_ejs);
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

export default router;
