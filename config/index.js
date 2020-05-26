require("dotenv").config();
module.exports = {
  KEY: process.env.SECRET_KEY,
  MAIL: process.env.SECRET_MAIL,
  PORT: process.env.PORT || 5000,
  EMAIL: process.env.EMAIL,
  PASSWORD: process.env.PASSWORD,
};
