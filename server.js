// Server

const express = require("express");
const app = express();

const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const morgan = require("morgan");
const moment = require("moment");
const { ObjectId } = require("mongodb");
require("dotenv").config();

const initializePassport = require("./config/passport");
initializePassport(passport);

const { checkAuthenticated } = require("./model/controllers/m.auth.dal");

global.DEBUG = false;

// PORT sets the server's port number to the value of the PORT environment variable.
const PORT = 3000;

// Setting up an Express.js web server.
app.set("view engine", "ejs");

// Setting up Morgan HTTP for debugging and monitoring the server.
if (DEBUG) app.use(morgan("dev"));

// Setting up the Express.js static middleware.
app.use(express.static("public"));

// Setting up Express.js urlencoded middleware used to parse URL-encoded request bodies.
app.use(express.urlencoded({ extended: true }));

// Setting up the Express.js json middleware to parse JSON-encoded request bodies.
app.use(express.json());

// Setting up the flash middleware used to display success or error messages.
app.use(flash());

// Setting up the session middleware for the Express.js app allowing the server to store data and process additional requests.
app.use(
  session({
    secret: "Keyin",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 900000 },
  })
);
// Setting up Passport.js authentication middleware for Express.js app.
app.use(passport.initialize());
// Method used to initialize passport and restore authenication.
app.use(passport.session());
// Method used to establish login sessions.
app.use(methodOverride("_method"));
// Method used to allow users to use HTTP methods other than GET and POST.
DEBUG &&
  app.use((req, res, next) => {
    console.log(req.session);
    next();
  });

// Defines routes for an Express.js web server.
const pgData = require("./model/controllers/p.movies.dal");
const monData = require("./model/controllers/m.movies.dal");
const searchRouter = require("./authRoutes/search");
const authRouter = require("./authRoutes/auth");

// Sets up two routes that use imported routers to handle requests via /search and /auth paths.
app.use("/search", searchRouter);

app.use("/auth", authRouter);

// Code will start server and listen for incoming requests on the sepcified port.
app.listen(PORT, "localhost", async () => {
  const dal = require("./config/mongo.db.config");
  try {
    await dal.connect();
    global.movies = dal.db("sample_mflix").collection("movies");
    global.usersData = dal.db("sample_mflix").collection("users");

    console.log(
      `Server is running on http://localhost:${PORT}; Ctrl-C to terminate...`
    );
  } catch (error) {
    console.error(error);
  }
});

// Defines a route that will match requests to the root path "/".
app.get("/", checkAuthenticated, async (req, res) => {
  try {
    const mongoMovies = await monData.displayAllMongoMovies();

    const postMovies = await pgData.displayAllPostgresMovies();
    if (DEBUG) console.log(postMovies);

    if (mongoMovies.length === 0 || postMovies.length === 0) {
      res.status(502).render("502");
    } else {
      res.render("home", {
        mongoMovies,
        postMovies,
        title: "Home",
      });
    }
    // If data retrieval methods fail, the route will render an error.
  } catch (error) {
    console.error(error);

    res.status(503).render("503");
  }
});

// Defines a route that will send requests to the /allMongoMovies path.
app.get("/allMongoMovies", async (req, res) => {
  const movie_data = await monData.displayAllMongoMovies();
  res.json(movie_data);
});

// Defines a route that will match requests to the /allPostgressMovies path.
app.get("/allPostgresMovies", async (req, res) => {
  const movie_data = await pgData.displayAllPostgresMovies();
  res.json(movie_data);
});

// Defines a route that will match requests to paths with a dynamic parameter called id.
app.get("/:id", checkAuthenticated, async (req, res) => {
  try {
    if (DEBUG) console.log(req.params);

    if (req.url.includes("a")) {
      const mongoMovies = await monData.getMongoMovieDetails(req.params.id);
      if (DEBUG) console.log(mongoMovies);

      if (mongoMovies.length === 0) {
        res.status(502).render("502");
      } else {
        res.render("mongo_movies", { mongoMovies, title: "Home" });
      }
    } else {
      const postMovies = await pgData.getPostgresMovieDetails(req.params.id);
      if (DEBUG) console.log(postMovies);

      if (postMovies.length === 0) {
        res.status(502).render("502");
      } else {
        res.render("posgres_movies", { postMovies, title: "Home" });
      }
    }
    // If data cannot be retrieved, the route will return an error.
  } catch (error) {
    console.error(error);
    res.status(503).render("503");
  }
});
