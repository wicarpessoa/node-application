const { Router } = require("express");

const usersRouter = require("./users.router");
const notesRouter = require("./notes.router");

const routes = Router();

routes.use("/users", usersRouter);
routes.use("/notes", notesRouter);

module.exports = routes;
