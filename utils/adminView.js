// Require Database
const Account = require("../models/account");
const Flat = require("../models/flat");
const Resident = require("../models/resident");
const Post = require("../models/post");
// Require Handle
const { isAdmin, listFlat } = require("../utils/adminAuth");
const moment = require("moment");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

/**
 * @description Dashboard view
 */

const dashboardView = async (req, res) => {
  try {
    isAdmin(req.role, req);
    if (req.role == "boss") {
      return res.render("adminViews/dashboard", {
        layout: "bossLayout",
        user: req,
      });
    }
    return res.render("adminViews/dashboard", {
      layout: "adminLayout",
      user: req,
    });
  } catch (err) {
    return res.status(403).redirect("/");
  }
};

/**
 *  @description Register view
 */

const registerView = async (req, res) => {
  if (req.role != "boss") {
    return res.redirect("/admin/dashboard");
  }
  const admin = await Account.find({ role: "admin" });
  return res.render("adminViews/register", {
    layout: "bossLayout",
    admin: admin,
    user: req,
  });
};

/**
 * @description Register Resident view
 */

const registerResidentView = async (req, res) => {
  const resident = await Resident.find({});
  if (req.role == "admin") {
    return res.render("adminViews/registerResident", {
      layout: "adminLayout",
      resident: resident,
      user: req,
    });
  }
  return res.render("adminViews/registerResident", {
    layout: "bossLayout",
    resident: resident,
    user: req,
  });
};

const accountResidentView = async (req, res) => {
  const resident = await Resident.find({});
  const account = await Account.find({ role: "user" });
  if (req.role == "admin") {
    return res.render("adminViews/residentAccount", {
      layout: "adminLayout",
      resident: resident,
      account: account,
      user: req,
    });
  }
  return res.render("adminViews/residentAccount", {
    layout: "bossLayout",
    resident: resident,
    account: account,
    user: req,
  });
};

/**
 *  !-----------------------!
 * @description Flat view
 *  !-----------------------!
 */

const flatView = async (req, res) => {
  const resident = await Resident.find();
  const flat = await Flat.find();

  if (req.role == "admin") {
    return res.render("adminViews/flat", {
      layout: "adminLayout",
      flat: flat,
      resident: resident,
      user: req,
    });
  }
  return res.render("adminViews/flat", {
    layout: "bossLayout",
    flat: flat,
    resident: resident,
    user: req,
  });
};

/**
 *  !-----------------------------!
 * @description  Announce view
 *  !-----------------------------!
 */

const announceView = async (req, res) => {
  const post = await Post.find({ type: "announce" });
  if (req.role == "admin") {
    return res.render("adminViews/announce", {
      layout: "adminLayout",
      user: req,
      post: post,
    });
  }
  return res.render("adminViews/announce", {
    layout: "bossLayout",
    user: req,
    post: post,
  });
};

/**
 *  !-----------------------------!
 * @description  Post view
 *  !-----------------------------!
 */

const postView = async (req, res) => {
  const post1 = await Post.find({ type: "public" });
  const post2 = await Post.find({ type: "sell" });
  const post = post1.concat(post2);
  if (req.role == "admin") {
    return res.render("adminViews/post", {
      layout: "adminLayout",
      user: req,
      post: post,
    });
  }
  return res.render("adminViews/post", {
    layout: "bossLayout",
    user: req,
    post: post,
  });
};

const test = async (req, res) => {
  const post = await Post.find({ status: true });
  const listPost = [];
  post.forEach((po) => {
    var date = parseInt(po.date);
    var formNow = moment(date).fromNow();
    listPost.push({
      _id: po._id,
      type: po.type,
      id_acc: po.id_acc,
      username: po.username,
      content: po.content,
      date: formNow,
    });
  });

  return res.render("test", {
    post: listPost.reverse(),
  });
};

module.exports = {
  dashboardView,
  registerView,
  registerResidentView,
  flatView,
  accountResidentView,
  announceView,
  postView,
  test,
};
