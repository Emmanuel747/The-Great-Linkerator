// code to build and initialize DB goes here
// const {
//   client,
//   createLink,
//   getAllLinks,
//   getLinkById,
//   getAllTags,
//   getLinksByTagName,
//   // other db methods
// } = require("./index");

const { client } = require("./client");
const { getAllTags,  } = require("./tags")
const { createLink, 
        getAllLinks, 
        getLinkById, 
        getLinksByTagName } = require("./links");


async function dropTables() {
  // drop tables in correct order
  try {
    console.log("Dropping All Tables...");
    await client.query(`
    DROP TABLE IF EXISTS link_tags;
    DROP TABLE IF EXISTS tags;
    DROP TABLE IF EXISTS link;
   
    
`);
    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error while dropping tables!");
    throw error;
  }
}

async function createTables() {
  // create all tables, in the correct order
  try {
    console.log("Starting to build tables...");
    await client.query(`
    CREATE TABLE tags(
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );
    CREATE TABLE link(
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      link TEXT NOT NULL,
      count INTEGER,
      comment VARCHAR(255) NOT NULL,
      "dateshared" DATE default CURRENT_DATE
    );
    CREATE TABLE link_tags(
      "linkId" INTEGER REFERENCES link(id),
      "tagId" INTEGER REFERENCES tags(id),
      UNIQUE("linkId", "tagId")
    );
`);
    console.log("Finished constructing tables!");
  } catch (error) {
    console.error("Error constructing tables!");
    throw error;
  }
}

async function createInitialLinks() {
  console.log("Starting to create initial links...");
  try {
    const linksToCreate = [
      {
        name: "Google",
        link: "https://www.google.com",
        count: 22,
        comment: "A search engine.",
        tags: ["cat", "food", "world"],
      },
      {
        name: "Twitter",
        link: "https://www.twitter.com",
        count: 34,
        comment:
          "A microblogging system that allows you to send and receive short posts.",
        tags: ["pepper", "cup", "cat"],
      },
      {
        name: "Youtube",
        link: "Youtube.com",
        count: 13,
        comment: "TV Movies and Streaming.",
        tags: ["saints", "tv", "food"],
      },
    ];
    const links = await Promise.all(linksToCreate.map(createLink));
    console.log("Links:");
    console.log(links);
    console.log("Finished creating links!");
  } catch (err) {
    console.error("Problem creating the links!");
    throw err;
  }
}

async function rebuildDB() {
  try {
    client.connect();
    await dropTables();
    await createTables();
    await createInitialLinks();
  } catch (error) {
    throw error;
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");

    console.log("Calling getAllLinks");
    const links = await getAllLinks();
    console.log("Result:", links);

    console.log("Calling getAllTags");
    const tags = await getAllTags();
    console.log("Result:", tags);

    console.log("Calling getLinkById with 1");
    const linkById = await getLinkById(1);
    console.log("Result:", linkById);

    console.log("Calling getLinksByTagName with #cat");
    const linksWithCat = await getLinksByTagName("cat");
    console.log("Result:", linksWithCat);

    console.log("Finished database tests!");
  } catch (error) {
    console.log("Error during testDB");
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
