const express = require("express");
const authController = require("../controllers/auth-controller");
const authenticateMiddleware = require("../middlewares/authenticate");
const rounter = express.Router();

rounter.post("/register", authController.register);
rounter.post("/login", authController.login);
rounter.get("/me", authenticateMiddleware, authController.getMe);
rounter.patch(
  "/updateprofile",
  authenticateMiddleware,
  authController.updateprofile
);
rounter.get("/getallusers", authenticateMiddleware, authController.GetAllUser);

module.exports = rounter;
