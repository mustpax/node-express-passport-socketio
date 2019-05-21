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
  // socket.user is null by default. When a user authenticates, socket.user will
  // be set to an object that contains the details of the logged in user.
  // This allows us to secure other socket.io message types.
  socket.user = null;

  // Client sends a login request when a user tries to log in from a new browser.
  socket.on("login", function(data) {
    const { username, password } = data;
    // The next line is placeholder code with a hardcoded username and password.
    // In a real application, this is where you would look up the user in your database
    // and verify that the stored hashed password matches the password provided in data.
    // INSECURE CODE START
    if (username === "user" && password === "pass") {
      // INSECURE CODE END
      // Create a new JWT token that's valid for 1 week
      // (i.e. the user will have to log in again in 1 week)
      // and sent this token back to the client.
      const token = jwt.sign({ username }, SECRET, {
        expiresIn: "1 week",
        algorithm: JWT_ALGO
      });
      // In a real application, you should store the full database
      // user object here.
      socket.user = { username };
      socket.emit("login-success", { token, username });
    } else {
      socket.emit("login-fail", { error: "Bad username or password" });
    }
  });

  // Client sends an auth request when a logged in user returns to our
  // application.
  socket.on("auth", function(data) {
    const { token } = data;
    try {
      // Use JWT to verify that the token is valid
      const verifiedToken = jwt.decode(token, SECRET, {
        algorithms: [JWT_ALGO]
      });
      // In a real application, you should fetch the user from your
      // database and store it under socket.user
      socket.user = { username: verifiedToken.username };
      socket.emit("auth-success", { username: verifiedToken.username });
    } catch (e) {
      // JWT throws an error if the token is not valid, we catch that error
      // to notify the user
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
