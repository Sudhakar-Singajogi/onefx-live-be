const path = require("path");
const jwt = require("jsonwebtoken");
const md5 = require("md5");

const utils = require(path.resolve("src/utils"));
const APPCONS = require(path.resolve("appconstants"));
const users = require(path.resolve("src/modules/User/SignInUp/Users"));
const userService = require(path.resolve("src/modules/User/SignInUp/Services"));
const tokensModel = require(path.resolve("src/modules/User/SignInUp/Tokens"));
const adminService = require(path.resolve("src/modules/Admin/Login/Services"));

const expiresIn = "1600m"; 
const jwtAuthenticate = (model = null) => {
  return async (req, res, next) => {
    let user = null;   

    ///check whether the user exists or not
    if (!model) {
      user = await userService.signIn(req.body);
    } else { 
      user = await adminService.login(req.body);
    }

    if (user.message !== "Query Success") {
      return res.status(202).json(APPCONS.INVALIDUSERCREDENTIALS);
    } else {
      //generate token
      user = user.result.resultSet;
      console.log('user is:', user)
      const [accessToken, refreshToken] = await Promise.all([
        generateToken(user, "accessToken"),
        generateToken(user, "refreshToken"),
      ]);

      await utils.setTokenParams(user.email, accessToken, refreshToken);
      const userObj = {
        email: user.email,
        userId: user.userId,
        admin: user.role === 'admin' ? true: false,
      };
      console.log('user Object is:', userObj)
      console.log('user Role is:', user)
      
      if (user.role === 'user') {
        // Invalidate existing tokens for the user
        await invalidateUserTokens(userObj.email, async () => {
          // create a new token on the token table
          const tokenModelObj = {
            email: userObj.email,
            token: accessToken,
          };

          console.log('tokenmodel token is:', tokenModelObj)
          await tokensModel
            .create({
              ...tokenModelObj,
              logging: (sql, queryObject) => {
                utils.loglastExecuteQueryToWinston(
                  `Created new token for the login user: ${userobj.email}`,
                  sql
                );
              },
            })
            .catch(errHandler);
        });
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

const errHandler = (err) => {
  console.log("Error:", err);
};

// Invalidate existing tokens for a user
async function invalidateUserTokens(email, callback) {
  //perform update, make the existing email taoken invalidate
  const cond = { email: email };

  //check already token exists with this email
  const token = await utils.findOne({
    model: tokensModel,
    excludes: ["invalidated", "createdAt", "updatedAt"],
    fetchRowCond: { email: email },
  });

  if (token.resultSet) {
    const data = { invalidated: 1 };
    const model = tokensModel;
    await utils.updateData(model, data, { where: cond });
  }

  callback();
}

async function generateToken(user, type) {
  if (type === "accessToken") {
    if (user.result) {
      return jwt.sign(
        {
          email: user.email,
          admin: user.role === 'admin' ? true: false,
        },
        //process.env.ACCESS_TOKEN_SECRET, { expiresIn }
        APPCONS.ACCESS_TOKEN_SECRET,
        { expiresIn }
      );
    } else {
      return jwt.sign(
        {
          email: user.email,
          admin: user.role === 'admin' ? true: false,
        },
        APPCONS.ACCESS_TOKEN_SECRET,
        { expiresIn }
      );
    }
  } else {
    if (user.result) {
      return jwt.sign(
        {
          email: user.result.email,
          admin: user.role === 'admin' ? true: false,
        },
        APPCONS.REFRESH_TOKEN_SECRET
      );
    } else {
      return jwt.sign(
        {
          email: user.email,
          admin: user.role === 'admin' ? true: false,
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
    console.log('Access token is:', token)

    jwt.verify(token, APPCONS.ACCESS_TOKEN_SECRET, async (err, user) => {
      console.log('user is:', user)
      if (!token) {
        return res.status(401).json(APPCONS.ACCESSTOKENREQUIRED);
      }
      if (err) {
        return res.status(401).json({ error: "Invalid access token" });
      } else {
        if (!user.admin) {
          //check whether this token is valid or not means does any user logs in from other device or browser
          const tokenExists = await utils.findOne({
            model: tokensModel,
            excludes: ["createdAt", "updatedAt"],
            fetchRowCond: { email: user.email, token: token, invalidated: "0" },
          });
          console.log('hey user:', user)
          if (!tokenExists.resultSet) {
            return res
              .status(401)
              .json({ error: "Another user logged in from other session" });
          }
        }
      }
      next();
    });

  };
};

module.exports = {
  jwtAuthenticate,
  jwtAuthorise,
};
