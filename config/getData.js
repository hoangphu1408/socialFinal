const jwt = require("jsonwebtoken");
const { KEY } = require("./");

module.exports = function (req, res, next) {
  const token = req.cookies.auth;
  if (!token) return res.status(403).redirect("/admin/login");

  try {
    const verified = jwt.verify(token, KEY);
    req.user = verified;
    return next();
  } catch (err) {
    res.clearCookie("auth");
    return res.status(400).redirect("/admin/login");
  }
};
