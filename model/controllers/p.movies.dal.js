const dal = require("../../config/postgres.db.config");

// Async function displays a sample of movies from PostgresSQL database.
const displayAllPostgresMovies = async () => {
  let response;
  try {
    response = await dal.query(
      "SELECT fid, title, release_year FROM film_list ORDER BY random() LIMIT 53;"
    );
    return response.rows;
  } catch (error) {
    console.error(error);
  }
};

// Async function obtains movie details from PostgresSQL database.
const getPostgresMovieDetails = async (id) => {
  let response;
  try {
    response = await dal.query("SELECT * FROM film_list WHERE fid = $1;", [id]);
    return response.rows;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  displayAllPostgresMovies,
  getPostgresMovieDetails,
};
