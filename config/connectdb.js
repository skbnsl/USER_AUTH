const mongoose = require("mongoose");

// connected to the db
mongoose.connect(
  "mongodb+srv://bansalsagar13:Y1qNCd0CBDGwNKPp@cluster0.83ijkin.mongodb.net/?retryWrites=true&w=majority"
);

// acquired connection to db
const connectdb = mongoose.connection;

//error
connectdb.on(
  "error",
  console.error.bind(console, "Error connecting to MongoDB")
);

//up and running then print the message
connectdb.once("open", function () {
  console.log("Connected to Database :: MongoDB");
});

module.exports = connectdb;
