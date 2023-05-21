const express = require("express");
const cors = require("cors");
const path = require('path');
const app = express();
const { connectRouters } = require(path.resolve("src/initializer/framework"));
const sequelize = require(path.resolve("src/dbconn/connection"));
const APPCONSTANTS =  require(path.resolve("appconstants"));
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");


var dbConnectionMessage = "";
sequelize
  .authenticate()
  .then(async () => {
    dbConnectionMessage = "DB Connection has been established successfully.";
  })
  .catch((err) => {
    dbConnectionMessage =
      "DBParams:" +
      APPCONSTANTS.DBHOST +
      ":" +
      APPCONSTANTS.DATABASE +
      ":" +
      APPCONSTANTS.DBUSER +
      ":" +
      APPCONSTANTS.DBPASSWORD +
      "DBConnect error:" +
      err;
  });



class App {
    constructor() {
        console.log('loaded constr')
        this.appUse();
        this.routerConnection();
        this.appSecurity();
        // this.swaggerSetup();
        this.connectServer();
    }

    appUse() {
      //  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        
        app.use(express.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(
            cors({
                credentials: true
            })
        );
    }

    routerConnection() {
        connectRouters(app);
        
        app.get("/api", (req, res) => {
          return res.status(200).json({
            result: "OK",
            resultCode: 200,
            message: "Hey am express Modular coming from heroku & " + dbConnectionMessage,
            ValidationErrors: "",
            data: [],
            totalRows: 0,
          });
        }); 
        
      }

    appSecurity() {
        app.use(helmet());
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        });
        //  apply to all requests
        app.use(limiter);
    }

 /*   swaggerSetup() {
        const swagger = require("swagger-generator-express");
        const options = {
            title: "swagger-generator-express",
            version: "1.0.0",
            host: "localhost:3000",
            basePath: "/",
            schemes: ["http", "https"],
            securityDefinitions: {
                Bearer: {
                    description: "Example value:- Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5MmQwMGJhNTJjYjJjM",
                    type: "apiKey",
                    name: "Authorization",
                    in: "header"
                }
            },
            security: [{ Bearer: [] }],
            defaultSecurity: "Bearer"
        };
        swagger.serveSwagger(app, "/swagger", options, {
            routePath: "./src/swagger/route.js",
            requestModelPath: "./src/swagger/routeModal.js",
            responseModelPath: "./src/swagger/routerResponse.js"
        });
    }
    */

    connectServer() {
        app.listen(process.env.PORT || 8080, () => {
            console.log("Hey am running on port 8080");
        });
    }
}

const mainApp = new App();
  