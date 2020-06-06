const jwt = require("jsonwebtoken");
const { KEYU } = require("./");

module.exports = function (req, res, next) {
  try {
    const token = req.cookies.auth;
    if (!token && jwt.verify(token, KEYU) === false) {
      res.clearCookie("auth");
      return res.redirect("/login");
    } else {
      return res.redirect("/homepage");
    }
  } catch {
    res.clearCookie("auth");
    return res.render("userViews/login");
  }
};
