const Joi = require("joi");

const registerSchema = Joi.object({
  firstName: Joi.string().trim().required(),
  role: Joi.string().trim(),
  lastName: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  password: Joi.string().pattern(/^[a-zA-Z0-9]{6,30}$/),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .trim()
    .required()
    .strip(),
});

exports.registerSchema = registerSchema;

const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

exports.loginSchema = loginSchema;

const updateprofileSchema = Joi.object({
  firstName: Joi.string().trim(),
  lastName: Joi.string().trim(),
  address: Joi.string().trim(),
  phoneNumber: Joi.string().pattern(/^[0-9]{10}$/),
});

exports.updateprofileSchema = updateprofileSchema;

const updateProductSchema = Joi.object({
  productName: Joi.string().trim().required(),
  productImg: Joi.string(),
  productdescription: Joi.string(),
  price: Joi.number().precision(2).required(),
  categoryId: Joi.number().required(),
});

exports.updateProductSchema = updateProductSchema;
