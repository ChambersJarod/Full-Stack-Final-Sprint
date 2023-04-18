const dal = require("../../config/postgres.db.config");

// Async function that searches for movies by their title in PostgresSQL database.
const titleSearch = async (title) => {
  let response;
  try {
    response = await dal.query(
      // https://mode.com/sql-tutorial/sql-like/
      `SELECT * FROM film_list WHERE title ILIKE $1 LIMIT 38;`,
      [`%${title}%`]
    );
    return response.rows;
  } catch (error) {
    console.error(error);
  }
};

module.exports = { titleSearch };
// Exports the titleSearch to be used in other modules.
