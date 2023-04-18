const express = require("express");
const router = express.Router();

// ".use" is used to serve static files from the public directory.
router.use(express.static("public"));

// EventEmitter allows the application to define custom events and attach event listeners.
const EventEmitter = require("events");
class MyEmitter extends EventEmitter {}
// MyEmitter defines a log event which is emitted whenever a log message is generated.
const myEmitter = new MyEmitter();

const logEvent = require("../event_emitters/logEvents");

myEmitter.addListener("log", (msg, level, logName) =>
  logEvent(msg, level, logName)
);

const gresSearchData = require("../model/controllers/p.search.dal");
const pgData = require("../model/controllers/p.movies.dal");

const monData = require("../model/controllers/m.movies.dal");

// Fuzzy Search Query
// Defines a route that processes a search query when a GET request is sent to the /mongo path.

router.get("/mongo", async (req, res) => {
  try {
    if (DEBUG) console.log(req.query);

    if (!req.query.search) {
      res.redirect("/");
      return;
    }

    let searchResults = movies
      .aggregate([
        {
          $search: {
            autocomplete: {
              query: `${req.query.search}`,
              path: "title",
              fuzzy: {
                maxEdits: 2,
              },
            },
          },
        },
      ])
      .limit(54);
    const mSearch = await searchResults.toArray();

    res.render("searchResults/m_search", { mSearch, title: "Mongo Search" });

    // Allows the application to keep a record of all search queries made by users.
    myEmitter.emit(
      "log",
      `UserID: ${user._id}\tUser: ${user.name}\tEmail: ${user.email}\tSearched: ${req.query.search}\tSTATUS: ${res.statusCode}`,
      "INFO",
      "searchLog.log"
    );
  } catch (error) {}
});

// Defines a route that exercises a search query when a GET request is sent to the /postgres path.

router.get("/postgres", async (req, res) => {
  try {
    if (DEBUG) console.log(req.query);
    if (!req.query.search) {
      res.redirect("/");
    }
    let pSearch = await gresSearchData.titleSearch(req.query.search);

    res.render("searchResults/p_search", { pSearch, title: "Postgres Search" });

    myEmitter.emit(
      "log",
      `UserID: ${user._id} User: ${user.name}Email: ${user.email}\tSearched: ${req.query.search}\tSTATUS: ${res.statusCode}`,
      "INFO",
      "searchLog.log"
    );
  } catch (error) {
    console.error(error);
  }
});

// Defines a route that exercises a request for detailed info about a specific movie when a GET request is sent to the /mongo/:_id path.

router.get("/mongo/:_id", async (req, res) => {
  try {
    if (DEBUG) console.log(req.params);
    const mongoMovies = await monData.getMongoMovieDetails(req.params._id);
    if (DEBUG) console.log(mongoMovies);

    if (mongoMovies.length === 0) {
      res.status(502).render("502");
    } else {
      res.render("mongo_movies", { mongoMovies, title: "Movie Details" });
    }
    // If the array is returned empty, the code will send an error response to user.
  } catch (error) {
    console.error(error);
    res.status(503).render("503");
  }
});

// Defines a route that processes a request for detailed info about a specific movie when a GET request is sent to the /postgres/:id path.

router.get("/postgres/:id", async (req, res) => {
  try {
    if (DEBUG) console.log(req.params);
    const postMovies = await pgData.getPostgresMovieDetails(req.params.id);
    if (DEBUG) console.log(postMovies);

    if (postMovies.length === 0) {
      res.status(502).render("502");
    } else {
      res.render("postgres_movies", { postMovies, title: "Movie Details" });
    }
    // If the array returned is empty, the code will send an error message to the user.
  } catch (error) {
    console.error(error);
    res.status(503).render("503");
  }
});

module.exports = router;
