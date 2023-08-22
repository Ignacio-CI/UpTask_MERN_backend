import express from 'express';
import { 
    registerUser, 
    authenticateUser, 
    confirmUser, 
    forgotPassword, 
    verifyToken, 
    newPassword,
    profile 
} from "../controllers/userController.js";

import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

// REGISTRATION, CONFIRMATION AND AUTHENTICATION OF USERS 
router.post("/", registerUser) // Create a new User
router.post("/login", authenticateUser) // Authenticate User
router.get("/confirm/:token", confirmUser); // Confirm User
router.post("/forgot-password", forgotPassword); // If User forget its password

router.route("/forgot-password/:token")
    .get(verifyToken) // Token Verification
    .post(newPassword) // Set new password

// USER'S PROFILE ROUTES
router.get("/profile", checkAuth, profile);

export default router;