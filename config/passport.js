const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

// getUserByEmail function searches for a user by email in a database. Function returns the user if found.
// getUserById function searches by id. Functions returns the user if found.
const {
  getUserByEmail,
  getUserById,
} = require("../model/controllers/m.auth.dal");

// This function commences authentication in a web application by using Passport.js.
function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    DEBUG && console.log("Authenticating..." + email);
    const user = await getUserByEmail(email);
    DEBUG && console.log("Authenticated User: " + user);
    // If no user is found, error message displays.
    if (user == null) {
      return done(null, false, {
        message: `There is no user with email ${email}`,
      });
    }
    try {
      // If user is found, bycrypt is used to compared the user provided password with the hased password recorded in the database.
      // If passwords match, function will call done().
      // If passwords do not match, error message will display.
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Password Incorrect" });
      }
    } catch (err) {
      return done(err);
    }
  };

  passport.use(new localStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id));
  });
}

module.exports = initialize;
