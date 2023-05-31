const Joi = require("joi");
const updateAccounts = Joi.object().keys({
    accounts: Joi.array().items(
      Joi.object()
        .keys({
          accountId: Joi.number().required(),
          name: Joi.string().trim().optional(),
          value: Joi.string().trim().optional(),
          tenure: Joi.string().trim().optional(),
          accounttypeId: Joi.number().optional(),
        })
        .optional()
    ),
  });

const schemas = {
    updateAccounts
};
module.exports = schemas;