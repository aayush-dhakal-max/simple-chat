const express = require("express");
const router = express.Router();

const { register, login, getUsers, getUsername } = require("./auth");

const { saveMessage, getMessages } = require("./message");

const { verifySign } = require("../utils/pki");

// Login Register routes
router.route("/register").post(register);
router.route("/login").post(login);

// User routes
router.route("/getUsers").get(getUsers);
router.route("/getUsername").get(getUsername);

// Message routes
router.route("/saveMessage").post(saveMessage);
router.route("/getMessages").get(getMessages);

// Digital Signature routes
router.route("/verifySign").post(verifySign);

module.exports = router;
