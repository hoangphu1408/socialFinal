const Joi = require("@hapi/joi");

const regAdminValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(6).max(30).required().messages({
      "string.empty": `Username cannot empty`,
      "string.min": `Username is minimum of length 6`,
      "string.max": `Username is maximum of length 30`,
      "any.required": `User name is required`,
    }),
    email: Joi.string().email().required().messages({
      "string.empty": `Email cannot empty`,
      "string.email": `Email is invalid`,
      "any.required": `Email is required`,
    }),
    password: Joi.string()
      .min(6)
      .pattern(new RegExp("^[a-zA-Z0-9]{6,30}$"))
      .messages({
        "string.empty": `password cannot be an empty field`,
        "string.min": `password should have a minimum length of 6`,
        "string.max": `password should have a maximum length of 30`,
        "any.required": `password is a required field`,
        "string.pattern.base": `Password should be clean`,
      }),
    password2: Joi.ref("password"),
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": `Email cannot empty`,
      "string.email": `Email is invalid`,
      "any.required": `Email is required`,
    }),
    password: Joi.string()
      .min(6)
      .pattern(new RegExp("^[a-zA-Z0-9]{6,30}$"))
      .messages({
        "string.empty": `password cannot be an empty field`,
        "string.min": `password should have a minimum length of 6`,
        "string.max": `password should have a maximum length of 30`,
        "any.required": `password is a required field`,
        "string.pattern.base": `Password should be clean`,
      }),
  });
  return schema.validate(data);
};

const regResidentValidation = (data) => {
  const schema = Joi.object({
    full_name: Joi.string().messages({
      "string.empty": `Fullname cannot empty`,
      "string.min": `Fullname is minimum of length 6`,
      "string.max": `Fullname is maximum of length 30`,
      "any.required": `Fullname is required`,
    }),
  });
  return schema.validate(data);
};

const regAccountResident = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": `Email cannot empty`,
      "string.email": `Email is invalid`,
      "any.required": `Email is required`,
    }),
    password: Joi.string()
      .min(6)
      .pattern(new RegExp("^[a-zA-Z0-9]{6,30}$"))
      .messages({
        "string.empty": `password cannot be an empty field`,
        "string.min": `password should have a minimum length of 6`,
        "string.max": `password should have a maximum length of 30`,
        "any.required": `password is a required field`,
        "string.pattern.base": `Password should be clean`,
      }),
    password2: Joi.ref("password"),
  });
  return schema.validate(data);
};

module.exports = {
  regAdminValidation,
  loginValidation,
  regResidentValidation,
  regAccountResident,
};
