const { Server } = require("socket.io");
const axios = require("axios");
const https = require("https");
const fs = require("fs");
const path = require("path");

const cert = fs.readFileSync(path.join(__dirname, "./keys/cert.pem"));
const key = fs.readFileSync(path.join(__dirname, "./keys/key.pem"));

const httpsAgent = new https.Agent({
  cert,
  key,
  rejectUnauthorized: false,
});

module.exports = (server) => {
  const io = new Server(server);

  io.on("connection", (socket) => {
    socket.on("new-user-joined", (msg) => {
      console.log(`New user joined the chat => ${msg}`);
    });
    socket.on("chat message", (data) => {
      axios.post(
        "https://localhost:5000/api/auth/saveMessage",
        {
          message: data.msg,
          postedby: data.user,
        },
        { httpsAgent }
      );
      io.emit("chat message", { msg: data.msg, username: data.user });
    });
  });
};
