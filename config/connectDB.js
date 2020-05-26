require("dotenv").config();
const mongoose = require("mongoose");

module.exports = mongoose
  .connect(process.env.Mongo_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB Connected...");
  })
  .catch((err) => {
    console.log(err);
  });
