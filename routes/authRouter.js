const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/request-otp", authController.requestOtp);
router.post("/verify-otp-login", authController.verifyOtpLogin);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getMe);
router.post("/verify-email", protect, authController.verifyEmail);
router.post("/verify-phone", protect, authController.verifyPhone);

module.exports = router;
