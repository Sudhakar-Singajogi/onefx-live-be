const Joi = require("joi");
const signUpSchema = Joi.object().keys({
  userName: Joi.string().min(5).required(),
  email: Joi.string().email().required().min(7),
  password: Joi.string().min(6).max(12).required(),
});

const signInSchema = Joi.object().keys({ 
  userId: Joi.string().required(),
  password: Joi.string().required(),
});

const schemas = {
    signUpSchema,
    signInSchema
};
module.exports = schemas;