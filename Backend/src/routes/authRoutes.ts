import { Router } from "express";
import {
  registerUser,
  checkHandleAvailability,
  checkEmailAvailability,
  googleAuth,
  loginUser,
} from "../controllers/authController.js";

const router = Router();

router.get("/check-handle", checkHandleAvailability);
router.get("/check-email", checkEmailAvailability);
router.post("/register", registerUser);
router.post("/signup", registerUser); // Alias for signup
router.post("/login", loginUser);
router.post("/signin", loginUser); // Alias for login
router.post("/google", googleAuth);

export default router;

