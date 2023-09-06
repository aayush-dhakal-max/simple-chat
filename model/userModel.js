const Mongoose = require("mongoose");

const UserSchema = new Mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  pri_key: {
    type: String,
    unique: true,
    required: true,
  },
  pub_key: {
    type: String,
    unique: true,
    required: true,
  },
});

const ChatSchema = new Mongoose.Schema({
  postedby: {
    type: String,
    unique: false,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  digi_sign: {
    type: String,
    required: true,
  },
});

const User = Mongoose.model("users", UserSchema);
const Chat = Mongoose.model("chats", ChatSchema);

module.exports = { User, Chat };
