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
    try{
        let user_data = req.body;
        try {
            await checkIfEmailorUserNameExists(user_data.email, user_data.username);
        } catch(err) {
            res.send(err);
            return;
        }
        await createUser(user_data).catch(error => console.log(error.message));
        res.send("200");
        
    }catch(err) {
        next(err);
    }
});

router.post("/login", async function (req, res, next) {
    try{
        user = await checkUser(req.body.username, req.body.password);
        if (user) {
            req.session.user_id = user.user_id;
            res.status(200).send("login succeeded")
        }
        else
            res.status(401).send("Username or Password are incorrect");
    } catch (err) {
        next(err);
    }
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

checkIfEmailorUserNameExists = async function(email, username) {
    const users = await DButils.execQuery("SELECT * FROM [dbo].[users]")
    if (users.find((x) => x.email == email))
        throw "Email already exists in the system"
    if (users.find((x) => x.username == username))
        throw "Username already exists in the system"
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

    await DButils.execQuery(`INSERT INTO [dbo].[users] VALUES ('${username}','${hash_password}','${email}','${firstname}','${lastname}','${country}', NULL, NULL, NULL)`);
}

module.exports = router;