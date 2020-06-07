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
 *  !-----------------------------!
 * @description  dashboard View
 *  !-----------------------------!
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
 *  !--------------------------------!
 * @description  changePassword View
 *  !--------------------------------!
 */

const changePasswordView = async (req, res) => {
  try {
    isAdmin(req.role, req);
    if (req.role == "boss") {
      return res.render("adminViews/sendMailCP", {
        layout: "bossLayout",
        user: req,
      });
    }
    return res.render("adminViews/sendMailCP", {
      layout: "adminLayout",
      user: req,
    });
  } catch (err) {
    return res.status(403).redirect("/");
  }
};

/**
 *  !-----------------------------!
 * @description  register View
 *  !-----------------------------!
 */

const registerView = async (req, res) => {
  try {
    if (req.role != "boss") {
      return res.redirect("/admin/dashboard");
    }
    const admin = await Account.find({ role: "admin" });
    return res.render("adminViews/register", {
      layout: "bossLayout",
      admin: admin,
      user: req,
    });
  } catch (err) {
    return res.status(403).redirect("/");
  }
};

/**
 *  !-----------------------------!
 * @description  resident View
 *  !-----------------------------!
 */

const registerResidentView = async (req, res) => {
  try {
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
  } catch (err) {
    return res.status(403).redirect("/");
  }
};

const accountResidentView = async (req, res) => {
  try {
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
  } catch (err) {
    return res.status(403).redirect("/");
  }
};

/**
 *  !-----------------------!
 * @description Flat view
 *  !-----------------------!
 */

const flatView = async (req, res) => {
  try {
    const resident = await Resident.find();
    const flat = await Flat.aggregate([
      {
        $lookup: {
          from: "residents",
          localField: "owner",
          foreignField: "_id",
          as: "Owner",
        },
      },
      {
        $lookup: {
          from: "residents",
          localField: "numberOfPeople",
          foreignField: "_id",
          as: "people",
        },
      },
      {
        $project: {
          block: 1,
          flatId: 1,
          floorId: 1,
          date: 1,
          status: 1,
          people: {
            full_name: 1,
          },
          Owner: {
            full_name: 1,
          },
        },
      },
    ]);

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
  } catch (err) {
    return res.status(403).redirect("/");
  }
};

/**
 *  !-----------------------------!
 * @description  Announce view
 *  !-----------------------------!
 */

const announceView = async (req, res) => {
  try {
    const post = await Post.aggregate([
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
  } catch (err) {
    return res.status(403).redirect("/");
  }
};

/**
 *  !-----------------------------!
 * @description  Post view
 *  !-----------------------------!
 */

const postView = async (req, res) => {
  try {
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
  } catch (err) {
    return res.status(403).redirect("/");
  }
};

const test = async (req, res) => {
  try {
    const post = await Post.aggregate([
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
    res.send(post);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  dashboardView,
  changePasswordView,
  registerView,
  registerResidentView,
  flatView,
  accountResidentView,
  announceView,
  postView,
  test,
};
