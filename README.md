# Choose your own adventure: Authentication with Socket.io

Which one describes you best?

- [I'm adding `socket.io` to an existing Node application that uses `Express` and `Passport`](#authentication-with-socketio-with-express-and-passport)
- [I'm building a single-page application that only uses `socket.io`](#authentication-with-socketio-with-no-passport)

## Authentication with `socket.io` with `Express` and `Passport`

### Why is this blip important to a robust project?

`Express` applications that use `Passport` for user logins can access the currently
logged in user via `req.user`. In order to get access to `req.user` inside `socket.io`
you need to create a `socket.io` middleware function via `io.use()`.

### Code

[From `passport/app.js`](passport/app.js#L32)

```javascript
io.use(function(socket, next) {
  const cookie = socket.handshake.headers.cookie;
  const req = {
    headers: {
      cookie
    }
  };
  session(req, {}, function(err) {
    if (err) {
      console.error("Error running session middleware", err);
    }
    let serializedUser = req.session[passport._key].user;
    if (!serializedUser) {
      next();
      return;
    }
    passport.deserializeUser(serializedUser, function(err, user) {
      if (err) {
        console.error("Error desrializing user", err);
      }
      socket.user = user;
      next();
    });
  });
});
```

### Other benefits

1. Once a user is logged in, their information is securely accessible on the server in both `Express` and `socket.io`.
1. You only need to implement login logic once.
1. Passport logins via OAuth login providers (such as Facebook) are supported.
1. You can use any Express session middleware such as [`express-session`](https://www.npmjs.com/package/express-session) or [`cookie-session`](https://www.npmjs.com/package/cookie-session).

### [See full codebase on GitHub](passport/)

## Authentication with `socket.io` with no `Passport`

### Why is this blip important to a robust project?

We use 
[JSON Web Tokens](https://github.com/auth0/node-jsonwebtoken)
and 
[`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Local_storage)
to implement peristent user authentication (i.e. user login) for applications that use `socket.io`.
We accomplish this goal by defining two `socket.io` message types: `login` and `auth`.
`login` is triggered when a user logs in from a new browser. `auth` is
triggered when a logged in user returns to our site. 

### Code 

[From `json-web-token/app.js`](json-web-token/app.js#L21)

```javascript
io.on("connection", function(socket) {
  socket.user = null;

  socket.on("login", function(data) {
    const { username, password } = data;
    // INSECURE CODE START
    if (username === "user" && password === "pass") {
      // INSECURE CODE END
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
});
```

### Other benefits

1. Once a user is logged in their information is securely accesible via `socket.user`.
1. Session tokens are generated and validated securely via (JSON Web Tokens aka JWT)(https://github.com/auth0/node-jsonwebtoken)
1. User login session length is securely controlled via JWT.
1. Session tokens are stored using `localStorage` on the client. Does not use cookies.

### [See full codebase on GitHub](json-web-token/)
