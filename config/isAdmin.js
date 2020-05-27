const jwt = require("jsonwebtoken");
const { KEY } = require("./");

module.exports = function (data, res) {
  const role = data;
  if (role != "admin" && role != "boss") {
    return res.status(403).redirect("/");
  }
};
