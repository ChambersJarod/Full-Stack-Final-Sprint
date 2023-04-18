const { ObjectId } = require("mongodb");

// Async function displays a sample of movies from MongoDB movies collection.
const displayAllMongoMovies = async () => {
  try {
    return await movies.aggregate([{ $sample: { size: 50 } }]).toArray();
  } catch (error) {
    console.error(error);
  }
};

// Async function obtains movie details from movies collection.
const getMongoMovieDetails = async (_id) => {
  try {
    if (ObjectId.isValid(_id)) {
      return await movies.find({ _id: ObjectId(`${_id}`) }).toArray();
    } else {
      throw new Error(`Invalid ObjectId: ${_id}`);
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports = { displayAllMongoMovies, getMongoMovieDetails };
