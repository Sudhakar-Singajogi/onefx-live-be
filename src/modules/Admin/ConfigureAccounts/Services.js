const path = require("path");
const Utils = require(path.resolve("src/utils"));
const AccountsModel = require(path.resolve(
  "src/modules/Admin/ConfigureAccounts/AccountsModel"
));
const AccountsTypeModel = require(path.resolve(
  "src/modules/Admin/ConfigureAccounts/AccountTypesModel"
));
const { Op } = require("sequelize");
const md5 = require("md5");

AccountsModel.belongsTo(AccountsTypeModel, {
  through: "accounttypeId",
  foreignKey: "accounttypeId",
});

const AccountTypeAssoc = {
  model: AccountsTypeModel,
  attributes: {
    exclude: ["accounttypeId", "status", "createdAt", "updatedAt"],
  },
};

var self = (module.exports = {
  create: async (obj) => {
    try {
      const insertData = obj.body;

      const paramObj = {
        model: AccountsModel,
        data: insertData,
        insertUpdate: "insert",
        updateOnDuplicateFields: [],
        fetchRowsCond: {},
        offset: 0,
        limit: 10,
        msg: "Create new account",
        excludeFields: ["createdAt", "updatedAt"],
        feature: "accounts",
        includes: [AccountTypeAssoc],
        orderBy: [],
      };

      // bulk update the accounts
      const insertAccounts = await Utils.bulkInsertUpdate(paramObj);

      return insertAccounts
        ? await Utils.returnResult(
            "Accounts retrieval",
            insertAccounts.resultSet,
            null,
            insertAccounts.resultSet.length
          )
        : await Utils.returnResult("Create Account", [], false);
    } catch (err) {
      console.log("syntax:", err);
      return await Utils.catchError("Account creation", err);
    }
  },
  getAccounts: async (obj) => {
    try {
      let cond = obj.hasOwnProperty("cond") ? obj.cond : {};

      const totalResults = await Utils.getTotalRows(
        cond,
        AccountsModel,
        "GetTotalRows of a accounts"
      );

      var offSet = await Utils.checkOffSetLimit(
        "getAccounts",
        obj.offset,
        obj.limit,
        totalResults
      );
      if (typeof offSet != "number") {
        return await Utils.returnResult("accounts", false, offSet[0], null);
      }
      const excludeFields = [
        "accounttypeId",
        "status",
        "createdAt",
        "updatedAt",
      ];

      const includes = [AccountTypeAssoc];
      const orderBy = ["accountId", "DESC"];
      const msg = "get accounts ";
      const fetchObjParams = {
        model: AccountsModel,
        fetchRowsCond: cond,
        offSet: obj.offset,
        limit: obj.limit,
        msg,
        excludeFields,
        includes,
        orderBy,
      };

      const accounts = await Utils.fetchRows(fetchObjParams);
      if (accounts) {
        //get the total
        return await Utils.returnResult(
          "accounts",
          accounts.resultSet,
          null,
          totalResults
        );
      } else {
        return await Utils.returnResult("accounts", false, "No records found");
      }
    } catch (err) {
      console.log("syntax:", err);
      return await Utils.catchError("Get accounts", err);
    }
  },
  updateAccounts: async (obj) => {
    let errors = [];
    const dataToUpdate = [];

    try {
      let accounts = obj.body.accounts;
      let updateSucc = 0;
      let errors = [];
      let updatedData = [];

      for (let i = 0; i < accounts.length; i++) {
        let account = accounts[i];
        let condAccountId = { accountId: account.accountId };
        updatedData.push(condAccountId );

        let excludeFields = ["createdAt", "updatedAt"];
        let field = "name";

        let existingAccountName = await Utils.getAField(
          condAccountId,
          field,
          AccountsModel,
          "check whether account name exists or not",
          excludeFields
        );

        if (existingAccountName === null) {
          errors.push({
            accountName: `Account does not exist with ID ${account.accountId}`,
          });
        } else {
          let condName = {
            where: {
              name: account.name,
              accountId: {
                [Op.not]: account.accountId,
              },
            },
          };
          let anAccountResult = await Utils.findOne({
            cond: condName,
            model: AccountsModel,
            excludes: excludeFields,
          });

          if (!anAccountResult.resultSet) {
            errors.push({
              sectionName: `Cannot create an account with the same name (${account.name})`,
            });
          } else {
            
            let updatedData = {
              accountId: account.accountId,
              name: account.name,
              value: account.value,
              tenure: account.tenure,
              accounttypeId: account.accounttypeId,
              status: account.status,
            };
            try {
              let updatedAccount = await AccountsModel.update(updatedData, {
                where: {accountId:account.accountId},
              }); 
              console.log("Account updated successfully:", updatedAccount ); 

              updateSucc++; // Increment updateSucc for successful update
            } catch (error) {
              console.log("Failed to update account:", error);
            }
          }
        } 
      }

      console.log("dataToUpdate:", updatedData);

      if (errors.length > 0) {
        return await Utils.returnResult("Accounts Update", {
          ValidationErrors: errors,
        });
      }

      const updateAccounts = await Utils.fetchRows({
        model: AccountsModel,
        excludes: ["password"],
        fetchRowsCond: {
          [Op.or]: updatedData,
        },
      });
      
      return await Utils.returnResult("userCreation", updateAccounts);
        
    } catch (err) {
      return await Utils.catchError("section update", err);
    }
  },
});
