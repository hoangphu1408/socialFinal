// require  Model
const Account = require("../models/account");
const Resident = require("../models/resident");

// require module
const bcrypt = require("bcryptjs");
const { KEY, MAIL, EMAIL, PASSWORD } = require("../config");
const jwt = require("jsonwebtoken");
const { regAdminValidation, loginValidation } = require("../config/validation");
const moment = require("moment");
const nodemailer = require("nodemailer");

/**
 * @description Register Admin
 */

const registrationAdmin = async (data, role, res) => {
  try {
    const errors = [];
    const { username, email, password, password2 } = data;
    const { error } = await regAdminValidation(data);
    if (error) {
      if (error.details[0].type === "any.only") {
        errors.push({ msg: "Password do not match" });
        return res.status(400).send(errors);
      }
      errors.push({ msg: error.details[0].message });
      return res.status(400).send(errors);
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
    return res.status(400).send(errors);
  }
  const isMail = await validateEmail(email);
  if (!isMail) {
    errors.push({ msg: "Email or password incorrect!" });
    return res.status(400).send(errors);
  }
  const mail = await Account.findOne({ email: email });
  res.send(mail.password);
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
    return res.send("success");
  } catch (err) {
    return res.send("Verify Error");
  }
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
           <a href="${url}">${url}</a>
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
  loginAdmin,
};
