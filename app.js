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

const server = require("http").Server(app);
const io = require("socket.io")(server);

io.use(function(packet, next) {
  const cookie = packet.handshake.headers.cookie;
  const req = {
    headers: {
      cookie
    }
  };
  // TODO explain session middleware
  session(req, {}, function() {
    // TODO handle errors
    let sessionUser = req.session[passport._key].user;
    passport.deserializeUser(sessionUser, function(err, user) {
      // TODO handle errors
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
  socket.on("foo", function() {
    console.log("received message 'foo' from client");
    console.log("sending message 'bar' to client");
    socket.emit("bar");
  });
});

const port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log("Server started. Listening on port", port);
});
