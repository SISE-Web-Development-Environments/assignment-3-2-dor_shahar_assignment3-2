const DButils = require(".././DButils");
const CryptoJS = require("crypto-js");

var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var app = express()
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.post("/register", async function (req, res) {
    let user_data = req.body;
    if (await checkIfEmailExists(user_data.email))
        res.send("Email already exists. Login or register with a different email.");
    else {
        await createUser(user_data).catch(error => console.log(error.message));
        res.send("200");
    }
});

router.post("/login", async function (req, res, next) {
    user = await checkUser(req.body.username, req.body.password);
    if (user) {
        req.session.user_id = user.user_id;
        res.status(200).send("login succeeded")
    }
    else
        res.status(401).send("Username or Password are incorrect");
});

checkUser = async function(username, password) {
    // Return all user names from db
    const user_names = await DButils.execQuery("SELECT username FROM [dbo].[users]")

    // Find given username
    if (!user_names.find((x) => x.username == username))
        return undefined

    // Restore user credentials from db
    let result = await DButils.execQuery(`SELECT * FROM [dbo].[users] WHERE username = '${username}'`);
    const user = result[0];

    // Checking password
    let hash_password = CryptoJS.SHA3(password).toString(CryptoJS.enc.Base64);
      if (hash_password !== user.password) {
        return undefined
    }

    return user;
}

checkIfEmailExists = async function(email) {
    const emails = await DButils.execQuery("SELECT email FROM [dbo].[users]")
    if (!emails.find((x) => x.email == email))
        return false;
    return true;
}

createUser = async function(user_data) {
    const {
        username,
        firstname,
        lastname,
        country,
        password,
        email
    } = user_data;

    hash_password = CryptoJS.SHA3(password).toString(CryptoJS.enc.Base64);

    await DButils.execQuery(`INSERT INTO [dbo].[users] VALUES ('${username}','${hash_password}','${email}','${firstname}','${lastname}','${country}')`);
}

module.exports = router;