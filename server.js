const express = require("express");
const fs = require("fs");
const socketConnection = require("./utils/websocket");
const path = require("path");
const connectDB = require("./db");
const https = require("https");
const app = express();
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middleware/auth.js");

const options = {
  key: fs.readFileSync("utils/keys/key.pem"),
  cert: fs.readFileSync("utils/keys/cert.pem"),
  requestCert: false,
  rejectUnauthorized: false,
};

const server = https.createServer(options, app);
const PORT = 5000;

app.set("view engine", "ejs");

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "views")));

// Routes
app.use("/api/auth", require("./Auth/route"));

app.get("/", (req, res) => res.render("home"));
app.get("/register", (req, res) => res.render("register"));
app.get("/login", (req, res) => res.render("login"));
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
});

app.get("/chat", userAuth, (req, res) => res.render("chat"));
app.get("/user", userAuth, (req, res) => res.render("user"));

socketConnection(server);

server.listen(PORT, () => {
  console.log("listening on https://localhost:5000");
});

module.exports = server;
