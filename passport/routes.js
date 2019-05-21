"use strict";

const path = require("path");
const express = require("express");
const router = express.Router();

router.get("/", function(req, res) {
  if (req.user) {
    res.sendFile(path.join(__dirname, "public/loggedin.html"));
  } else {
    res.sendFile(path.join(__dirname, "public/index.html"));
  }
});

const { passport } = require("./auth");
router.post("/login", passport.authenticate("local"), function(req, res) {
  res.redirect("/");
});

router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

module.exports = router;
