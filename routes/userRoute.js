const express = require("express");

const { 
    signUp, protect, login, logout, forgetPassword  
} = require("../controllers/authControllers");

const router = express.Router();

//auth routing
router.post("/signup", signUp);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;