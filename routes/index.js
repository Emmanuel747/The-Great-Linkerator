const apiRouter = require("express").Router();

const {
  createLink,
  getAllTags,
  getAllLinks,
  getLinksByTagName,
  updateLink,
} = require("../db");

// LINK routes
apiRouter.get("/links", async (req, res, next) => {
  try {
    const theLinks = await getAllLinks();

    res.send({ links: theLinks });
  } catch (error) {
    next(error);
  }
});

// TAG routes
apiRouter.get("/tags", async (req, res, next) => {
  try {
    const theTags = await getAllTags();

    res.send({ tags: theTags });
  } catch (error) {
    next(error);
  }
});

apiRouter.get("/tags/:tagName/links", async (req, res, next) => {
  const { tagName } = req.params;
  try {
    const links = await getLinksByTagName(tagName);

    res.send({ links });
  } catch (error) {
    next(error);
  }
});

apiRouter.post("/links", async (req, res, next) => {
  const { name, link, createDate, comment, tags = "" } = req.body;
  const tagArr = tags.trim().split(/\s+/);
  const linkData = {};

  if (tagArr.length) {
    linkData.tags = tagArr;
  }

  try {
    linkData.name = name;
    linkData.link = link;
    linkData.createDate = createDate;
    linkData.comment = comment;
    if (!name) {
      res.send(next(console.error({ message: "Must include name" })));
    }
    if (!link) {
      res.send(next(console.error({ message: "Must include link" })));
    }
    if (!comment) {
      res.send(next(console.error({ message: "Must include comment" })));
    }

    const newLink = await createLink(linkData);

    res.send({
      message: "Link successfully created!",
      newLink,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

apiRouter.patch("/links/:id", async (req, res, next) => {
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

apiRouter.get("/", (req, res, next) => {
  res.send({
    message: "API is under construction!",
  });
});

apiRouter.use((error, req, res, next) => {
  res.send(error);
});

module.exports = apiRouter;