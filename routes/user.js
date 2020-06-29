const router = require("express").Router();

const {
  loginUser,
  postCreate,
  avatarUpload,
  profileUpdate,
  createLimit,
  sendEmailPassword,
  changePassword,
  changePWD,
  forgotPassword,
  newPassword,
  newPWD,
} = require("../utils/userAuth");
const {
  homePageView,
  profileView,
  sendMailView,
  sellPageView,
  writingView,
  aboutUser,
  message,
  onlpayView,
} = require("../utils/userView");
const isLogin = require("../config/isLoginU");
const verify = require("../config/verifyTokenU");
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: "public/avatar",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const storagePost = multer.diskStorage({
  destination: "public/uploads",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const uploadPost = multer({
  storage: storagePost,
});
const upload = multer({
  storage: storage,
});

router.get("/test", (req, res) => {
  return res.render("test", {
    layout: "userLayout",
  });
});

//
router.get("/login", isLogin, (req, res) => {
  return res.render("userViews/login", {
    layout: "userLayout2",
  });
});

//
router.get("/forgot-password", (req, res) => {
  return res.render("userViews/forgotPassword", {
    layout: "userLayout2",
  });
});

router.get("/", verify, (req, res) => {
  return homePageView(req.user, res);
});

router.get("/writing", verify, (req, res) => {
  return writingView(req.user, res);
});

router.get("/about-customer", verify, (req, res) => {
  return aboutUser(req.user, res);
});

router.get("/messages", verify, (req, res) => {
  return message(req.user, res);
});

router.get("/profile/:id", verify, (req, res) => {
  return profileView(req.user, req.params.id, res);
});
router.get("/send-mail", verify, (req, res) => {
  return sendMailView(req.user, res);
});
router.get("/sellpage", verify, (req, res) => {
  return sellPageView(req.user, res);
});
router.get("/online-payment", verify, (req, res) => {
  return onlpayView(req.user, res);
});
//Handle

router.post(
  "/writing",
  verify,

  uploadPost.array("image", 6),
  async (req, res) => {
    if (req.files === undefined) {
      await postCreate(req.user, req.body, "none", res);
    } else {
      const image = [];
      req.files.forEach((ima) => {
        image.push(ima.filename);
      });
      await postCreate(req.user, req.body, image, res);
    }
  }
);

router.post(
  "/sellpage",
  verify,
  uploadPost.array("sell", 6),
  async (req, res) => {
    res.send(req.files);
  }
);

router.post("/login", async (req, res) => {
  await loginUser(req.body, res);
});

router.post("/forgot-password", createLimit, async (req, res) => {
  await forgotPassword(req.body, res);
});

router.get("/forgot-password/:token", async (req, res) => {
  await newPassword(req.params.token, res);
});

router.post("/new-password", async (req, res) => {
  await newPWD(req.body.email, req.body, res);
});

router.post(
  "/profile-avatar",
  verify,
  createLimit,
  upload.single("avatar"),
  async (req, res) => {
    avatarUpload(req.user._id, req.file.filename, res);
  }
);

router.post("/profile-update", verify, async (req, res) => {
  await profileUpdate(req.body, res);
});

router.post("/send-mail", verify, async (req, res) => {
  await sendEmailPassword(req.body.email, res);
});

router.get("/change-password/:token", async (req, res) => {
  await changePassword(req.params.token, res);
});

router.post("/change-password", verify, async (req, res) => {
  await changePWD(req.user._id, req.body, res);
});

router.get("/logout", (req, res) => {
  res.clearCookie("auth");
  return res.redirect("/login");
});

module.exports = router;
