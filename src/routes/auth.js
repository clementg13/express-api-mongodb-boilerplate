var express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/routes/auth/authMiddlewares.js");

var router = express.Router();

router.post("/register", authMiddleware.register, authController.register);
router.post("/login", authMiddleware.login, authController.login);
router.post(
    "/verify-otp",
    authMiddleware.verifyConfirm,
    authController.verifyConfirm
);
router.post(
    "/resend-verify-otp",
    authMiddleware.resendConfirmOtp,
    authController.resendConfirmOtp
);

module.exports = router;
