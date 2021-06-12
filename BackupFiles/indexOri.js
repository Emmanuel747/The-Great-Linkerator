// Connect to DB
const { Client } = require("pg");
const DB_NAME = "localhost:5432/linkerator";
const DB_URL = process.env.DATABASE_URL || `postgres://${DB_NAME}`;
const client = new Client(DB_URL);

// LINK database methods
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

// TAG database methods

async function getAllTags() {
  try {
    const { rows } = await client.query(`SELECT * FROM tags;`);

    return { rows };
  } catch (error) {
    throw error;
  }
}

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

//TODO do we even need?
async function getTagbyId() {
  try {
  } catch (err) {
    console.error();
    throw err;
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

// export
module.exports = {
  client,
  createLink,
  getAllTags,
  getAllLinks,
  getLinkById,
  createTags,
  getTagbyId,
  getLinksByTagName,
  addTagsToLink,
  createLinkTag,
  // db methods
};
