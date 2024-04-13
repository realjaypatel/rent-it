import express from "express";
import {verifyToken} from "../middleware/verifyToken.js";
import { Home,Profile, Search, getPost,Error, getUser } from "../controllers/front.controller.js";
import {passthroughToken} from "../middleware/passthroughToken.js"
const router = express.Router();

router.get("/",passthroughToken,Home);
router.get("/profile",verifyToken,Profile);
router.get("/search",passthroughToken,Search);
router.get("/place/:id",passthroughToken,getPost);
router.get("/user/:id",passthroughToken,getUser);
router.use(passthroughToken,Error)
export default router;
