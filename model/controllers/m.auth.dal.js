const { ObjectId } = require("mongodb");

// addUser is an async function that inserts a new user document into a collection called usersData.

async function addUser(user) {
  try {
    await usersData.insertOne(user);
  } catch (error) {
    // If an error occurs, it will be caught by the try-catch block and logged to the console using console.error().
    console.error(error);
  }
}

// Deletes a user from usersData collection.
// When DEBUG is set to true, the function will first log a message to the console before trying to delete the user.
async function deleteUser(email) {
  try {
    DEBUG && console.log("Deleting..." + email);
    await usersData.deleteOne({ email: `${email}` });
  } catch (error) {
    console.error(error);
  }
}

// getUserByEmail searches for a user by email in the usersData collection.
async function getUserByEmail(email) {
  DEBUG && console.log("getUserByEmail() searching: " + email);
  try {
    const user = await usersData.findOne({ email: email });
    global.user = user;
    if (user === null) {
      console.log("getUserByEmail() FAILED: Could not get User");
    } else {
      DEBUG && console.log("getUserByEmail() SUCCESS: User Found");
      return user;
    }
  } catch (error) {
    console.error(error);
  }
}

// getUserById searches for a user by id in the usersData collection.
async function getUserById(id) {
  DEBUG && console.log("getUserById() searching: " + id);

  // Defines an object parameter par.

  const par = ObjectId(`${id}`);

  try {
    const user = await usersData.findOne({ _id: par });
    DEBUG && console.log(user);

    if (user === null) {
      console.log("getUserById() FAILED: Could not get User");
    } else {
      DEBUG && console.log("getUserById() SUCCESS: User Found");
      return user;
    }
  } catch (error) {
    console.error(error);
  }
}

// Checks the authentication status of the user.

// If the user is authenticated, user is redirected to the login page.
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/login");
}

// If user is not authenticated, they will be redirected to the homepage.
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

module.exports = {
  getUserByEmail,
  getUserById,
  addUser,
  deleteUser,
  checkAuthenticated,
  checkNotAuthenticated,
};
