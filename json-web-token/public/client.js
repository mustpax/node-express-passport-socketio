"use strict";
/* eslint-env browser */
/* global io */

const socket = io.connect();

socket.on("login-success", function(data) {
  let { token, username } = data;
  localStorage.setItem("token", token);
  const usernameDisplay = document.getElementById("logged-in-username");
  usernameDisplay.innerText = username;
  setLogin(true);
});

socket.on("login-fail", function(data) {
  alert("Login failed.");
  setLogin(false);
});

socket.on("auth-success", function(data) {
  const { username } = data;
  const usernameDisplay = document.getElementById("logged-in-username");
  usernameDisplay.innerText = username;
  setLogin(true);
});

socket.on("auth-fail", function(data) {
  setLogin(false);
  localStorage.removeItem("token");
});

function setLogin(isLoggedIn) {
  const loggedIn = document.getElementById("logged-in");
  const loggedOut = document.getElementById("logged-out");
  if (isLoggedIn) {
    loggedIn.classList.remove("hidden");
    loggedOut.classList.add("hidden");
  } else {
    loggedIn.classList.add("hidden");
    loggedOut.classList.remove("hidden");
  }
}

let token = localStorage.getItem("token");
if (token) {
  socket.emit("auth", { token });
} else {
  setLogin(false);
}

function onSubmit(evt) {
  evt.preventDefault();
  console.log("SUBMIT");
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  socket.emit("login", { username, password });
}

function logout(evt) {
  evt.preventDefault();
  localStorage.removeItem("token");
  setLogin(false);
  socket.emit("logout");
}
