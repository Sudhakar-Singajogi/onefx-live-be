const Sequelize = require('sequelize');
const op = Sequelize.Op;

module.exports = {
    ACCESS_TOKEN_SECRET: "ec2999e89a001285c5e80371359b62d9aa69380d20f5ae8029c4d5dcd755ca8ed83ce90cc6065e79afdde7864d80d38eec33a3ff7544cd10cbf4190f2b15d4d",
    REFRESH_TOKEN_SECRET: "b01481534095216f83066af397f68e7224327b682954284a47ad6be5a36334148b16a5c645ce87fd833ac6b4d5dadc4a8ae4793e14c689da27edec2cfaf5b762",
    SENDGRIDKEY: "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",
    SENDGRIDTO: "sonetinfolabs@gmail.com",
    SENDGRIDCONTACTUSTEMPLATE: "d-49416da61abc46aa9eb5c6cbdb408344",
    SENDGRIDVENDORTEMPLATE: "d-6bbd16931a3c4ac49dd13db8638d5179",
    MSGRAPHSCOPE: "https://graph.microsoft.com/.default",
    MSGRAPHMESSAGEURL: "https://graph.microsoft.com/v1.0/me/messages",
    MSGRAPHMSGURL: "https://graph.microsoft.com/v1.0/me/mailFolders",
    MSGGRAPHBASEURL: "https://graph.microsoft.com/v1.0/me/",
    ERRORLEVELS: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6
    },
    DBUSER: "root",
    DBPASSWORD: "",
    DBHOST: "localhost",
    DATABASE: "express-bootstrap",

    // DBUSER: "pranay",
    // DATABASE: "sonet_school",
    // DBHOST: "148.66.136.3",
    // DBPASSWORD: "#lu4BkmNh3Zo",
    
    DIALECT: "mysql",
    DBPORT: "3306",
    GT: op.gt,
    NOTALLOWEDUPDATE: {
        "result": "OK",
        "resultCode": "401",
        "message": "You are not allowed to update"
    },
    NOTALLOWEDSTATUSUPDATE: {
        "result": "OK",
        "resultCode": "401",
        "message": "You are not allowed to change the status"
    },
    ACCESSDENIED: {
        "result": "OK",
        "resultCode": "403",
        "message": "Access Denied!"
    },
    INVALIDACCESSTOKEN: {
        "result": "OK",
        "resultCode": "403",
        "message": "Invalid Access Token"
    },
    INVALIDUSERCREDENTIALS: {
        "result": "OK",
        "resultCode": "422",
        "message": "Invalid User Credentials"
    },
    ACCESSTOKENREQUIRED: {
        "result": "OK",
        "resultCode": "401",
        "message": "Access Token is required"
    },
    OK: "OK",
    MAILSENT: "mail sent",
    ERRMSG: "error message",
    GRANTTYPE: "password",
    INVALIDTOKEN: "Invalid Token",
    UPLOADPATH:__dirname + "/uploads/"
}