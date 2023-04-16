const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://Darla:wire7654@clustersprint.vnldv50.mongodb.net/?retryWrites=true&w=majority";
const pool = new MongoClient(uri);

module.exports = pool;
