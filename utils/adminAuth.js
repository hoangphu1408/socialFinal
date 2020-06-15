// require  Model
const Account = require("../models/account");
const Resident = require("../models/resident");
const Flat = require("../models/flat");
const Post = require("../models/post");
const Bill = require("../models/billpayment");

// require module
const bcrypt = require("bcryptjs");
const { KEY, MAIL, EMAIL, PASSWORD } = require("../config");
const jwt = require("jsonwebtoken");
const {
  regAdminValidation,
  loginValidation,
  regResidentValidation,
  regAccountResident,
  changeNewPWD,
} = require("../config/validation");
const moment = require("moment");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const e = require("express");

/**
 * !------------------------------------- !
 * @description Register Admin
 * !------------------------------------- !
 */

const registrationAdmin = async (data, zemail, role, res) => {
  const errors = [];
  const admin = await Account.find({ role: "admin" });
  const { username, email, password, password2 } = data;
  const { error } = await regAdminValidation(data);
  if (error) {
    if (error.details[0].type === "any.only") {
      errors.push({ msg: "Password do not match" });
      return res.status(400).render("adminViews/register", {
        layout: "bossLayout",
        admin: admin,
        errors: errors,
        user: zemail,
      });
    }
    errors.push({ msg: error.details[0].message });
    return res.status(400).render("adminViews/register", {
      layout: "bossLayout",
      admin: admin,
      errors: errors,
      user: zemail,
    });
  }

  // Check User + Email exist

  const isUser = await validateUsername(username);
  if (isUser) {
    errors.push({ msg: "Username is already registered" });
    return res.status(400).send(errors);
  }
  const isEmail = await validateEmail(email);
  if (isEmail) {
    errors.push({ msg: "Email is already registered" });
    return res.status(400).send(errors);
  }

  // Create mail token
  const payload = { email: email };
  const mailToken = jwt.sign(payload, MAIL, {
    expiresIn: "1 days",
  });

  //  Email verify
  await verifyEmail(email, mailToken);
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  const newAccount = new Account({
    role: role,
    username: username,
    email: email,
    password: hashedPassword,
    date: Date.now(),
    status: true,
  });

  await newAccount.save();
  return res.redirect("back");
};

/**
 * !------------------------------------- !
 * @description Login Admin
 * !------------------------------------- !
 */

const loginAdmin = async (data, res) => {
  const errors = [];
  const { email, password } = data;
  const { error } = await loginValidation(data);
  if (error) {
    errors.push({ msg: error.details[0].message });
    return res.status(400).render("adminViews/login", {
      errors: errors,
    });
  }
  const isMail = await validateEmail(email);
  if (!isMail) {
    errors.push({ msg: "Email or password incorrect!" });
    return res.status(400).render("adminViews/login", {
      errors: errors,
    });
  }
  const mail = await Account.findOne({ email: email });
  // is Admin or Boss
  if (mail.role != "admin" && mail.role != "boss") {
    return res.send("???");
  }

  // compare password
  const isMatch = await bcrypt.compare(password, mail.password);
  if (!isMatch) {
    errors.push({ msg: "Email or password incorrect!" });
    return res.status(400).render("adminViews/login", {
      errors: errors,
    });
  }
  const payload = {
    _id: mail._id,
    role: mail.role,
    email: mail.email,
    active: mail.email_verify,
  };
  const signToken = await jwt.sign(payload, KEY, {
    expiresIn: "1 days",
  });
  res.cookie("auth", signToken, {
    maxAge: 50000000,
    httpOnly: true,
  });
  return res.redirect("/admin/dashboard");
};

/**
 * !------------------------------------- !
 * @description ChangePassword
 * !------------------------------------- !
 */
const changePWDAD = async (data, res) => {
  const { email, password, password2 } = data;
  const errors = [];
  const { error } = await changeNewPWD(data);
  if (error) {
    if (error.details[0].type === "any.only") {
      errors.push({ msg: "Password do not match" });
      return res.status(400).render("adminViews/changePassword", {
        errors: errors,
        data: data,
        email: email,
      });
    }
    errors.push({ msg: error.details[0].message });
    return res.status(400).render("adminViews/changePassword", {
      errors: errors,
      data: data,
      email: email,
    });
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const update = { password: hashedPassword };
  const updatePassword = await Account.findOneAndUpdate(
    { email: email },
    update,
    {
      new: true,
    }
  );
  res.clearCookie("auth");
  return res.redirect("/admin/login");
};

/**
 * !------------------------------------- !
 * @description Verify Email
 * !------------------------------------- !
 */

const verifyEmailToken = async (token, res) => {
  try {
    const verified = jwt.verify(token, MAIL);
    const isTrue = { email_verify: true };
    await Account.findOneAndUpdate({ email: verified.email }, isTrue, {
      new: true,
    });
    return res.redirect("/admin/dashboard");
  } catch (err) {
    return res.send("Verify Error");
  }
};

/**
 * !------------------------------------- !
 * @description Verify Email ChangePassword
 * !------------------------------------- !
 */

const changePasswordAd = async (token, res) => {
  try {
    const verified = jwt.verify(token, MAIL);
    if (verified) {
      return res.render("adminViews/changePassword", {
        email: verified.email,
      });
    } else {
      return res.redirect("/admin/dashboard");
    }
  } catch (err) {
    return res.send("Verify error");
  }
};

/**
 * !------------------------------------- !
 * @description Resend mail
 * !------------------------------------- !
 */

const resendMail = async (email, res) => {
  // Create mail token
  const payload = { email: email };
  const mailToken = jwt.sign(payload, MAIL, {
    expiresIn: "1 days",
  });
  //  Email verify
  await verifyEmail(email, mailToken);
};

const isAdmin = async function (role, res) {
  if (role != "admin" && role != "boss") {
    return res.status(403).redirect("/");
  }
};

/**
 * !------------------------------------- !
 * @description Send mail pw
 * !------------------------------------- !
 */

const sendEmailPassword = async (email, res) => {
  const payload = { email: email };
  const mailToken = jwt.sign(payload, MAIL, {
    expiresIn: "1 days",
  });
  await sendEmailPW(email, mailToken);
  return res.redirect("back");
};

/**
 * !------------------------------------- !
 * @description Rate Limit
 * !------------------------------------- !
 */

const createLimit = rateLimit({
  windowMs: 60000,
  max: 1,
  message: "Too many request",
});

/**
 * !------------------------------------- !
 * @description Registration Resident
 * !------------------------------------- !
 */

const registrationResident = async (data, user, res) => {
  const resident = await Resident.find({});
  const errors = [];
  const {
    full_name,
    yearOfBirth,
    ID_CARD,
    father_name,
    mother_name,
    household,
  } = data;
  const private_information = [];
  const validate = { full_name: full_name };
  const { error } = await regResidentValidation(validate);
  if (error) {
    errors.push({ msg: error.details[0].message });
    return user.role == "boss"
      ? res.render("adminViews/registerResident", {
          layout: "bossLayout",
          user: user.email,
          errors: errors,
          resident: resident,
        })
      : res.render("adminViews/registerResident", {
          layout: "adminLayout",
          user: user.email,
          errors: errors,
          resident: resident,
        });
  }

  if (ID_CARD != "") {
    private_information.push({ type: "Chứng minh thư", serial: ID_CARD });
  } else if (father_name != "" || mother_name != "") {
    private_information.push({
      type: "Giấy khai sinh",
      father_name: father_name,
      mother_name: mother_name,
    });
  }
  const newResident = new Resident({
    full_name: full_name,
    year_of_birth: yearOfBirth,
    private_information: private_information,
    household_registration: household,
    date: Date.now(),
    status: false,
  });
  await newResident.save();
  return res.redirect("back");
};

/**
 * !------------------------------------- !
 * @description Admin Update
 * !------------------------------------- !
 */

const updateAdmin = async (data, res) => {
  const { id, phone, role } = data;
  const update = { phoneNumber: phone, role: role };
  const admin = await Account.findOneAndUpdate({ _id: id }, update, {
    new: true,
  });
  return res.redirect("back");
};

const updatePasswordAd = async (data, res) => {
  const { id, newPass } = data;
  const hashedPassword = await bcrypt.hash(newPass, 12);
  const update = { password: hashedPassword };
  const admin = await Account.findByIdAndUpdate({ _id: id }, update, {
    new: true,
  });
  return res.redirect("back");
};

const updateActivation = async (data, res) => {
  const { id, active } = data;
  const update = { email_verify: active };
  const admin = await Account.findByIdAndUpdate({ _id: id }, update, {
    new: true,
  });
  return res.redirect("back");
};

const deleteAdmin = async (id, res) => {
  const admin = await Account.findByIdAndDelete({ _id: id }, (error, data) => {
    if (error) {
      alert("Cant delete now");
      throw error;
    } else {
      return res.redirect("back");
    }
  });
};

/**
 * !------------------------------------- !
 * @description Create Account Resident
 * !------------------------------------- !
 */

const accountResident = async (data, zemail, res) => {
  const { resident, email, password, password2 } = data;
  const accounts = await Account.find({ role: "user" });
  const residents = await Resident.find({ status: false });
  const errors = [];
  const validate = { email: email, password: password, password2: password2 };
  const { error } = await regAccountResident(validate);
  if (error) {
    if (error.details[0].type === "any.only") {
      errors.push({ msg: "Password do not match" });
      return res.status(400).render("adminViews/residentAccount", {
        layout: "bossLayout",
        resident: residents,
        account: accounts,
        errors: errors,
        user: zemail,
      });
    }
    errors.push({ msg: error.details[0].message });
    return res.status(400).render("adminViews/residentAccount", {
      layout: "bossLayout",
      resident: residents,
      account: accounts,
      errors: errors,
      user: zemail,
    });
  }
  const account = await Account.findOne({ id_resident: resident });
  if (account) {
    errors.push({ msg: "This resident is already have an account" });
    return res.status(400).render("adminViews/residentAccount", {
      layout: "bossLayout",
      resident: residents,
      account: accounts,
      errors: errors,
      user: zemail,
    });
  }
  const isEmail = await Account.findOne({ email: email });
  if (isEmail) {
    errors.push({ msg: "This email is already created" });
    return res.status(400).render("adminViews/residentAccount", {
      layout: "bossLayout",
      resident: residents,
      account: accounts,
      errors: errors,
      user: zemail,
    });
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const newAccount = new Account({
    id_resident: resident,
    role: "user",
    avatar: "avatar.jpg",
    email: email,
    username: "Cư dân",
    phoneNumber: "none",
    password: hashedPassword,
    date: Date.now(),
    status: true,
  });
  const updateResidentStatus = { status: true };
  const update = await Resident.findOneAndUpdate(
    { _id: resident },
    updateResidentStatus,
    { new: true }
  );
  await newAccount.save();
  await sendEmail(email, password);
  return res.redirect("back");
};

/**
 * !------------------------------------- !
 * @description Resident Update
 * !------------------------------------- !
 */

const updateResident = async (data, res) => {
  const {
    id,
    full_name,
    yearOfBirth,
    ID_CARD,
    father_name,
    mother_name,
    household,
  } = data;
  const private_information = [];
  const household_registration = [];
  if (ID_CARD != "") {
    private_information.push({ type: "Chứng minh thư", serial: ID_CARD });
  } else if (father_name != "" || mother_name != "") {
    private_information.push({
      type: "Giấy khai sinh",
      father_name: father_name,
      mother_name: mother_name,
    });
  }
  const update = {
    full_name: full_name,
    year_of_birth: yearOfBirth,
    private_information: private_information,
    household_registration: household,
  };
  const resident = await Resident.findByIdAndUpdate({ _id: id }, update, {
    new: true,
  });
  return res.redirect("back");
};

const deleteResident = async (id, res) => {
  const resident = await Resident.findByIdAndDelete(
    { _id: id },
    async (error, data) => {
      if (error) {
        alert("Cant delete now");
        throw error;
      } else {
        const owner = await Flat.find({ owner: id });
        if (owner) {
          const updateOwner = {
            owner: null,
            numberOfPeople: [],
            status: false,
          };
          const ownerUP = await Flat.updateMany({ owner: id }, updateOwner);
        }
        const account = await Account.findOne({ id_resident: id });
        if (account) {
          const delAccount = await Account.findByIdAndDelete({
            _id: account._id,
          });
        }
        return res.redirect("back");
      }
    }
  );
};

/**
 * !------------------------------------- !
 * @description Create Flat
 * !------------------------------------- !
 */

const createFlat = async (data, email, res) => {
  const errors = [];
  const { block, floorId, flatId, owner, number } = data;
  const resident = await Resident.find();
  const flatz = await Flat.aggregate([
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
  const flat = await Flat.findOne({
    block: block,
    floorId: floorId,
    flatId: flatId,
  });

  if (flat) {
    errors.push({ msg: "This flat is already created" });
    return res.render("adminViews/flat", {
      layout: "bossLayout",
      errors: errors,
      flat: flatz,
      resident: resident,
      data: data,
      user: email,
    });
  }
  if (owner === "none") {
    const newFlat = new Flat({
      block: block,
      floorId: floorId,
      flatId: flatId,
      owner: null,
      numberOfPeople: [],
      date: Date.now(),
      status: false,
      isPayment: false,
    });
    await newFlat.save();
    return res.redirect("back");
  }
  if (number === "none") {
    const newFlat = new Flat({
      block: block,
      floorId: floorId,
      flatId: flatId,
      owner: owner,
      numberOfPeople: [],
      date: Date.now(),
      status: true,
      isPayment: false,
    });
    await newFlat.save();
    return res.redirect("back");
  }

  const newFlat = new Flat({
    block: block,
    floorId: floorId,
    flatId: flatId,
    owner: owner,
    numberOfPeople: number,
    date: Date.now(),
    status: true,
    isPayment: false,
  });
  await newFlat.save();
  return res.redirect("back");
};

/**
 * !------------------------------------- !
 * @description Flat Update
 * !------------------------------------- !
 */

const updateFlat = async (data, res) => {
  const { id, ownerEdit, numberEdit } = data;

  if (ownerEdit === "none") {
    const update = {
      owner: null,
      numberOfPeople: [],
      status: false,
    };
    const upFlat = await Flat.findOneAndUpdate({ _id: id }, update, {
      new: true,
    });
    return res.redirect("back");
  }

  if (numberEdit === "none") {
    const update = {
      owner: ownerEdit,
      numberOfPeople: [],
      status: true,
    };
    const upFlat = await Flat.findByIdAndUpdate({ _id: id }, update, {
      new: true,
    });
    return res.redirect("back");
  }

  const update = {
    owner: ownerEdit,
    numberOfPeople: numberEdit,
    status: true,
  };
  const upFlat = await Flat.findByIdAndUpdate({ _id: id }, update, {
    new: true,
  });
  return res.redirect("back");
};

/**
 * !------------------------------------- !
 * @description Flat Delete
 * !------------------------------------- !
 */

const deleteFlat = async (id, res) => {
  const flat = await Flat.findByIdAndDelete({ _id: id }, (error, data) => {
    if (error) {
      alert("Cant delete now");
      throw error;
    } else {
      return res.redirect("back");
    }
  });
};

/**
 * !------------------------------------- !
 * @description Announce Manage
 * !------------------------------------- !
 */

const announceManage = async (user, data, res) => {
  const errors = [];
  const { id, type, announce } = data;
  //-----------------------
  if (announce == "") {
    errors.push({ msg: "Please add content" });
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
    if (user.role == "admin") {
      return res.render("adminViews/announce", {
        layout: "adminLayout",
        user: user,
        post: post,
        errors: errors,
      });
    }
    return res.render("adminViews/announce", {
      layout: "bossLayout",
      user: user,
      post: post,
      errors: errors,
    });
  }
  //-----------------------
  const newPost = await Post({
    id_acc: id,
    type: type,
    content: announce,
    status: true,
    date: Date.now(),
  });
  await newPost.save();
  return res.redirect("back");
};

const announceUpdate = async (data, res) => {
  const { idEdit, editAn, status } = data;
  const update = { content: editAn, status: status };
  const updatePost = await Post.findByIdAndUpdate({ _id: idEdit }, update, {
    new: true,
  });
  return res.redirect("back");
};

const announceDelete = async (id, res) => {
  const post = await Post.findByIdAndDelete({ _id: id }, (error, data) => {
    if (error) {
      alert("Cant delete now");
      throw error;
    } else {
      return res.redirect("back");
    }
  });
};
/**
 * !------------------------------------- !
 * @description Electric bill
 * !------------------------------------- !
 */

const electricManage = async (user, data, res) => {
  const { idFlat, last_read, current_read } = data;
  const bill = await Bill.find({ type: "electric" });
  const flats = await Flat.aggregate([
    {
      $match: {
        status: true,
        isPayment: false,
      },
    },
  ]);
  const errors = [];
  if (last_read > current_read) {
    errors.push({ msg: "Số mới không được bé hơn số cũ " });
    if (user.role == "admin") {
      return res.render("adminViews/electric", {
        layout: "adminLayout",
        flat: flats,
        user: user,
        bill: bill,
        errors: errors,
      });
    }
    return res.render("adminViews/electric", {
      layout: "bossLayout",
      flat: flats,
      user: user,
      bill: bill,
      errors: errors,
    });
  }
  const usage = current_read - last_read;
  const total_cost = usage * 2000;

  const date = Date.now();
  const expiration_date = moment(date).add(5, "d").toDate();
  const last_date = moment(date).subtract(1, "months").toDate();
  const newElectricBill = new Bill({
    id_flat: idFlat,
    last_read: last_read,
    current_read: current_read,
    current: current_read,
    usage: usage,
    total_cost: total_cost,
    type: "electric",
    last_date: last_date.getTime(),
    date: date,
    expiration_date: expiration_date.getTime(),
    status: false,
  });
  res.send(newElectricBill);
  await newElectricBill.save();
  return res.redirect("back");
};

const electricBillUpdate = async (data, res) => {
  const { idBill, idFlat, status } = data;
  const update = { status: status };
  const updateBill = await Bill.findOneAndUpdate({ _id: idBill }, update, {
    new: true,
  });
  return res.redirect("back");
};

const electricBillDelete = async (id, res) => {
  const bill = await Bill.findByIdAndDelete({ _id: id }, (error, data) => {
    if (error) {
      alert("Cant delete now");
      throw error;
    } else {
      return res.redirect("back");
    }
  });
};

/**
 * !------------------------------------- !
 * @description Water bill
 * !------------------------------------- !
 */

const waterManage = async (user, data, res) => {
  const { idFlat, last_read, current_read } = data;
  const bill = await Bill.find({ type: "water" });
  const flats = await Flat.aggregate([
    {
      $match: {
        status: true,
        isPayment: false,
      },
    },
  ]);
  const errors = [];
  if (last_read > current_read) {
    errors.push({ msg: "Số mới không được bé hơn số cũ " });
    if (user.role == "admin") {
      return res.render("adminViews/water", {
        layout: "adminLayout",
        flat: flats,
        user: user,
        bill: bill,
        errors: errors,
      });
    }
    return res.render("adminViews/water", {
      layout: "bossLayout",
      flat: flats,
      user: user,
      bill: bill,
      errors: errors,
    });
  }
  const free = 10;
  const usage = current_read - last_read;
  const total = usage - free;
  var total_cost;
  if (total < 0) {
    total_cost = 0;
  } else {
    total_cost = total * 6700;
  }

  const date = Date.now();
  const expiration_date = moment(date).add(5, "d").toDate();
  const last_date = moment(date).subtract(1, "months").toDate();
  const newWaterBill = new Bill({
    id_flat: idFlat,
    last_read: last_read,
    current_read: current_read,
    current: current_read,
    free: free,
    usage: usage,
    total_cost: total_cost,
    type: "water",
    last_date: last_date.getTime(),
    date: date,
    expiration_date: expiration_date.getTime(),
    status: false,
  });
  await newWaterBill.save();
  return res.redirect("back");
};

const waterBillUpdate = async (data, res) => {
  const { idBill, idFlat, status } = data;
  const update = { status: status };
  const updateBill = await Bill.findOneAndUpdate({ _id: idBill }, update, {
    new: true,
  });
  return res.redirect("back");
};

const waterBillDelete = async (id, res) => {
  const bill = await Bill.findByIdAndDelete({ _id: id }, (error, data) => {
    if (error) {
      alert("Cant delete now");
      throw error;
    } else {
      return res.redirect("back");
    }
  });
};

/**
 * !------------------------------------- !
 * @description Validate Options
 * !------------------------------------- !
 */

const validateUsername = async (username) => {
  return (await Account.findOne({ username: username })) ? true : false;
};
const validateEmail = async (email) => {
  return (await Account.findOne({ email: email })) ? true : false;
};
const verifyEmail = (email, mailToken) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });
  const url = `http://localhost:5000/admin/verify-mail/${mailToken}`;
  const mailOptions = {
    from: "SocialNetWork<hoangphu1428@gmail.com>",
    to: email,
    subject: "Please verify your email!",
    html: `
           <p>Please click the link below for verify your email address</p>
           <a href="${url}">Click here to active your account ! </a>
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

const sendEmailPW = (email, mailToken) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });
  const url = `http://localhost:5000/admin/change-password/${mailToken}`;
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

const sendEmail = (email, password) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });
  const mailOptions = {
    from: "SocialNetWork<hoangphu1428@gmail.com>",
    to: email,
    subject: "Here is your account",
    html: `
         <p> <h5>Email:</h5> ${email}</p>
          <p><h5>Password:</h5> ${password}</p>
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
  registrationAdmin,
  verifyEmailToken,
  sendEmailPassword,
  changePWDAD,
  resendMail,
  loginAdmin,
  isAdmin,
  createLimit,
  updateAdmin,
  changePasswordAd,
  updatePasswordAd,
  updateActivation,
  deleteAdmin,
  registrationResident,
  updateResident,
  deleteResident,
  accountResident,
  createFlat,
  updateFlat,
  deleteFlat,
  announceManage,
  announceUpdate,
  announceDelete,
  electricManage,
  electricBillUpdate,
  electricBillDelete,
  waterManage,
  waterBillUpdate,
  waterBillDelete,
};
