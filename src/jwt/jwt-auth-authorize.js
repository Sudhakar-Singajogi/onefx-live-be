const path = require("path");
const jwt = require("jsonwebtoken"); 
const md5 = require("md5");

const utils = require(path.resolve("src/utils"));
const APPCONS = require(path.resolve("appconstants"));
const users = require(path.resolve("src/modules/User/SignInUp/Users"));
const userService = require(path.resolve("src/modules/User/SignInUp/Services"));
// const rolePermServ = require(path.resolve("src/modules/rolepermissions/services"));

const expiresIn = "1600m";
const jwtAuthenticate = () => {
  return async (req, res, next) => {
    console.log(req.body.loginId);

    ///check whether the user exists or not
    let user = await userService.signIn(req.body);
    console.log('user login is:', user)

    if (user.message !== "Query Success") {
      return res.status(202).json(APPCONS.INVALIDUSERCREDENTIALS);
    } else {
      //generate token
      const [accessToken, refreshToken] = await Promise.all([
        generateToken(user, "accessToken"),
        generateToken(user, "refreshToken"),
      ]);

      await utils.setTokenParams(user.result.email, accessToken, refreshToken);
      
      delete user.result.success;
      delete user.result.message
      
      const userObj =  {
        userName: user.result.resultSet.userName,
        email: user.result.resultSet.email,
        userId:user.result.resultSet.userId
      }
      
      res.json({
        result: "OK",
        resultCode: 200,
        loginSuccess: true,
        user: userObj,
        accessToken,
        refreshToken,
      });
      req.user = user.result;
      next();
    }
  };
};

async function generateToken(user, type) {
  if (type === "accessToken") {
    if (user.result) {
      return jwt.sign(
        {
          user: user.result.userName,
          email: user.result.email,
        },
        //process.env.ACCESS_TOKEN_SECRET, { expiresIn }
        APPCONS.ACCESS_TOKEN_SECRET,
        { expiresIn }
      );
    } else {
      // console.log("HEY", user);
      return jwt.sign(
        {
          user: user.user,
          email: user.email,
        },
        APPCONS.ACCESS_TOKEN_SECRET,
        { expiresIn }
      );
    }
  } else {
    if (user.result) {
      return jwt.sign(
        {
          user: user.result.userName,
          email: user.result.email,
        },
        APPCONS.REFRESH_TOKEN_SECRET
      );
    } else {
      return jwt.sign(
        {
          user: user.userName,
          email: user.email,
        },
        APPCONS.REFRESH_TOKEN_SECRET
      );
    }
  }
}

const jwtAuthorise = (feature = null, functionality = null) => {
  return async (req, res, next) => {
    const refreshToken = req.headers["refreshtoken"];
    const token = req.headers["x-access-token"];
    console.log('request headers', req.headers);
    console.log("refreshToken", refreshToken);

    if (!token) {
      return res.status(401).json(APPCONS.ACCESSTOKENREQUIRED);
    }

    jwt.verify(token, APPCONS.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        console.log("Invalid Access Token check the refresh token");
        //return res.status(202).json(APPCONS.INVALIDTOKEN);
        req.invalidToken = APPCONS.INVALIDTOKEN;
        next();
      }
    })
  }
}

module.exports = {
  jwtAuthenticate,
  jwtAuthorise,
};
