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

  module.exports = {
    returnResult,
    retrunResponse,
    catchError,
    logToWinston
  }