const router = require("express").Router();
// Require Handle
const {
  registrationAdmin,
  verifyEmailToken,
  resendMail,
  loginAdmin,
  listAccAdmin,
  isBoss,
  isAdmin,
  createLimit,
} = require("../utils/adminAuth");
// Require View
const { registerView } = require("../utils/adminView");

const verify = require("../config/verifyToken");
const isLogin = require("../config/isLogin");
const getData = require("../config/getData");

// Display Views

router.get("/test", verify, (req, res) => {
  return registerView(req.user, res);
});
router.get("/z2", verify, (req, res) => {
  return registerView(req.user, res);
});

router.get("/login", isLogin, (req, res) => {
  return res.render("adminViews/login");
});
// Mail Activation
router.get("/verify-mail", getData, (req, res) => {
  return res.render("adminViews/verifyMail", {
    email: req.user.email,
  });
});

router.get("/back-to-dashboard", (req, res) => {
  return res.render("adminViews/backtoDashboard");
});

router.get("/verify-mail/:token", async (req, res, next) => {
  await verifyEmailToken(req.params.token, res, next);
});
// Interface
router.get("/dashboard", verify, (req, res) => {
  isAdmin(req.user.role, res);
  if (req.user.role == "boss") {
    return res.render("adminViews/dashboard", {
      layout: "bossLayout",
      user: req.user,
    });
  }
  return res.render("adminViews/dashboard", {
    layout: "adminLayout",
    user: req.user,
  });
});

router.get("/register", verify, (req, res) => {
  isBoss(req.user.role, res);
  return res.render("adminViews/register", {
    layout: "bossLayout",
    user: req.user,
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

router.post("/verify-mail", createLimit, async (req, res) => {
  await resendMail(req.body.email, res);
  return res.json(req.body);
});

module.exports = router;
