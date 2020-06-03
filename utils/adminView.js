// Require Database
const Account = require("../models/account");
const Flat = require("../models/flat");
const Resident = require("../models/resident");
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
    user: req.email,
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
      user: req.email,
    });
  }
  return res.render("adminViews/registerResident", {
    layout: "bossLayout",
    resident: resident,
    user: req.email,
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
      user: req.email,
    });
  }
  return res.render("adminViews/residentAccount", {
    layout: "bossLayout",
    resident: resident,
    account: account,
    user: req.email,
  });
};

/**
 * @description Flat view
 */

const flatView = async (req, res) => {
  const resident = await Resident.find();
  const flat = await Flat.find({});

  if (req.role == "admin") {
    return res.render("adminViews/flat", {
      layout: "adminLayout",
      flat: flat,
      resident: resident,
      user: req.email,
    });
  }
  return res.render("adminViews/flat", {
    layout: "bossLayout",
    flat: flat,
    resident: resident,
    user: req.email,
  });
};

module.exports = {
  dashboardView,
  registerView,
  registerResidentView,
  flatView,
  accountResidentView,
};
