const apiRouter = require("express").Router();
const client = require("./client");

const {
  getLinkById,
  createLinkTag,
} = require("./links");

async function createTags(tagList) {
   if (tagList.length === 0) {
     return [];
   }
 
   const insertValues = tagList.map((_, index) => `$${index + 1}`).join("), (");
   const selectValues = tagList.map((_, index) => `$${index + 1}`).join(", ");
 
   try {
     await client.query(
       ` INSERT INTO tags(name)
         VALUES(${insertValues})
         ON CONFLICT (name) DO NOTHING;
     `,
       tagList
     );
 
     const { rows } = await client.query(
       `
     SELECT * FROM tags
     WHERE name
     IN (${selectValues});
     `,
       tagList
     );
     return rows;
   } catch (err) {
     console.error();
     throw err;
   }
}

async function getAllTags() {
   try {
     const { rows } = await client.query(`SELECT * FROM tags;`);
 
     return { rows };
   } catch (error) {
     throw error;
   }
}

async function getTagbyId() {
   try {
   } catch (err) {
     console.error();
     throw err;
   }
 }

 async function addTagsToLink(linkId, tagList) {
   try {
     const createTagPromises = tagList.map((tag) =>
       createLinkTag(linkId, tag.id)
     );
 
     await Promise.all(createTagPromises);
 
     return await getLinkById(linkId);
   } catch (err) {
     console.error();
     throw err;
   }
}

module.exports = {
   client,
   createTags,
   getAllTags,
   getTagbyId,
   addTagsToLink,
}

