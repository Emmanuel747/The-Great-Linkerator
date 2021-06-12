// Connect to DB
require('dotenv').config()
const { Client } = require("pg");
const DB_NAME = "localhost:5432/linkerator";
const DB_URL = process.env.DATABASE_URL || `postgres://${DB_NAME}`;
// const client = new Client(DB_URL);

const { FITDEV_DB_PASSWORD, FITDEV_DB_USERNAME } = process.env;

//For Eman
const client = new Client({
   connectionString:
     // `postgres://localhost:5432/fitness-dev`
     // I need the login credentials to access postgres on my
     process.env.DATABASE_URL || `postgres://${FITDEV_DB_USERNAME}:${FITDEV_DB_PASSWORD}@localhost:5432/fitness-dev`,
 });


module.exports = client;