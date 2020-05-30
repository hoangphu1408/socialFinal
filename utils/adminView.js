// Require Database
const Account = require("../models/account");
const Resident = require("../models/resident");
// Require Handle
const { isAdmin, isBoss } = require("../utils/adminAuth");
const moment = require("moment");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

/**
 *  @description List Account Admin
 */

const registerView = async (req, res, next) => {
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

module.exports = {
  registerView,
};
