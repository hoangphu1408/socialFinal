const router = require("express").Router();
const bodyParser = require("body-parser");
// Require Handle
const {
  registrationAdmin,
  verifyEmailToken,
  resendMail,
  loginAdmin,
  isAdmin,
  updateAdmin,
  updatePasswordAd,
  updateActivation,
  deleteAdmin,
  createLimit,
  registrationResident,
  updateResident,
  deleteResident,
  accountResident,
  createFlat,
  updateFlat,
  announceManage,
} = require("../utils/adminAuth");
// Require View
const {
  dashboardView,
  registerView,
  flatView,
  registerResidentView,
  accountResidentView,
  announceView,
} = require("../utils/adminView");

const verify = require("../config/verifyToken");
const isLogin = require("../config/isLogin");
const getData = require("../config/getData");

// Display Views

router.get("/login", isLogin, (req, res) => {
  return res.render("adminViews/login");
});
// Mail Activation
router.get("/verify-mail", getData, (req, res) => {
  try {
    return res.render("adminViews/verifyMail", {
      email: req.user.email,
    });
  } catch (err) {
    return res.status(400);
  }
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

router.get("/flat-manage", verify, (req, res) => {
  flatView(req.user, res);
});

router.get("/resident-manage", verify, (req, res) => {
  return registerResidentView(req.user, res);
});

router.get("/resident-account", verify, (req, res) => {
  return accountResidentView(req.user, res);
});

router.get("/manage", verify, (req, res) => {
  return registerView(req.user, res);
});

router.get("/announce-manage", verify, (req, res) => {
  return announceView(req.user, res);
});

router.get("/logout", (req, res) => {
  res.clearCookie("auth");
  return res.redirect("/admin/login");
});

// Handle POST

router.post("/manage", verify, async (req, res) => {
  await registrationAdmin(req.body, req.user.email, "admin", res);
});

router.post("/login", async (req, res) => {
  await loginAdmin(req.body, res);
});

router.post("/verify-mail", createLimit, async (req, res) => {
  await resendMail(req.body.email, res);
  return res.json(req.body);
});

router.post("/resident-manage", verify, async (req, res) => {
  await registrationResident(req.body, req.user, res);
});
// Edit Admin
router.post("/update/:id", verify, async (req, res) => {
  await updateAdmin(req.body, res);
});

router.post("/update_password/:id", verify, async (req, res) => {
  await updatePasswordAd(req.body, res);
});

router.post("/active/:id", verify, async (req, res) => {
  await updateActivation(req.body, res);
});

router.get("/delete/:id", verify, async (req, res) => {
  await deleteAdmin(req.params.id, res);
});

// Edit Resident
router.post("/resident-update/:id", verify, async (req, res) => {
  await updateResident(req.body, res);
});

router.get("/resident-delete/:id", verify, async (req, res) => {
  await deleteResident(req.params.id, res);
});

// Resident Account
router.post("/resident-account", verify, async (req, res) => {
  await accountResident(req.body, req.user.email, res);
});

// Edit Flat
router.post("/flat-manage", verify, async (req, res) => {
  await createFlat(req.body, req.user.email, res);
});

router.post("/flat-update", verify, async (req, res) => {
  await updateFlat(req.body, res);
});

// Announce
router.post("/announce-manage", verify, async (req, res) => {
  await announceManage(req.body, res);
});

module.exports = router;
