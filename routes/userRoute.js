const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const checkUserAuth = require("../middlewares/authmiddleware");

//public router
router.post("/register", UserController.userRegistration);

router.post("/login", UserController.userLogin);

router.post(
  "/send-User-Password-Reset-Email",
  UserController.sendUserPasswordResetEmail
);

//route level middleware
//router.use("/changepassword", usermiddlewares.checkUserAuth);

//protected router
router.post(
  "/changepassword",
  checkUserAuth,
  UserController.changeUserPassword
);

router.get("/loggesuser", checkUserAuth, UserController.loggesUser);

module.exports = router;
