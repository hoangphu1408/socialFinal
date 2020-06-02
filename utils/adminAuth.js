// require  Model
const Account = require("../models/account");
const Resident = require("../models/resident");

// require module
const bcrypt = require("bcryptjs");
const { KEY, MAIL, EMAIL, PASSWORD } = require("../config");
const jwt = require("jsonwebtoken");
const {
  regAdminValidation,
  loginValidation,
  regResidentValidation,
} = require("../config/validation");
const moment = require("moment");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

/**
 * @description Register Admin
 */

const registrationAdmin = async (data, email, role, res) => {
  try {
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
          user: email,
        });
      }
      errors.push({ msg: error.details[0].message });
      return res.status(400).render("adminViews/register", {
        layout: "bossLayout",
        admin: admin,
        errors: errors,
        user: email,
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
    });

    await newAccount.save();
    return res.send("success");
  } catch (err) {
    return res.send(err);
  }
};

/**
 * @description Login Admin
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
    maxAge: 900000,
    httpOnly: true,
  });
  return res.redirect("/admin/dashboard");
};

/**
 * @description Verify Email
 */

const verifyEmailToken = async (token, res, next) => {
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
 * @description Resend mail
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
 * @description Rate Limit
 */

const createLimit = rateLimit({
  windowMs: 60000,
  max: 1,
  message: "Too many request",
});

/**
 * @description Registration Resident
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
  const household_registration = [];
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
  if (household == "temporary_resident") {
    household_registration.push({ type: "Tạm trú" });
  } else if (household == "permanent_resident") {
    household_registration.push({ type: "Thường trú" });
  } else {
    household_registration.push({ type: "Chưa cập nhật " });
  }
  const newResident = new Resident({
    full_name: full_name,
    year_of_birth: yearOfBirth,
    private_information: private_information,
    household_registration: household_registration,
    date: Date.now(),
  });
  await newResident.save();
  return res.redirect("back");
};

/**
 * @description Validate Options
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
    }
  });
};

module.exports = {
  registrationAdmin,
  verifyEmailToken,
  resendMail,
  loginAdmin,
  isAdmin,
  createLimit,
  registrationResident,
};
