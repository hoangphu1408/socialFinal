const jwt = require("jsonwebtoken");
const { KEYU } = require("./");

module.exports = function (req, res, next) {
  const token = req.cookies.auth;
  if (!token) return res.status(403).redirect("/login");

  try {
    const verified = jwt.verify(token, KEYU);
    req.user = verified;
    return next();
  } catch (err) {
    res.clearCookie("auth");
    return res.status(400).redirect("/login");
  }
};
