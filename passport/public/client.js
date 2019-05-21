let socket = io.connect();

function checkLogin(evt) {
  evt.preventDefault();
  socket.emit("checkLogin", function(resp) {
    alert(resp);
  });
}
