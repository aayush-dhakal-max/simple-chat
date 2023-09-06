const { User } = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateKeys } = require("../utils/pki");

const jwtSecret =
  "4715aed3c946f7b0a38e6b534a9583628d84e96d10fbc04700770d572af3dce43625dd";

exports.register = async (req, res, next) => {
  const keys = generateKeys();
  const { username, password } = req.body;
  if (password.length < 6) {
    return res.status(400).json({ message: "Password less than 6 characters" });
  }
  bcrypt.hash(password, 10).then(async (hash) => {
    await User.create({
      username,
      password: hash,
      pri_key: keys.privateKey,
      pub_key: keys.publicKey,
    })
      .then((user) => {
        const maxAge = 3 * 60 * 60;
        const token = jwt.sign({ id: user._id, username }, jwtSecret, {
          expiresIn: maxAge, // 3hrs
        });
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: maxAge * 1000,
          sameSite: "None",
          secure: true,
        });
        res.status(201).json({
          message: "User successfully created",
          user: user._id,
        });
      })
      .catch((error) =>
        res.status(400).json({
          message: "User not successful created",
          error: error.message,
        })
      );
  });
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  // Check if username and password is provided
  if (!username || !password) {
    return res.status(400).json({
      message: "Username or Password not present",
    });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({
        message: "Login not successful",
        error: "User not found",
      });
    } else {
      // comparing given password with hashed password
      bcrypt.compare(password, user.password).then(function (result) {
        if (result) {
          const maxAge = 3 * 60 * 60;
          const token = jwt.sign(
            { id: user._id, username, role: user.role },
            jwtSecret,
            {
              expiresIn: maxAge, // 3hrs in sec
            }
          );
          res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000, // 3hrs in ms
            sameSite: "None",
            secure: true,
          });
          res.status(201).json({
            message: "User successfully Logged in",
            user: user._id,
          });
        } else {
          res.status(400).json({ message: "Login not succesful" });
        }
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.getUsers = async (req, res, next) => {
  await User.find({})
    .then((users) => {
      const userFunction = users.map((user) => {
        const container = {};
        container.username = user.username;
        return container;
      });
      res.status(200).json({ user: userFunction });
    })
    .catch((err) =>
      res.status(401).json({ message: "Not successful", error: err.message })
    );
};

exports.getUsername = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    const { username } = jwt.verify(token, jwtSecret, (err, decodedToken) => {
      return decodedToken;
    });

    await User.find({ username })
      .then((user) => {
        const userFunction = user.map((user) => {
          const container = {};
          container.username = user.username;
          return container;
        });
        res.status(200).json({ user: userFunction });
      })
      .catch((err) =>
        res.status(401).json({ message: "Not successful", error: err.message })
      );
  }
};
