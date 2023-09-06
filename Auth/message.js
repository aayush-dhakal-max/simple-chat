const { Chat, User } = require("../model/userModel");
const crypto = require("crypto");
const { genSign, verifySign } = require("../utils/pki");

const key = "473a365e06a2c3ef2aee5a729d4171632b3854d5f5c36d919092fc21d59e16f8"; // 256-bit encryption key
const iv = "2ca235421da60488dd6df50ae4ba7568"; //Initialization vector

const encMessage = (text) => {
  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key, "hex"),
    Buffer.from(iv, "hex")
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("hex");
};

const decMessage = (text) => {
  let encryptedText = Buffer.from(text, "hex");
  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key, "hex"),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

exports.saveMessage = async (req, res, next) => {
  const { postedby, message } = req.body;

  // Find user in database to get his privatekey
  const pri_key = await User.findOne({ username: postedby }).then((data) => {
    return data.pri_key;
  });

  // Generate sign using the privatekey
  const sign = genSign(message, pri_key);

  await Chat.create({
    postedby: postedby,
    message: encMessage(message), //Message is being encrypted while saving into database
    digi_sign: sign, // Digital signature is also saved in database
  })
    .then((chats) => {})
    .catch((error) => {
      console.log(error.message);
    });
};

exports.getMessages = async (req, res, next) => {
  await Chat.find({})
    .then((messages) => {
      const messageFunction = messages.map((dbmessage) => {
        const messageContainer = {};
        const userContainer = {};
        messageContainer.message = decMessage(dbmessage.message); // Message is being decrypted before sending to the client
        userContainer.postedby = dbmessage.postedby;
        return { messageContainer, userContainer };
      });
      res.status(200).json({ messages: messageFunction });
    })
    .catch((err) =>
      res.status(401).json({ message: "Not successful", error: err.message })
    );
};
