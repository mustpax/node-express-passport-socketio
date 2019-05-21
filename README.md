# Choose your own adventure: Authentication with Socket.io

Which one describes you best?

- [I'm adding `socket.io` to an existing Node application that uses `Express` and `Passport`](#)
- [I'm building a single-page application that only uses `socket.io`](#)

## Authentication with `socket.io` with `Express` and `Passport`

### Why is this blip important to a robust project?

`Express` applications that use `Passport` for user logins can access the currently
logged in user via `req.user`. In order to get access to `req.user` inside `socket.io`
you need to set a `socket.io` middleware function via `io.use()`.

### Code

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
1. You can use any Express session middleware such as [`express-session`](https://www.npmjs.com/package/express-session) or [`cookie-session`](https://www.npmjs.com/package/cookie-session)
