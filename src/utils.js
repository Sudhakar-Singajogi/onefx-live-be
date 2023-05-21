const winston = require("winston");

async function catchError(feature, err) {
  await logToWinston({
    Query: JSON.parse(JSON.stringify(err.original)).sql,
    SQLMessage: JSON.parse(JSON.stringify(err.original)).sqlMessage,
  });
  return await returnResult(
    feature,
    false,
    JSON.parse(JSON.stringify(err.original)).sqlMessage
  );
}

async function getTotalRows(
  cond,
  model,
  message,
  excludeFields,
  groupby = false
) {
  return checkRowExists(cond, model, message, groupby);
}


async function checkRowExists(cond, model, message, groupby = false) {
  try {
    const totalRows = await model.count({
      where: cond,
      logging: (sql, queryObject) => {
        loglastExecuteQueryToWinston(message, sql);
      },
    });

    if (groupby !== false) {
      const totalRows = await model.count({
        where: cond,
        group: groupby,
        logging: (sql, queryObject) => {
          loglastExecuteQueryToWinston(message, sql);
        },
      });
    }
    console.log('toal rows are:', totalRows)

    return totalRows;
  } catch (err) {
    console.log('Error is', err);
    return 0;
  }
}

async function returnResult(
  type,
  object,
  customMsg = null,
  totalRecords = null
) {
  console.log("got obj as", object);
  if (object && !object.hasOwnProperty("ValidationErrors")) { 
    return customMsg != null
      ? { message: customMsg, result: [] }
      : {
          message: customMsg != null ? customMsg : "Query Success",
          result: object,
          totalRows: totalRecords > 0 ? totalRecords : 0,
        };
  } else {
    if (object && object.hasOwnProperty("ValidationErrors")) {
      return customMsg != null
        ? { message: customMsg, result: [] }
        : {
            message: "Validation Errors",
            result: object,
            totalRows: 0,
          };
    }
    return customMsg != null
      ? { message: customMsg, result: [] }
      : {
          message: type + " does not exists",
          result: [],
          totalRows: 0,
        };
  }
}

async function retrunResponse(res, Obj) {
    // console.log("got obj", Obj);
    let ValidationErrors = "";
  
    let resultCode = 200;
  
    if (Obj.message.includes("You are not allowed to change")) {
      resultCode = 401 ;
    }
    if (Obj.message.includes("Duplicate entry")) {
      resultCode = 200;
      Obj.message = Obj.message.split(" for key")[0].replace(/'/g, "");
    }
    if (Obj.message.includes("Validation Errors")) {
      resultCode = 200;
      Obj.message = Obj.message.split(" for key")[0].replace(/'/g, "");
      ValidationErrors = Obj.result.ValidationErrors;
      Obj.result = [];
    }
    if (Obj.message.includes("Unauthorized")) {
      resultCode = 401;
      Obj.message = Obj.message.split(" for key")[0].replace(/'/g, "");
    } 
  
    return res.status(resultCode).json({
      result: "OK",
      resultCode: resultCode,
      message: Obj.message,
      ValidationErrors: ValidationErrors,
      data: Obj.result,
      resultTotal: Obj.result.length,
      totalRows: Obj.totalRows,
      "hasMore":(Obj.totalRows>Obj.result.length)
    });
  }

  async function logToWinston(errMsg) {
    const logger = winston.createLogger({
      transports: [
        //new winston.transports.Console(),
        new winston.transports.File({ filename: "errorLogs.log" }),
      ],
    });

    logger.log({
      level: "error",
      message: errMsg,
    });
  }

  async function fetchRows(obj) {
    const model = obj.model;
    console.log('model:', model);
    
    try {
      var params = {
        where: obj.fetchRowsCond,
        attributes: {
          exclude: obj.excludeFields,
        },
        logging: (sql, queryObject) => {
          loglastExecuteQueryToWinston(obj.msg, sql);
        },
      };
      if (obj.hasOwnProperty("includes")) {
        params.include = obj.includes;
      }
      if (obj.hasOwnProperty("limit")) {
        params.offset = obj.offSet;
        params.limit = obj.limit != "" ? parseInt(obj.limit) : 10;
      }
      if (obj.hasOwnProperty("orderBy")) {
        params.order = obj.orderBy.length > 0 ? [obj.orderBy] : [];
      }
      const resultSet = await model.findAll(params);
      console.log('resultSet:', resultSet)
      return {
        success: true,
        message: "Success",
        resultSet: resultSet,
      };
    } catch (e) {
      console.log('error is:', e);
      return {
        success: false,
        message: "Failed to fetch data",
        errorMs: e,
      };
    }
  }

  async function checkOffSetLimit(feature, offset, limit, totalResults) {
    if (
      typeof parseInt(offset) == "number" &&
      typeof parseInt(limit) == "number" &&
      parseInt(offset) >= 0 &&
      parseInt(limit) >= 0
    ) {
      var offSet = offset != "" ? parseInt(offset) : 0;
      
      if (offSet > totalResults) {
        return ["No records found"];
      }
    } else {
      return ["Invalid offset or limit"];
    }
    return parseInt(offSet);
  }

  async function loglastExecuteQueryToWinston(feature, query) {
    console.log("last executed Query:" + query);
    const logger = winston.createLogger({
      transports: [
        //new winston.transports.Console(),
        new winston.transports.File({ filename: "lastexecutedqueriesLogs.log" }),
      ],
    });
  
    logger.log({
      level: "info",
      message: {
        feature: feature,
        Query: query.replace("Executing (default): ", ""),
      },
    });
  }

  module.exports = {
    returnResult,
    retrunResponse,
    catchError,
    logToWinston,
    fetchRows,
    getTotalRows,
    checkRowExists,
    checkOffSetLimit
  }