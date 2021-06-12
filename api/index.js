require("dotenv").config();

// create an api router
const express = require("express");
const apiRouter = express.Router();
const server = express();

apiRouter.use((error, req, res, next) => {
   res.send(error);
 });

apiRouter.get("/", (req, res, next) => {
   res.send({
     message: "API is under construction!",
   });
});


const linksRouter = require("./links");
const tagsRouter = require("./tags");

// defined routes
apiRouter.use("/links", linksRouter);
apiRouter.use("/tags", tagsRouter);

// export the api router
module.exports = apiRouter;