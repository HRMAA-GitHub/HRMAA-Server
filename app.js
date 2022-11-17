const express = require("express")
const mongoose = require("mongoose")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const findOrCreate = require("mongoose-findorcreate")
require("dotenv").config()

// Google OAuth 2.0
const GoogleStrategy = require("passport-google-oauth20").Strategy

const app = express()
app.use(express.static("public"))

// Mongoose
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true })

// Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
})

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

// new User Model
const User = new mongoose.model("User", userSchema)

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            // have to create .env file for CLIENT_ID and CLIENT_SECRET

            callbackURL: "http://localhost:3000/auth/google/HRMAA", // will be changes
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo", // will be changed
        },
        function (accessToken, refreshToken, profile, cb) {
            console.log(profile)

            if (profile._json.email.includes("goa.bits-pilani.ac.in")) {
                // will check if bits id
                User.findOrCreate(
                    { googleId: profile.id },
                    function (err, user) {
                        return cb(err, user)
                    }
                )
            } else {
                cb(new Error("Wrong domain!"))
            }
        }
    )
)

// google after authenticating redirects to this
app.get(
    "/auth/google/HRMAA", // temp
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        // Successful authentication, redirect secrets.
        res.redirect("/HRMAA") // temp
    }
)

// register
app.post("/register", (req, res) => {
    User.register(
        { username: req.body.username },
        req.body.password,
        (err, user) => {
            if (err) {
                console.log(err)
                res.redirect("/register")
            } else {
                passport.authenticate("local")(req, res, () => {
                    // authenticate locally - if user already register in our database
                    res.redirect("/HRMAA") // temp
                })
            }
        }
    )
})

// login
app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    })

    req.login(user, (err) => {
        if (err) {
            console.log(err)
        } else {
            passport.authenticate("local")(req, res, () => {
                // authenticate locally - if user registered in our databse
                res.redirect("/HRMAA") // temp
            })
        }
    })
})

// Listen
app.listen(3000, () => {
    console.log("Server started on Port: 3000")
})
