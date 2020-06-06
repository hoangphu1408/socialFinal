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
      errors: errors,
    });
  }
  const isMail = await validateEmail(email);
  if (!isMail) {
    errors.push({ msg: "Email or password incorrect" });
    return res.status(400).render("userViews/login", {
      errors: errors,
    });
  }
  const mail = await Account.findOne({ email: email });
  const isMatch = await bcrypt.compare(password, mail.password);
  if (!isMatch) {
    errors.push({ msg: "Email or password incorrect" });
    return res.status(400).render("userViews/login", {
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
  return res.redirect("/homepage");
};

/**
 * !-----------------------------!
 * @description post
 * !-----------------------------!
 */

const postCreate = async (user, data, image, res) => {
  const errors = [];
  const { id, email, username, content } = data;
  if (content === "" && image === "none") {
    errors.push({ msg: "Please add content" });
    return res.render("userViews/homepage", {
      layout: "userLayout",
      user: user,
      errors: errors,
    });
  }
  if (content == "") {
    const newPost = new Post({
      id_acc: id,
      username: username,
      email: email,
      content: "none",
      image: image,
      status: true,
      date: Date.now(),
    });
    await newPost.save();
    return res.redirect("back");
  }
  const newPost = new Post({
    id_acc: id,
    username: username,
    email: email,
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
};
