const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "SprintFinalJS",
  password: "cupcake",
  port: 5432,
});
module.exports = pool;
