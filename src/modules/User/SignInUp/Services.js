const path = require("path");
const Utils = require(path.resolve("src/utils"));
const UserModel = require(path.resolve("src/modules/User/SignInUp/Users"));
const ResetPwdCodeModel = require(path.resolve(
  "src/modules/User/SignInUp/ResetPasswordCodes"
));
const ActivationCodeModel = require(path.resolve(
  "src/modules/User/SignInUp/ActivationCodes"
));
const emailtemplates = require(path.resolve("src/emailtemplates/templates"));
const { getReferrals } = require(path.resolve("src/businesslogic"));

const { Op } = require("sequelize");
const md5 = require("md5");

const errHandler = (err) => {
  console.log("Error:", err);
};

const bringUsers = async (obj) => {
  const excludeFields = ["createdAt", "updatedAt", "password"];

  let orderBy = ["userId", "DESC"];
  if (obj.hasOwnProperty("orderBy")) {
    orderBy = obj.orderBy;
  }
  const msg = "get users";

  const fetchObjParams = {
    model: UserModel,
    fetchRowsCond: obj.cond,
    msg,
    excludeFields,
    orderBy,
  };

  if (obj.hasOwnProperty("offSet")) {
    fetchObjParams.offSet = obj.offSet;
    fetchObjParams.limit = obj.limit;
  }

  const users = await Utils.fetchRows(fetchObjParams);

  if (users) {
    return users;
  }

  return [];
};

var self = (module.exports = {
  getAUser: async (reqObj) => {
    try {
      var cond = {
        userid: reqObj.userId,
      };

      const user = await Utils.findOne({
        model: UserModel,
        excludes: ["password", "role"],
        fetchRowCond: {
          [Op.and]: [{ userid: reqObj.userId }, { status: 1 }],
        },
      });

      console.log("user is:", user);

      if (!user.resultSet) {
        user.ValidationErrors = {
          Error: "Invalid credentials, please chek your userid and password",
        };
        return await Utils.returnResult("userCreation", user);
      }
      if (user) {
        delete user.success;
        delete user.message;

        //get the users who has been referred by this user
        const refferalusers = await bringUsers({
          cond: { referrer: reqObj.userId },
        });

        if (refferalusers.resultSet) {
          user.resultSet.referrer = refferalusers.resultSet;          
          await user.resultSet.save();
        }

        return await Utils.returnResult("users", user, null, 1);
      } else {
        return await Utils.returnResult("users", false, "No records found");
      }
    } catch (err) {
      return await Utils.catchError("Get users of a user", err);
    }
  },
  getUsers: async (reqObj) => {
    try {
      var cond = reqObj.hasOwnProperty("cond") ? reqObj.cond : {};

      const totalResults = await Utils.getTotalRows(
        cond,
        UserModel,
        "Get users"
      );

      // const totalResults = 10;
      var offSet = await Utils.checkOffSetLimit(
        "getUsers",
        reqObj.offset,
        reqObj.limit,
        totalResults
      );

      if (typeof offSet != "number") {
        return await Utils.returnResult("Users", false, offSet[0], null);
      }
      const orderBy = ["userId", "ASC"];
      let users = await bringUsers({
        cond,
        offSet,
        limit: reqObj.limit,
        orderBy,
      });

      if (users) {
        delete users.success;
        delete users.message;

        //get the total
        return await Utils.returnResult("users", users, null, totalResults);
      } else {
        return await Utils.returnResult("users", false, "No records found");
      }
    } catch (err) {
      return await Utils.catchError("Get users of a user", err);
    }
  },
  signUp: async (reqObj) => {
    console.log('new user is:', reqObj)
    const dummyUser = reqObj;
    const newUser = await UserModel.create({
      ...dummyUser,
      logging: (sql, queryObject) => {
        Utils.loglastExecuteQueryToWinston("create a new user", sql);
      },
    }).catch(errHandler);

    if (newUser) {
      const encrypteduserActivationId = Utils.encryptData(Date.now());
      const currentTime = Date.now();

      // Set the desired time (24 hours in this example)
      const desiredTime = new Date(currentTime);
      desiredTime.setHours(24, 0, 0, 0);
      const activatationCodeExpiry = desiredTime.getTime();

      //store the activation code again the userId
      const activateCodeModelObj = {
        userId: newUser.userId,
        code: encrypteduserActivationId,
        expiryTime: activatationCodeExpiry,
      };

      await ActivationCodeModel.create({
        ...activateCodeModelObj,
        logging: (sql, queryObject) => {
          Utils.loglastExecuteQueryToWinston(
            `Created activation code for the user: ${newUser.userId}`,
            sql
          );
        },
      }).catch(errHandler);

      const mailData = {
        from: "ssr.sudhakar@gmail.com", // sender address
        to: dummyUser.email, // list of receivers
        subject:
          "Registration completed please click the below link to activate",
        text: "That was easy!",
        html: `<h1>Dear ${dummyUser.userName},</h1>
          <p>Thanks for showing interest in us please click the below link to activate your account</p>
          <a href="http://localhost:8080/api/user/signinup/activate/${encrypteduserActivationId}" href="_blank">Activate</a>
          `,
      };

      await Utils.sendMail(mailData);

      const rsSet = await UserModel.findByPk(newUser.userId, {
        include: [],
        attributes: {
          exclude: ["passsword", "status", "createdAt", "updatedAt"],
        },
      });
      if (rsSet) {
        return await Utils.returnResult("userCreation", rsSet);
      }
    }
  },
  activate: async (reqObj) => {
    const rsSet = await Utils.findOne({
      model: ActivationCodeModel,
      fetchRowCond: {
        code: reqObj.activationCode,
        expiryTime: { [Op.gte]: Date.now() },
      },
    });

    if (!rsSet.resultSet) {
      rsSet.ValidationErrors = {
        Error: "Invalid activation code or activation code might have expired",
      };
      return await Utils.returnResult("userCreation", rsSet);
    }

    const userId = rsSet.resultSet.userId;

    // activate the user.
    const setStatus = { status: "1" };
    const cond = { where: { userId: userId } };
    await UserModel.update(setStatus, cond);

    //delete the activation code
    await ActivationCodeModel.destroy({
      where: { code: reqObj.activationCode },
    });

    rsSet.resultSet = [];

    return await Utils.returnResult("userCreation", rsSet);
  },

  signIn: async (reqObj) => {
    const user = await Utils.findOne({
      model: UserModel,
      excludes: ["password", "referrer"],
      fetchRowCond: {
        [Op.and]: [
          { email: reqObj.email },
          { password: md5(reqObj.password) },
          { status: 1 },
        ],
      },
    });
    console.log('service user is:', user)

    if (!user.resultSet) {
      user.ValidationErrors = {
        Error: "Invalid credentials, please chek your userid and password",
      };
      return await Utils.returnResult("userCreation", user);
    }

    return user
      ? await Utils.returnResult("user", user)
      : await Utils.returnResult("user", user, "No record found");
  },
  sendpasswordresetcode: async (email) => {
    const user = await Utils.findOne({
      model: UserModel,
      excludes: ["password", "referrer"],
      fetchRowCond: {
        [Op.or]: [{ email: email }],
      },
    });

    const userName = user.resultSet.userName;

    if (!user.resultSet) {
      user.ValidationErrors = {
        Error: "Check your entered email",
      };
      return await Utils.returnResult("sendpasswordresetcode", user);
    }

    let resetPwdCode = await Utils.generateRandomString(6);
    resetPwdCode = Utils.convertStringToUpperLowercase(resetPwdCode);

    const currentTime = Date.now();

    // Set the desired time (24 hours in this example)
    const desiredTime = new Date(currentTime);
    desiredTime.setHours(24, 0, 0, 0);
    const codeExpiry = desiredTime.getTime();

    //store the reset code again the userId
    const resetpwdCodeModelObj = {
      email: email,
      code: resetPwdCode,
      expiryTime: codeExpiry,
    };

    await ResetPwdCodeModel.create({
      ...resetpwdCodeModelObj,
      logging: (sql, queryObject) => {
        Utils.loglastExecuteQueryToWinston(
          `Created reset password code for the user: ${user.userId}`,
          sql
        );
      },
    }).catch(errHandler);

    let pwdresetcode_template = emailtemplates.sendpasswordresetcode;
    pwdresetcode_template = pwdresetcode_template.replace(
      "[user_name]",
      userName
    );
    pwdresetcode_template = pwdresetcode_template.replace(
      "[reset_pwd_code]",
      resetPwdCode
    );

    const mailData = {
      from: "ssr.sudhakar@gmail.com", // sender address
      to: email, // list of receivers
      subject: "Reset password code",
      text: "That was easy!",
      html: pwdresetcode_template,
    };

    await Utils.sendMail(mailData);

    return user
      ? await Utils.returnResult("user", user)
      : await Utils.returnResult("user", user, "No record found");
  },
  resetpassword: async (reqObj) => {
    const user = await Utils.findOne({
      model: UserModel,
      excludes: ["password", "referrer"],
      fetchRowCond: { email: reqObj.email },
    });

    if (!user.resultSet) {
      user.ValidationErrors = {
        Error: "Invalid userId, please chek your userid",
      };
      return await Utils.returnResult("passwordReset", user);
    }

    //check whether entered code is belongs to this user or not

    const code = await Utils.findOne({
      model: ResetPwdCodeModel,
      excludes: ["createdAt", "updatedAt"],
      fetchRowCond: { email: reqObj.email },
      order: ["resetpwdcodeId", "DESC"],
    });

    if (code.resultSet.code !== reqObj.code) {
      user.ValidationErrors = {
        Error: "Enter code is not valid",
      };
      return await Utils.returnResult("sendpasswordresetcode", user);
    }

    const setPassword = { password: md5(reqObj.password) };
    const cond = {
      where: { email: reqObj.email },
    };

    const updateResp = await Utils.updateData(UserModel, setPassword, cond);

    if (updateResp.error) {
      user.DBErrors = {
        Error: "Failed to reset password kindly contact admin",
      };
    }

    //delete the activation code
    await ResetPwdCodeModel.destroy({
      where: { email: reqObj.email },
    });
    return await Utils.returnResult("passwordReset", user);
  },
  updateUser: async(reqObj) => {
    let condName = { userId: reqObj.userId, };
    let excludeFields = ["createdAt", "updatedAt"];
    let user = await Utils.findOne({
      fetchRowCond: condName,
      model: UserModel,
      excludes: excludeFields,
    });
    
    if(!user.resultSet) {
      user.ValidationErrors = {
        Error: "User does not exists, please chek your userid",
      };
      return await Utils.returnResult("userCreation", user);
    }

    let updatedFields = {};
    

    if (reqObj.hasOwnProperty("email")) {
      updatedFields.email = reqObj.email;
    }

    if (reqObj.hasOwnProperty("password")) {
      updatedFields.password = reqObj.password;
    }
    if (reqObj.hasOwnProperty("referrer")) {
      updatedFields.referrer = reqObj.referrer;
    }
    if (reqObj.hasOwnProperty("firstName")) {
      updatedFields.firstName = reqObj.firstName;
    }
    if (reqObj.hasOwnProperty("lastName")) {
      updatedFields.lastName = reqObj.lastName;
    }
    if (reqObj.hasOwnProperty("dob")) {
      updatedFields.dob = reqObj.dob;
    }
    if (reqObj.hasOwnProperty("address")) {
      updatedFields.address = reqObj.address;
    }
    
    try {
      await user.resultSet.update(updatedFields); 
    } catch (error) {
      Utils.loglastExecuteQueryToWinston("Updating a user", error);
      user.ValidationErrors = {
        Error: "Failed to update the user",
      };
      return await Utils.returnResult("userCreation", user);
    }
    
    return await Utils.returnResult("userCreation", user);
  },
  deleteUser: async(userId) => {
    let condName = { userId: userId};
    let excludeFields = ["createdAt", "updatedAt"];
    let user = await Utils.findOne({
      fetchRowCond: condName,
      model: UserModel,
      excludes: excludeFields,
    });

    console.log('user is:', user);

    
    if(!user.resultSet) {
      user.ValidationErrors = {
        Error: "User does not exists, please chek your userid",
      };
      return await Utils.returnResult("userCreation", user);
    }

    
    const cond = {where: condName};

    const updateResp = await Utils.updateData(UserModel, {"status":'0'}, cond);

    if (updateResp.error) {
      user.DBErrors = {
        Error: "Failed to reset password kindly contact admin",
      };
    }
    user.resultSet.status='0';
    user.resultSet.save();    
    return await Utils.returnResult("userupdation", user);
    
  }
});
