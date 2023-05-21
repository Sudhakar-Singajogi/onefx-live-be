const path = require("path");
const Utils = require(path.resolve("src/utils"));
const UserModel = require(path.resolve("src/modules/User/SignInUp/Users"));

const bringUsers = async ( obj) => { 
    const excludeFields = ["createdAt", "updatedAt"];
    console.log('object is', obj)
      let orderBy = ["userId", "DESC"];
      if(obj.hasOwnProperty('orderBy')) {
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

      if(obj.hasOwnProperty('offset')) {
        fetchObjParams.offSet = obj.offSet;
        fetchObjParams.limit = obj.limit
      }
      
      const users = await Utils.fetchRows(fetchObjParams);
      
      if (users) {
        return users;
      }

      return [];

}


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
          const referredUsers = await bringUsers({cond:{referrer:reqObj.userId}})
          if(referredUsers) {
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
        limit:reqObj.limit,
        orderBy
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
});
