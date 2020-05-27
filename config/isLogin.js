const jwt = require("jsonwebtoken");
const { KEY } = require("./");

module.exports = function (req, res, next) {
  try {
    const token = req.cookies.auth;
    if (token && jwt.verify(token, KEY))
      return res.redirect("/admin/dashboard");
    res.clearCookie("auth");
    return res.render("adminViews/login");
  } catch {
    res.clearCookie("auth");
    return res.render("adminViews/login");
  }
};
