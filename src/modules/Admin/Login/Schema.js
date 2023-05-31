const Joi = require("joi");

const adminLoginSchema = Joi.object().keys({ 
  email: Joi.string().required(),
  password: Joi.string().required(),
}); 

const schemas = {
    adminLoginSchema,
};
module.exports = schemas;