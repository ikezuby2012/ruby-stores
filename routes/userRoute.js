const express = require("express");
const {
    signup, protect, login, logout, forgetPassword
} = require("../controllers/authControllers");
const {
    getAllUsers, deleteUser, getUser, updateUser, updateMe
} = require("../controllers/userController");

const router = express.Router();

//auth routing
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

//user routing
router.route("/").get(getAllUsers);
router.route('/:id')
    .get(getUser).patch(updateUser).delete(deleteUser);
router.patch("/updateMe", updateMe);

module.exports = router;