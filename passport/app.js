"use strict";

const express = require("express");
const app = express();

const cookieSession = require("cookie-session");

// TODO ensure production is properly configured

const SECRET = process.env.SECRET || "test secret";
const session = cookieSession({
  keys: [SECRET]
});
app.use(session);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

const { passport } = require("./auth");

app.use(passport.initialize());
app.use(passport.session());

const routes = require("./routes");
app.use(routes);

app.use(express.static("public"));

const server = require("http").Server(app);
const io = require("socket.io")(server);

io.use(function(packet, next) {
  const cookie = packet.handshake.headers.cookie;
  const req = {
    headers: {
      cookie
    }
  };
  // The session middleware function takes 3 arguments: req, res, next
  // (Every Express middleware function takes these same 3 arguments.)
  // req: We create a fake req object that only contains cookies.
  // res: res is not used by session middleware so we pass an empty object.
  // next: This is our callback function that session calls when req.session
  //       is populated.
  session(req, {}, function(err) {
    if (err) {
      console.error("Error running session middleware", err);
    }
    // We read the serializedUser information from req.session.
    // If serializedUser is blank, we can stop processing, because req.user is blank.
    // If serializedUser is not blank, use use passport.deserializeUser() to convert
    // it back to a full user.
    let serializedUser = req.session[passport._key].user;
    if (!serializedUser) {
      next();
      return;
    }
    passport.deserializeUser(serializedUser, function(err, user) {
      if (err) {
        console.error("Error desrializing user", err);
      }
      packet.user = user;
      next();
    });
  });
});

io.on("connection", function(socket) {
  console.log(
    "received new connection. connection id: id %s user: %o",
    socket.id,
    socket.user
  );
  socket.on("checkLogin", function(fn) {
    console.log("checklogin");

    if (socket.user) {
      fn(`You are logged in as ${socket.user.username}`);
    } else {
      fn(`You are logged out`);
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log("Server started. Listening on port", port);
});
