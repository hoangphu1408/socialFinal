const router = require("express").Router();
const {
  registrationAdmin,
  verifyEmailToken,
  loginAdmin,
  listAccAdmin,
} = require("../utils/adminAuth");
const verify = require("../config/verifyToken");
const isLogin = require("../config/isLogin");
const isAdmin = require("../config/isAdmin");

// Display Views

router.get("/test", (req, res) => {
  listAccAdmin(req, res);
});

router.get("/register", (req, res) => {
  return res.render("adminViews/register", {
    layout: "adminLayout",
  });
});

router.get("/login", isLogin, (req, res) => {
  return res.render("adminViews/login");
});

router.get("/verify-mail/:token", async (req, res, next) => {
  await verifyEmailToken(req.params.token, res, next);
});

router.get("/dashboard", verify, (req, res) => {
  isAdmin(req.user.role, res);
  if (req.user.role == "boss") {
    return res.render("adminViews/dashboard", {
      layout: "bossLayout",
    });
  }
  return res.render("adminViews/dashboard", {
    layout: "adminLayout",
  });
});

router.get("/register", verify, (req, res) => {
  isAdmin(req.user.role, res);
  return res.render("adminView/register", {
    layout: "adminLayout",
  });
});

router.get("/logout", (req, res) => {
  res.clearCookie("auth");
  return res.redirect("/admin/login");
});

// Handle POST

router.post("/register", async (req, res) => {
  await registrationAdmin(req.body, "admin", res);
});

router.post("/login", async (req, res) => {
  await loginAdmin(req.body, res);
});

module.exports = router;
