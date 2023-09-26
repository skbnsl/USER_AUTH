const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const port = process.env.PORT;
const app = express();
const cors = require("cors");
const connectdb = require("./config/connectdb");
const userRouted = require("./routes/userRoute");

//const DATABASE_URL = process.env.DATABASE_URL;
app.use(cors());

app.use(express.json());

//database
//connectdb(DATABASE_URL);

//JSON
// app.use(express.json());

app.use("/api/user", userRouted);

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
