const express = require("express")
const linksRouter = express.Router();

// LINK routes
linksRouter.get("/links", async (req, res, next) => {
   try {
     const theLinks = await getAllLinks();
 
     res.send({ links: theLinks });
   } catch (error) {
     next(error);
   }
});

linksRouter.get("/tags/:tagName/links", async (req, res, next) => {
   const { tagName } = req.params;
   try {
     const links = await getLinksByTagName(tagName);
 
     res.send({ links });
   } catch (error) {
     next(error);
   }
});

linksRouter.patch("/links/:id", async (req, res, next) => {
   const { id } = req.params;
   const { name, link, comment, tags, count } = req.body;
   const updateFields = {};
   if (tags && tags.length > 0) {
     updateFields.tags = tags.trim().split(/\s+/);
   }
   if (name) {
     updateFields.name = name;
   }
   if (link) {
     updateFields.link = link;
   }
   if (comment) {
     updateFields.comment = comment;
   }
   if (count) {
     updateFields.count = count;
   }
   try {
     const updatedLink = await updateLink(id, updateFields);
     res.send(updatedLink);
   } catch (error) {
     next(error);
   }
 });

module.exports = linksRouter;