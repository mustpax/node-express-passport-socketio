"use strict";

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
passport.use(
  new LocalStrategy(function(username, password, done) {
    // TODO explain why this is bad
    // NOT SECURE
    done(null, {
      username
    });
    // END NOT SECURE
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  done(null, { username });
});

module.exports = { passport };
