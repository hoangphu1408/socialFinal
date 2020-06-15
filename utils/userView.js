const Account = require("../models/account");
const Post = require("../models/post");
const Bill = require("../models/billpayment");
const Flat = require("../models/flat");
const moment = require("moment");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const homePageView = async (req, res) => {
  const user = await Account.findById({ _id: req._id });
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
  return res.render("userViews/homepage", {
    layout: "userLayout",
    user: req,
    announce: announces,
    public: publicz,
    avatar: user.avatar,
  });
};

const writingView = async (req, res) => {
  const user = await Account.findById({ _id: req._id });
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
  return res.render("userViews/writing", {
    layout: "userLayout",
    user: req,
    announce: announces,
    public: publicz,
    avatar: user.avatar,
  });
};

const sellPageView = async (req, res) => {
  const user = await Account.findById({ _id: req._id });
  return res.render("userViews/sellpage", {
    layout: "userLayout",
    user: req,
    avatar: user.avatar,
  });
};

const verifyMail = async (email, res) => {
  return res.render("userViews/verifyMail", {
    email: email,
  });
};

const profileView = async (user, id, res) => {
  try {
    const account = await Account.findById({ _id: id });
    return res.render("userViews/profile", {
      layout: "userLayout",
      account: account,
      avatar: account.avatar,
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
    avatar: account.avatar,
  });
};

const aboutUser = async (user, res) => {
  const account = await Account.findById({ _id: user._id });
  return res.render("userViews/aboutUser", {
    layout: "userLayout",
    account: account,
    user: user,
    avatar: account.avatar,
  });
};
const message = async (user, res) => {
  const account = await Account.findById({ _id: user._id });
  const bill = await Flat.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId(account.id_resident),
      },
    },
    {
      $lookup: {
        from: "bills",
        localField: "_id",
        foreignField: "id_flat",
        as: "flat",
      },
    },
  ]);
  return res.render("userViews/message", {
    layout: "userLayout",
    account: account,
    user: user,
    avatar: account.avatar,
    bills: bill,
  });
};

module.exports = {
  homePageView,
  profileView,
  sendMailView,
  verifyMail,
  sellPageView,
  writingView,
  aboutUser,
  message,
};
