const Mongoose = require("mongoose");

const mydb = `mongodb://127.0.0.1:27017/enc_chat`;
// const mydb = `mongodb://localhost:27017/?directConnection=true`;

const connectDB = async () => {
  await Mongoose.connect(mydb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("MongoDB Connected");
};

module.exports = connectDB;
