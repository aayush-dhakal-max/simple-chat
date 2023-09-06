const crypto = require("crypto");
const { User, Chat } = require("../model/userModel");

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

const generateKeys = () => {
  return ({ publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  }));
};

const genSign = (data, pri_key) => {
  privateKey = crypto.createPrivateKey({
    key: Buffer.from(pri_key),
    type: "pkcs8",
    format: "pem",
  });

  const sign = crypto.createSign("SHA256");
  sign.write(data);
  sign.end();
  const signature = sign.sign(privateKey).toString("base64");
  return signature;
};

const verifySign = async (req, res) => {
  const { uname, msg } = req.body;

  // Find the public key of user from user database
  const pub_key = await User.findOne({ username: uname })
    .then((data) => {
      return data.pub_key;
    })
    .catch((err) => {
      res
        .status(200)
        .json({ verification: "false", signature: "null", uname: "null" });
    });

  // Find the signature of user from chat database
  const signature = await Chat.findOne({
    postedby: uname,
    message: encMessage(msg), // Encrypt the message and search it in database to find its signature
  }).then((data) => {
    return data.digi_sign;
  });

  publicKey = crypto.createPublicKey({
    key: Buffer.from(pub_key),
    type: "spki",
    format: "pem",
  });

  const verify = crypto.createVerify("SHA256");
  verify.update(msg);
  verify.end();

  const verification = verify
    .verify(publicKey, Buffer.from(signature, "base64"))
    .toString();

  res.status(200).json({
    verification,
    signature,
    uname,
  });
};

module.exports = { generateKeys, genSign, verifySign };
