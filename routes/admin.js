const router = require("express").Router();
// Require Handle
const {
  registrationAdmin,
  verifyEmailToken,
  resendMail,
  loginAdmin,
  isAdmin,
  updateAdmin,
  changePasswordAd,
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
  deleteFlat,
  announceManage,
  announceUpdate,
  announceDelete,
  sendEmailPassword,
  changePWDAD,
  electricManage,
  electricBillUpdate,
  electricBillDelete,
  waterManage,
  waterBillUpdate,
  waterBillDelete,
} = require("../utils/adminAuth");
// Require View
const {
  dashboardView,
  changePasswordView,
  registerView,
  flatView,
  registerResidentView,
  accountResidentView,
  announceView,
  postView,
  electricView,
  waterView,

  test,
} = require("../utils/adminView");

const verify = require("../config/verifyToken");
const isLogin = require("../config/isLogin");
const getData = require("../config/getData");

// Display Views

router.get("/test", (req, res) => {
  return test(req, res);
});

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

router.get("/verify-mail/:token", async (req, res) => {
  await verifyEmailToken(req.params.token, res);
});
// Interface
router.get("/dashboard", verify, (req, res) => {
  dashboardView(req.user, res);
});

router.get("/send-mail-pw", verify, (req, res) => {
  changePasswordView(req.user, res);
});

router.get("/change-password/:token", async (req, res) => {
  await changePasswordAd(req.params.token, res);
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

router.get("/post-manage", verify, (req, res) => {
  return postView(req.user, res);
});

router.get("/electric-bill-manage", verify, (req, res) => {
  return electricView(req.user, res);
});

router.get("/water-bill-manage", verify, (req, res) => {
  return waterView(req.user, res);
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

router.post("/send-mail-pw", createLimit, verify, async (req, res) => {
  await sendEmailPassword(req.body.email, res);
});

router.post("/verify-mail", createLimit, async (req, res) => {
  await resendMail(req.body.email, res);
  return res.json(req.body);
});

router.post("/resident-manage", verify, async (req, res) => {
  await registrationResident(req.body, req.user, res);
});
// Edit Admin

router.post("/change-password", async (req, res) => {
  await changePWDAD(req.body, res);
});

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

router.get("/flat-delete/:id", verify, async (req, res) => {
  await deleteFlat(req.params.id, res);
});

// Announce
router.post("/announce-manage", verify, async (req, res) => {
  await announceManage(req.user, req.body, res);
});

router.post("/announce-update", verify, async (req, res) => {
  await announceUpdate(req.body, res);
});

router.get("/announce-delete/:id", verify, async (req, res) => {
  await announceDelete(req.params.id, res);
});
// Payment
router.post("/electric-bill-manage", verify, async (req, res) => {
  await electricManage(req.user, req.body, res);
});
router.post("/electric-bill-update", verify, async (req, res) => {
  await electricBillUpdate(req.body, res);
});
router.get("/electric-bill-delete/:id", verify, async (req, res) => {
  await electricBillDelete(req.params.id, res);
});

/*           !            */
router.post("/water-bill-manage", verify, async (req, res) => {
  await waterManage(req.user, req.body, res);
});
router.post("/water-bill-update", verify, async (req, res) => {
  await waterBillUpdate(req.body, res);
});
router.get("/water-bill-delete/:id", verify, async (req, res) => {
  await waterBillDelete(req.params.id, res);
});

module.exports = router;
