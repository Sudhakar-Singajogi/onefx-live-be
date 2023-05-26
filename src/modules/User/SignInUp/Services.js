const path = require("path");
const Utils = require(path.resolve("src/utils"));
const UserModel = require(path.resolve("src/modules/User/SignInUp/Users"));
const ActivationCodeModel = require(path.resolve(
  "src/modules/User/SignInUp/ActivationCodes"
));
const { Op } = require("sequelize");
const md5 = require("md5");

const errHandler = (err) => {
  console.log("Error:", err);
};

const bringUsers = async (obj) => {
  const excludeFields = ["createdAt", "updatedAt"];
  
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

  if (obj.hasOwnProperty("offset")) {
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
      const users = await bringUsers(cond);
      if (users) {
        delete users.success;
        delete users.message;

        //get the users who has been referred by this user
        const referredUsers = await bringUsers({
          cond: { referrer: reqObj.userId },
        });
        if (referredUsers) {
          users.refferalusers = referredUsers.resultSet;
        }
        //get the total

        return await Utils.returnResult("users", users, null, 1);
      } else {
        return await Utils.returnResult("users", false, "No records found");
      }
    } catch (err) { 
      return await Utils.catchError("Get users of a user", err);
    }
  },
  getUsers: async (reqObj) => {
    try {
      var cond = reqObj.cond;

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
    const dummyUser = reqObj.body;
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
    const setStatus = { status: "1"}
    const cond = {where:{userId:userId}}
    await UserModel.update(setStatus,cond);

    //delete the activation code
    await ActivationCodeModel.destroy({
      where: { code: reqObj.activationCode },
    });

    rsSet.resultSet = [];

    return await Utils.returnResult("userCreation", rsSet);
  },

  signIn:async(reqObj) => {
    const user = await Utils.findOne({
      model: UserModel,
      excludes:['password', 'referrer'],
      fetchRowCond: {
        [Op.or]: [{ email: reqObj.userId }, { userName: reqObj.userId }], 
        [Op.and]:[{password: md5(reqObj.password)}, {status:1}]
       },
    });
    
    if(!user.resultSet) {
      user.ValidationErrors = {
        Error: "Invalid credentials, please chek your userid and password",
      };
      return await Utils.returnResult("userCreation", user);

    } 
    
    return user
      ? await Utils.returnResult("user", user)
      : await Utils.returnResult("user", user, "No record found");
  }
});
