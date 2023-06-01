const Joi = require("joi");
const signUpSchema = Joi.object().keys({
  email: Joi.string().email().required().min(7),
  password: Joi.string().min(6).max(12).required(),
  referrer:Joi.number().optional()
});

const signInSchema = Joi.object().keys({ 
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const passwordresetcode = Joi.object().keys({ 
  email: Joi.string().required().email(), 
});

const resetpassword = Joi.object().keys({
  email: Joi.string().required().email(),
  code: Joi.string().required(),
  password:Joi.string().min(6).max(12).required(),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .options({
      language: {
        any: {
          empty: 'is required',
        },
        string: {
          any: {
            allowOnly: 'must match password',
          },
        },
      },
    })
    .label('Confirm password'),

})

const edituser = Joi.object().keys({
  email:Joi.string().email().optional(),
  password:Joi.string().min(6).max(12).optional(),
  firstName:Joi.string().optional(),
  lastName:Joi.string().optional(),
  dob:Joi.string().optional(),
  address:Joi.string().optional(),
  referrer:Joi.number().optional()
})

const schemas = {
    signUpSchema,
    signInSchema,
    resetpassword,
    passwordresetcode,
    edituser
};
module.exports = schemas;