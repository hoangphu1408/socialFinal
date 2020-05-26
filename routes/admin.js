const router = require("express").Router();
const {
  registrationAdmin,
  verifyEmailToken,
  loginAdmin,
} = require("../utils/adminAuth");

router.get("/login", (req, res) => {
  return res.render("adminViews/login", {
    layout: "adminLayout",
  });
});

router.get("/verify-mail/:token", async (req, res, next) => {
  await verifyEmailToken(req.params.token, res, next);
});

// Handle POST

router.post("/register", async (req, res) => {
  await registrationAdmin(req.body, "admin", res);
});

router.post("/login", async (req, res) => {
  await loginAdmin(req.body, res);
});

module.exports = router;
