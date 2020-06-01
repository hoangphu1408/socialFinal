// Require Database
const Account = require("../models/account");
const Resident = require("../models/resident");
// Require Handle
const { isAdmin } = require("../utils/adminAuth");
const moment = require("moment");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

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
  return res.render("adminViews/listsData/listAdmin", {
    layout: "bossLayout",
    admin: admin,
    user: req.email,
  });
};

/**
 * @description Register Resident Views
 */

const registerResidentView = async (req, res) => {
  const resident = await Resident.find({ role: "user" });
  return res.render("adminViews/listData/listResident", {
    layout: "bossLayout",
    resident: resident,
    user: req.email,
  });
};

module.exports = {
  dashboardView,
  registerView,
  registerResidentView,
};
