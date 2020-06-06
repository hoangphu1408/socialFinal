const Account = require("../models/account");
const Post = require("../models/post");

const moment = require("moment");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const homePageView = async (req, res) => {
  const user = await Account.findById({ _id: req._id });

  const announce = await Post.find({ type: "announce" });
  const public = await Post.find({ type: "public" });
  const listAn = [];
  const listPu = [];
  announce.forEach((an) => {
    if (an.status == true) {
      const date = parseInt(an.date);
      const now = moment(date).fromNow();
      listAn.push({
        _id: an._id,
        type: an.type,
        id_acc: an.id_acc,
        content: an.content,
        status: an.status,
        date: now,
      });
    }
  });

  public.forEach((an) => {
    if (an.status == true) {
      const date = parseInt(an.date);
      const now = moment(date).fromNow();
      listPu.push({
        _id: an._id,
        type: an.type,
        id_acc: an.id_acc,
        username: an.username,
        email: an.email,
        content: an.content,
        image: an.image,
        status: an.status,
        date: now,
      });
    }
  });

  return res.render("userViews/homepage", {
    layout: "userLayout",
    user: req,
    account: user,
    announce: listAn.reverse(),
    public: listPu.reverse(),
  });
};

const profileView = async (user, id, res) => {
  try {
    const account = await Account.findById({ _id: id });
    return res.render("userViews/profile", {
      layout: "userLayout",
      account: account,
      user: user,
    });
  } catch (error) {
    return res.status(404);
  }
};

const sendMailView = async (user, res) => {
  const account = await Account.findById({ _id: user._id });
  return res.render("userViews/sendMail", {
    layout: "userLayout",
    account: account,
    user: user,
  });
};

module.exports = {
  homePageView,
  profileView,
  sendMailView,
};
