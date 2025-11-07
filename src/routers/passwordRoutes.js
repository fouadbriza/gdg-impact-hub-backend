import express from "express";
import { resetPassword, forgotPassword } from "../controllers/passwordController.js"; 

const router = express.Router();


router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;