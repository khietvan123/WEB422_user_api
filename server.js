/********************************************************************************
* WEB422 – Assignment 6
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Khiet Van Phan   Student ID: 147072235   Date: August 13 2025
*
* Published URL: 
*
********************************************************************************/

const express = require('express');
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const passport = require("passport");
const passportJWT = require("passport-jwt");
const jwt = require("jsonwebtoken");

const userService = require("./user-service.js");

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.use(passport.initialize());

const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;

passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        },
        (jwt_payload, done) => {
            return done(null, jwt_payload);
        }
    )
);

app.get('/', (req, res) => {
    res.send('Assignment 6 User API running');
  });
  

app.post("/api/user/register", (req, res) => {
    userService.registerUser(req.body)
        .then((msg) => res.json({ "message": msg }))
        .catch((msg) => res.status(422).json({ "message": msg }));
});

app.post("/api/user/login", (req, res) => {
    userService.checkUser(req.body)
        .then((user) => {
            const payload = { _id: user._id, userName: user.userName };
            const token = jwt.sign(payload, process.env.JWT_SECRET);
            res.json({ "message": "login successful", "token": token });
        })
        .catch((msg) => res.status(422).json({ "message": msg }));
});

app.get("/api/user/favourites", passport.authenticate('jwt', { session: false }), (req, res) => {
    userService.getFavourites(req.user._id)
        .then(data => res.json(data))
        .catch(msg => res.status(422).json({ error: msg }));
});

app.put("/api/user/favourites/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    userService.addFavourite(req.user._id, req.params.id)
        .then(data => res.json(data))
        .catch(msg => res.status(422).json({ error: msg }));
});

app.delete("/api/user/favourites/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    userService.removeFavourite(req.user._id, req.params.id)
        .then(data => res.json(data))
        .catch(msg => res.status(422).json({ error: msg }));
});

app.get("/api/user/history", passport.authenticate('jwt', { session: false }), (req, res) => {
    userService.getHistory(req.user._id)
        .then(data => res.json(data))
        .catch(msg => res.status(422).json({ error: msg }));
});

app.put("/api/user/history/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    userService.addHistory(req.user._id, req.params.id)
        .then(data => res.json(data))
        .catch(msg => res.status(422).json({ error: msg }));
});

app.delete("/api/user/history/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    userService.removeHistory(req.user._id, req.params.id)
        .then(data => res.json(data))
        .catch(msg => res.status(422).json({ error: msg }));
});

userService.connect()
    .then(() => {
        console.log("MongoDB connected successfully.");

        
        if (!process.env.VERCEL) {
            app.listen(HTTP_PORT, () => {
                console.log(`Server listening on port ${HTTP_PORT}`);
            });
        }
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
        process.exit();
    });

module.exports = app;