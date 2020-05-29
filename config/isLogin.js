const jwt = require("jsonwebtoken");
const { KEY } = require("./");

module.exports = function (req, res, next) {
  try {
    const token = req.cookies.auth;
    if (!token && jwt.verify(token, KEY) === false) {
      res.clearCookie("auth");
      return res.redirect("/admin/login");
    } else {
      return res.redirect("/admin/dashboard");
    }
  } catch {
    res.clearCookie("auth");
    return res.render("adminViews/login");
  }
};
