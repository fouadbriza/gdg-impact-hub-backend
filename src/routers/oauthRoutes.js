import express from "express";
import {googleCallback, googleLogin, githubLogin, githubCallback} from "../controllers/oauthController.js"; 

const router = express.Router();


router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);

export default router;