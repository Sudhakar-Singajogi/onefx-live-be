const Joi = require("joi");
const signUpSchema = Joi.object().keys({
  userName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.number().min(6).max(12).required(),
});

const schemas = {
    signUpSchema,
};
module.exports = schemas;