const express = require("express");
const { createNewContact, deleteContact } = require("../controllers/contactController")
const router = express.Router();

router.route("/").post(createNewContact);
router.route("/:id").delete(deleteContact);

module.exports = router