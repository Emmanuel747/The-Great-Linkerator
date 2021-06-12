const express = require("express")
const tagsRouter = express.Router();

const {
  getAllTags,
} = require("../db");

// TAG routes
tagsRouter.get("/", (req, res, next) => {
   res.send({
     message: "API is under construction!",
   });
 });
 
tagsRouter.use((error, req, res, next) => {
   res.send(error);
 });

tagsRouter.get("/tags", async (req, res, next) => {
   try {
     const theTags = await getAllTags();
 
     res.send({ tags: theTags });
   } catch (error) {
     next(error);
   }
});


module.exports = tagsRouter;