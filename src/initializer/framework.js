const express = require("express");
const _ = require("lodash");
const path = require("path");
const modules = require(path.resolve("src/initializer/appModules"));
const { method } = require("lodash");
const Joi = require("joi");
const Utils = require(path.resolve("src/utils"));
const cors = require("cors");
const device = require('express-device');

/** Add the modules entity here */

const Sequelize = require("sequelize"); 
const sequelize = require(path.resolve("src/dbconn/connection"));

const applicationModules = sequelize.define("Modules", {
  moduleId: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  module: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM("1", "0"),
    allowNull: false,
    defaultValue: "0",
  },
});

const joiMiddleware = (schema, property = false) => {
  return async (req, res, next) => {
    
    console.log('requested body is:', req.body);

    const { error } = Joi.validate(req.body, schema);
    console.log('joiMiddleware errros are : ', error)
    const valid = error == null;
    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      res.status(200).json({ error: message });
    }
  };
};

const connectRouters = (app) => {
  app.use(device.capture());

  modules.modules.forEach((element) => {
    const currentElement = element.toLowerCase();
    console.log("currentElement: " + currentElement);

    if (currentElement == "kickstart" || currentElement == "installation" || currentElement == "welcome") {
    } else {
      // addNewModule(currentElement);
    }

    let routerPath = path.resolve("src/modules/" + currentElement + "/Router" )
    console.log('routerPath:', routerPath);
    // console.log('app obj is', app)
    app.use(
      "/api/" + currentElement,
      require(routerPath)
    );
    
    /*
    app.use(
      "/api/" + currentElement,
      require("../modules/" + currentElement + "/Router")
    );
    */

  });
  app.use(cors());

};

//to insert a new modules if not esists in the table
async function addNewModule(moduleName) {
  const resSet = await applicationModules
    .findOne({
      where: {
        module: moduleName,
      },
    })
    .catch((err) => {
      return Utils.catchError(moduleName, err);
    });
  console.log("asa" + resSet);
  if (resSet === null) {
    const newModule = {
      module: moduleName,
      status: 1,
    };
    await applicationModules.create(newModule);
  }
}

module.exports = {
  connectRouters,
  express,
  joiMiddleware,
};
