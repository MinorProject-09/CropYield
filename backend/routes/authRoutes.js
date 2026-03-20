const express = require("express");
const router = express.Router();

const passport = require("passport");

const authController = require("../controllers/authController");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.get(
"/google",
passport.authenticate("google", {
scope: ["profile", "email"]
})
);

router.get(
"/google/callback",
passport.authenticate("google", {
failureRedirect: "/login"
}),
authController.oauthSuccess
);

router.get(
"/github",
passport.authenticate("github", {
scope: ["user:email"]
})
);

router.get(
"/github/callback",
passport.authenticate("github", {
failureRedirect: "/login"
}),
authController.oauthSuccess
);

module.exports = router;