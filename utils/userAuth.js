const Account = require("../models/account");
const Post = require("../models/post");

const bcrypt = require("bcryptjs");
const { KEYU, MAIL, EMAIL, PASSWORD } = require("../config");
const jwt = require("jsonwebtoken");
const {
  loginValidation,
  changeNewPWD,
  validatePost,
} = require("../config/validation");
const moment = require("moment");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const multer = require("multer");

/**
 * !-------------------------!
 * @description Login user
 * !-------------------------!
 */
const loginUser = async (data, res) => {
  const { email, password } = data;
  const errors = [];
  const { error } = await loginValidation(data);
  if (error) {
    errors.push({ msg: error.details[0].message });
    return res.status(400).render("userViews/login", {
      layout: "userLayout2",
      errors: errors,
    });
  }
  const isMail = await validateEmail(email);
  if (!isMail) {
    errors.push({ msg: "Email or password incorrect" });
    return res.status(400).render("userViews/login", {
      layout: "userLayout2",
      errors: errors,
    });
  }
  const mail = await Account.findOne({ email: email });
  const isMatch = await bcrypt.compare(password, mail.password);
  if (!isMatch) {
    errors.push({ msg: "Email or password incorrect" });
    return res.status(400).render("userViews/login", {
      layout: "userLayout2",
      errors: errors,
    });
  }
  const payload = {
    _id: mail._id,
    role: mail.role,
    email: mail.email,
    avatar: mail.avatar,
    username: mail.username,
    active: mail.email_verify,
  };
  const signToken = await jwt.sign(payload, KEYU, {
    expiresIn: "1 days",
  });
  res.cookie("auth", signToken, {
    maxAge: 50000000,
    httpOnly: true,
  });
  return res.redirect("/");
};

/**
 * !-----------------------------!
 * @description forgot password
 * !-----------------------------!
 */

const forgotPassword = async (data, res) => {
  const errors = [];
  const success = [];
  const email = data.email;
  const isAccount = await Account.findOne({ email: email });
  if (!isAccount) {
    errors.push({ msg: "Email không tồn tại" });
    return res.render("userViews/forgotPassword", {
      layout: "userLayout2",
      errors: errors,
    });
  }
  success.push({
    msg: "Gửi thành công, kiểm tra email để cập nhật mật khẩu mới!",
  });
  const payload = { email: email };
  const mailToken = jwt.sign(payload, MAIL, {
    expiresIn: "1 days",
  });
  await sendEmailFP(email, mailToken);
  return res.render("userViews/forgotPassword", {
    layout: "userLayout2",
    success: success,
  });
};

/**
 * !-----------------------------!
 * @description Update new Password
 * !-----------------------------!
 */

const newPassword = async (token, res) => {
  try {
    const verified = jwt.verify(token, MAIL);
    if (verified) {
      return res.render("userViews/newPassword", {
        layout: "userLayout2",
        email: verified.email,
      });
    } else {
      return res.redirect("/");
    }
  } catch (err) {
    return res.send("Verify error");
  }
};

/**
 * !-----------------------------!
 * @description update new Password
 * !-----------------------------!
 */

const newPWD = async (email, data, res) => {
  const errors = [];
  const hashedPassword = await bcrypt.hash(data.pwd1, 12);
  const update = { password: hashedPassword };
  const updatePassword = await Account.findOneAndUpdate(
    { email: email },
    update,
    {
      new: true,
    }
  );
  return res.redirect("/login");
};

/**
 * !-----------------------------!
 * @description post
 * !-----------------------------!
 */

const postCreate = async (user, data, image, res) => {
  const errors = [];
  const { id, content } = data;
  //
  const announce = await Post.aggregate([
    {
      $match: {
        type: "announce",
      },
    },
    {
      $lookup: {
        from: "accounts",
        localField: "id_acc",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $project: {
        type: 1,
        content: 1,
        status: 1,
        date: 1,
        owner: {
          username: 1,
          email: 1,
          avatar: 1,
        },
      },
    },
  ]);
  const announces = announce.map((an) => ({
    _id: an._id,
    type: an.type,
    content: an.content,
    status: an.status,
    date: moment(parseInt(an.date)).fromNow(),
    owner: an.owner,
  }));

  const public = await Post.aggregate([
    {
      $match: {
        type: "public",
      },
    },
    {
      $lookup: {
        from: "accounts",
        localField: "id_acc",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $project: {
        type: 1,
        content: 1,
        status: 1,
        image: 1,
        date: 1,
        owner: {
          username: 1,
          email: 1,
          avatar: 1,
        },
      },
    },
  ]);
  const publicz = public.map((pub) => ({
    _id: pub._id,
    type: pub.type,
    content: pub.content,
    status: pub.status,
    image: pub.image,
    date: moment(parseInt(pub.date)).fromNow(),
    owner: pub.owner,
  }));
  //

  if (content === "" && image === "none") {
    errors.push({ msg: "Please add content" });
    return res.render("userViews/writing", {
      layout: "userLayout",
      user: user,
      errors: errors,
      announce: announces,
      public: publicz,
      avatar: user.avatar,
    });
  }
  if (content == "") {
    const newPost = new Post({
      id_acc: id,
      content: null,
      image: image,
      status: true,
      date: Date.now(),
    });
    await newPost.save();
    return res.redirect("back");
  }
  const newPost = new Post({
    id_acc: id,
    content: content,
    image: image,
    status: true,
    date: Date.now(),
  });
  await newPost.save();
  return res.redirect("back");
};

/**
 * !-----------------------------!
 * @description upload Avatar
 * !-----------------------------!
 */

const avatarUpload = async (id, image, res) => {
  try {
    const update = { avatar: image };
    const accUpdate = await Account.findByIdAndUpdate({ _id: id }, update, {
      new: true,
    });
    return res.redirect("back");
  } catch (err) {
    return res.status(400);
  }
};

/**
 * !-----------------------------!
 * @description update profile
 * !-----------------------------!
 */

const profileUpdate = async (data, res) => {
  try {
    const { id, email, username, phone } = data;
    const update = { email: email, username: username, phone: phone };
    const accUpdate = await Account.findByIdAndUpdate({ _id: id }, update, {
      new: true,
    });
    return res.redirect("back");
  } catch (err) {
    return res.status(400);
  }
};

/**
 * !-----------------------------!
 * @description Resend Mail
 * !-----------------------------!
 */

const sendEmailPassword = async (email, res) => {
  const payload = { email: email };
  const mailToken = jwt.sign(payload, MAIL, {
    expiresIn: "1 days",
  });
  await sendEmailPW(email, mailToken);
};

/**
 * !-----------------------------!
 * @description Change Password
 * !-----------------------------!
 */

const changePassword = async (token, res) => {
  try {
    const verified = jwt.verify(token, MAIL);
    if (verified) {
      return res.render("userViews/changePassword");
    } else {
      return res.redirect("/homepage");
    }
  } catch (err) {
    return res.send("Verify error");
  }
};

/**
 * !-----------------------------!
 * @description Change Password
 * !-----------------------------!
 */

const changePWD = async (id, data, res) => {
  const { password, password2 } = data;
  const errors = [];
  const { error } = await changeNewPWD(data);
  if (error) {
    if (error.details[0].type === "any.only") {
      errors.push({ msg: "Password do not match" });
      return res.status(400).render("userViews/changePassword", {
        errors: errors,
        data: data,
      });
    }
    errors.push({ msg: error.details[0].message });
    return res.status(400).render("userViews/changePassword", {
      errors: errors,
      data: data,
    });
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const update = { password: hashedPassword };
  const updatePassword = await Account.findOneAndUpdate({ _id: id }, update, {
    new: true,
  });
  res.clearCookie("auth");
  return res.redirect("/login");
};

/**
 * !-----------------------------!
 * @description Validate config
 * !-----------------------------!
 */

const createLimit = rateLimit({
  windowMs: 60000,
  max: 1,
  message: "Too many request",
});

const validateEmail = async (email) => {
  return (await Account.findOne({ email: email })) ? true : false;
};

/**
 * !-----------------------------!
 * @description Mail forgotpass
 * !-----------------------------!
 */
const sendEmailFP = (email, mailToken) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });
  const url = `http://localhost:5000/forgot-password/${mailToken}`;
  const mailOptions = {
    from: "SocialNetWork<hoangphu1428@gmail.com>",
    to: email,
    subject: "Mail change password",
    html: `
           <p>Please click the link below if you want change your password</p>
           <a href="${url}">Click here to do that ! </a>
        `,
  };
  transport.sendMail(mailOptions, (error, res) => {
    if (error) {
      return console.log(error);
    } else {
      console.log("Success");
      transport.close();
    }
  });
};

/**
 * !-----------------------------!
 * @description Mail changepass
 * !-----------------------------!
 */

const sendEmailPW = (email, mailToken) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });
  const url = `http://localhost:5000/change-password/${mailToken}`;
  const mailOptions = {
    from: "SocialNetWork<hoangphu1428@gmail.com>",
    to: email,
    subject: "Mail change password",
    html: `
           <p>Please click the link below if you want change your password</p>
           <a href="${url}">Click here to do that ! </a>
        `,
  };
  transport.sendMail(mailOptions, (error, res) => {
    if (error) {
      return console.log(error);
    } else {
      console.log("Success");
      transport.close();
    }
  });
};

module.exports = {
  loginUser,
  postCreate,
  avatarUpload,
  createLimit,
  profileUpdate,
  sendEmailPassword,
  changePassword,
  changePWD,
  forgotPassword,
  newPassword,
  newPWD,
};
