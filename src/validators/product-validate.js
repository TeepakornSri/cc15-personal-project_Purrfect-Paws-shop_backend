const Joi = require("joi");

const checkProductId = Joi.object({
  productId: Joi.number().integer().positive().required(),
});

exports.checkProductId = checkProductId;
