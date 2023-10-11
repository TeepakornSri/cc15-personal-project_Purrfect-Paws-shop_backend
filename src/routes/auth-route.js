const express = require("express");
const authController = require("../controllers/auth-controller");

const rounter = express.Router();

rounter.post("/register", authController.register);
rounter.post("/login", authController.login);

module.exports = rounter;
