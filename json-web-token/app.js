"use strict";

const express = require("express");
const app = express();

// TODO ensure production is properly configured

const SECRET = process.env.SECRET || "test secret";

app.use(express.static("public"));

const routes = require("./routes");
app.use(routes);

const server = require("http").Server(app);
const io = require("socket.io")(server);

const jwt = require("jsonwebtoken");
const JWT_ALGO = "HS512";

io.on("connection", function(socket) {
  // TODO explain
  socket.user = null;

  socket.on("login", function(data) {
    const { username, password } = data;
    if (username === "user" && password === "pass") {
      const token = jwt.sign({ username }, SECRET, {
        expiresIn: "1 week",
        algorithm: JWT_ALGO
      });
      socket.user = { username };
      socket.emit("login-success", { token, username });
    } else {
      socket.emit("login-fail", { error: "Bad username or password" });
    }
  });

  socket.on("auth", function(data) {
    const { token } = data;
    try {
      const verifiedToken = jwt.decode(token, SECRET, {
        algorithms: [JWT_ALGO]
      });
      socket.user = { username: verifiedToken.username };
      socket.emit("auth-success", { username: verifiedToken.username });
    } catch (e) {
      socket.emit("auth-fail", { error: e.message });
    }
  });

  socket.on("logout", function(data) {
    socket.user = null;
  });

  socket.use(function(packet, next) {
    let [_, data] = packet;
    console.log({ data });
    next();
  });

  socket.on("try", function(respFn) {
    const { user } = socket;
    console.log({ user });

    if (user) {
      respFn({ success: true });
    } else {
      respFn({ error: "Not logged in" });
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log("Server started. Listening on port", port);
});
