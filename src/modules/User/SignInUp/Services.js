const path = require("path");
const Utils = require(path.resolve("src/utils"));
const UserModel = require(path.resolve("src/modules/User/SignInUp/Users"));
const ActivatioCodeModel = require(path.resolve(
  "src/modules/User/SignInUp/ActivationCodes"
));
const { Op } = require("sequelize");

const errHandler = (err) => {
  console.log("Error:", err);
};

const bringUsers = async (obj) => {
  const excludeFields = ["createdAt", "updatedAt"];
  console.log("object is", obj);
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
      console.log("syntax:", err);
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
      console.log("syntax:", err);
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

      console.log("activateCodeModelObj:", activateCodeModelObj);

      await ActivatioCodeModel.create({
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
    console.log("timenow is:", Date.now());

    const rsSet = await Utils.findOne({
      model: ActivatioCodeModel,
      fetchRowCond: {
        code: reqObj.activationCode,
        expiryTime: { [Op.gte]: Date.now() },
      },
    });

    console.log('respo:', rsSet)

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
    await ActivatioCodeModel.destroy({
      where: { code: reqObj.activationCode },
    });

    rsSet.resultSet = [];

    return await Utils.returnResult("userCreation", rsSet);
  },
});
