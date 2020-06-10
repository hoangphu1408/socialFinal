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
} = require("../utils/userAuth");
const {
  homePageView,
  profileView,
  sendMailView,
  sellPageView,
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
  return res.render("test");
});

//
router.get("/login", isLogin, (req, res) => {
  return res.render("userViews/login");
});

router.get("/homepage", verify, (req, res) => {
  return homePageView(req.user, res);
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
//Handle

router.post(
  "/homepage",
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

router.post(
  "/profile-avatar",
  verify,
  createLimit,
  upload.single("avatar"),
  async (req, res) => {
    avatarUpload(req.user._id, req.file.filename, res);
  }
);

router.post("/profile-update", verify, createLimit, async (req, res) => {
  await profileUpdate(req.body, res);
});

router.post("/send-mail", verify, async (req, res) => {
  await sendEmailPassword(req.body.email, res);
  res.json(req.body);
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
