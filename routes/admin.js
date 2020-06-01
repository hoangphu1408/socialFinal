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
const { dashboardView, registerView } = require("../utils/adminView");

const verify = require("../config/verifyToken");
const isLogin = require("../config/isLogin");
const getData = require("../config/getData");

// Display Views

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
  dashboardView(req.user, res);
});

router.get("/manage", verify, (req, res) => {
  return registerView(req.user, res);
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
