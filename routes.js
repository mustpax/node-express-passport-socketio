"use strict";

const path = require("path");
const express = require("express");
const router = express.Router();

router.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

const { passport } = require("./auth");
router.post("/login", passport.authenticate("local"), function(req, res) {
  res.send(`Success! Logged in as ${req.user.username}`);
});

router.get("/user", function(req, res) {
  if (req.user) {
    res.send(`You are logged in as ${req.user.username}`);
  } else {
    res.send("You are not logged in");
  }
});

router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/user");
});

module.exports = router;
