const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const router = express.Router();
const MongoClient = require("mongodb").MongoClient;
const {
  checkAuthenticated,
  checkNotAuthenticated,
  getUserByEmail,
  addUser,
  deleteUser,
} = require("../model/controllers/m.auth.dal");

router.use(express.static("public"));

// Login Route
// A route is defined that handles a GET request to the "/login" path.
// If the user making the request is authenticated, the callback function redirects the user to the homepage. If the user is not authenticated, the callback function renders the "auth/login" view and passes in a title variable set to "Login".

router.get("/login", checkNotAuthenticated, async (req, res) => {
  res.render("auth/login", { title: "Login" });
});

// Authentication Strategy
// Defines a route that handles a POST request to the "/login" path.
// If the user is authenticated, the callback function redirects user to the homepage. If the user is not authenticated, the callback function uses the passport.authenticate() method to authenticate the user.

router.get("/login", checkNotAuthenticated, async (req, res) => {
  res.render("auth/login", { title: "Login" });
});
router.post(
  "/login",
  checkNotAuthenticated,
  // successRedirect will redirect user to the homepage if authentication is successful.
  // failureRedirect will redirect user to the login page if authentication fails.
  // failureFlash property is set to true to enable flash messages, allowing the application to display error messages to the user.
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
);

// Logout Route Handler
// The code defines a route that listens for HTTP GET requests at the "/logout" path. The checkAuthenticated middleware is executed to check if the user is authenticated before continuing.

router.get("/logout", checkAuthenticated, async (req, res) => {
  // If the user is authenticated, the req.logout() method is called.
  // If error, the next(error) method is called to handle any errors occuring during the logout process.
  req.logout(function (error) {
    if (error) {
      return next(error);
    }

    // User is redirected to login page if logout is successful.
    res.redirect("/auth/login");
  });
});

// Sign Up Route
// Registration page is rendered when a GET request is sent to the /register path.
// checkNotAuthenicated checks if the user is authenticated. If authenticated, user is redirected to the homepage. If not authenticated, user is redirected to Sign Up page.
router.get("/register", checkNotAuthenticated, async (req, res) => {
  res.render("auth/register", { title: "Sign Up" });
});

router.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    // Method returns a hashed version of password.
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    };

    // Method checks if a user with the same email address already exists in the database.
    // If user exists, error message will display to user and user is redirected to the registration page.
    // If user does not exist, user will be added to database. Success message will display to user.
    const userCheck = await getUserByEmail(user.email);
    if (userCheck != null) {
      console.log("User already exists");
      req.flash("error", "User with this email already exists");
      res.redirect("/auth/register");
    } else {
      DEBUG && console.log("Registering User: " + user.name);
      addUser(user);
      DEBUG && console.log("Registered User: " + user.name);
      req.flash("success", "User succesfully created");
      res.redirect("/auth/login");
    }
    // If errors occur, an error message will display to user and user will be redirected to registration page.
  } catch (error) {
    console.error(error);
    req.flash("error", "Oops, Something went wrong");
    res.redirect("/auth/register");
  }
});

// User Profile Page: defines two routes for a user profile page.
// GET/profile: renders the profile page when a GET request is sent to the /profile path. If user is authenticated, method renders profile page.
// POST/profile: proccesses a form submission to delete user from the database when a POST request is sent to the /profile path.
router.get("/account", checkAuthenticated, async (req, res) => {
  res.render("auth/account", { title: "My Account" });
});
// Requests for user to be deleted from database.
router.post("/account", checkAuthenticated, async (req, res) => {
  console.log("Unsubscribing..." + user.name);
  try {
    await deleteUser(user.email);
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      req.flash("success", "Successfully Unsubscribed");

      user = null;
      res.redirect("/auth/login");
    });
  } catch (error) {
    req.flash("error2", "Oops, Something went wrong");
    console.error(error);
    res.redirect("/auth/profile");
  }
});

// Route to Log Out User
// The DELETE method will delete the user's session from the server.
router.delete("/logout", (req, res, next) => {
  DEBUG && console.log("logout initialized");

  req.logout(function (error) {
    if (error) {
      return next(error);
    }
    user = null;
    res.redirect("/auth/login");
  });
});

module.exports = router;
