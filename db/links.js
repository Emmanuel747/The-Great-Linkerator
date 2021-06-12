const apiRouter = require("express").Router();
const client = require("./client");

const {
  createTags,
  addTagsToLink,
} = require("./tags");

async function createLink({ name, link, count, comment, tags = [] }) {
   try {
     const {
       rows: [links],
     } = await client.query(
       `
               INSERT INTO link(name, link, count, comment)
               VALUES($1, $2, $3, $4)
               ON CONFLICT (name) DO NOTHING
               RETURNING *;
            `,
       [name, link, count, comment]
     );
 
     const tagList = await createTags(tags);
     return await addTagsToLink(links.id, tagList);
   } catch (err) {
     console.error("Could not create any links");
     throw err;
   }
}

async function getAllLinks() {
   try {
      const { rows: idList } = await client.query(`
            SELECT id 
            FROM link;
   `);
      const links = await Promise.all(idList.map((link) => getLinkById(link.id)));
      return links;
   } catch (error) {
      throw error;
   }
}

async function getLinkById(id) {
   try {
     const {
       rows: [link],
     } = await client.query(
       `
         SELECT *
         FROM link
         WHERE id=$1;
   `,
       [id]
     );
     if (!link) {
       throw {
         name: "not found",
         message: "count not find link with id",
       };
     }
     const { rows: tags } = await client.query(
       `SELECT tags.*
       FROM tags
       JOIN link_tags ON tags.id=link_tags."tagId"
       WHERE link_tags."linkId"=$1;
       `,
       [id]
     );
     link.tags = tags;
     return link;
   } catch (error) {
     throw error;
   }
}

// LINK and TAG database methods
async function getLinksByTagName(tagName) {
   try {
     const { rows: tagIds } = await client.query(
       `
       SELECT link.id
       FROM link
       JOIN link_tags ON link.id=link_tags."linkId"
       JOIN tags ON tags.id=link_tags."tagId"
       WHERE tags.name=$1;
     `,
       [tagName]
     );
 
     return await Promise.all(tagIds.map((link) => getLinkById(link.id)));
   } catch (err) {
     console.error();
     throw err;
   }
}

async function updateLink(linkId, fields = {}) {
   // read off the tags & remove that field
   const { tags } = fields; // might be undefined
   delete fields.tags;
   // build the set string
   const setString = Object.keys(fields)
     .map((key, index) => `"${key}"=$${index + 1}`)
     .join(", ");
   try {
     // update any fields that need to be updated
     if (setString.length > 0) {
       await client.query(
         `
         UPDATE link
         SET ${setString}
         WHERE id=${linkId}
         RETURNING *;
       `,
         Object.values(fields)
       );
     }
     // return early if there's no tags to update
     if (tags === undefined) {
       return await getLinkById(linkId);
     }
     // make any new tags that need to be made
     const tagList = await createTags(tags);
     const tagListIdString = tagList.map((tag) => `${tag.id}`).join(", ");
     // delete any link_tags from the database which aren't in that tagList
     await client.query(
       `
       DELETE FROM link_tags
       WHERE "tagId"
       NOT IN (${tagListIdString})
       AND "linkId"=$1;
     `,
       [linkId]
     );
     // and create link_tags as necessary
     await addTagsToLink(linkId, tagList);
     return await getLinkById(linkId);
   } catch (error) {
     throw error;
   }
}

async function createLinkTag(linkId, tagId) {
   try {
     await client.query(
       `
       INSERT INTO link_tags("linkId", "tagId")
       VALUES ($1, $2)
       ON CONFLICT ("linkId", "tagId") DO NOTHING;
     `,
       [linkId, tagId]
     );
   } catch (error) {
     throw error;
   }
 }

module.exports = {
   client,
   createLink,
   getAllLinks,
   getLinkById,
   getLinksByTagName,
   updateLink,
   createLinkTag
}