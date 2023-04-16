
const { MongoClient } = require("mongodb");
const uri = process.env.MONGO_URI;
const pool = new MongoClient(uri);

module.exports = pool;
