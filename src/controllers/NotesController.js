const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class NotesController {
  async create(request, response) {
    let ratingIsvalid;
    const { title, description, rating, tags } = request.body;
    const user_id = request.user.id;

    const rating_number = Number(rating);

    const checkIfRatingIsValid = () => {
      const ratings = [1, 2, 3, 4, 5];
      if (ratings.includes(rating_number)) {
        ratingIsvalid = true;
        return true;
      }

      return false;
    };
    if (!checkIfRatingIsValid()) {
      throw new AppError("The rating has to be a integer between 1 and 5");
    }

    const note_id = await knex("notes").insert({
      title,
      description,
      rating,
      user_id,
    });

    const tagsInsert = tags.map((name) => {
      return {
        note_id,
        name,
        user_id,
      };
    });

    await knex("tags").insert(tagsInsert);

    response.json();
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("notes").where({ id }).delete();

    return response.json();
  }
  async show(request, response) {
    const { id } = request.params;

    const note = await knex("notes").where({ id }).first();
    const tags = await knex("tags").where({ note_id: id }).orderBy("name");

    return response.json({ ...note, tags });
  }
  async index(request, response) {
    const { title, tags } = request.query;
    const user_id = request.user.id;
    let notes;

    if (tags) {
      const filterTags = tags.split(",").map((tag) => tag.trim());
      console.log(filterTags);
      notes = await knex("tags")
        .select(["notes.id", "notes.title", "notes.user_id"])
        .where("notes.user_id", user_id)
        .whereLike("notes.title", `%${title}%`)
        .whereIn("name", filterTags)
        .innerJoin("notes", "notes.id", "tags.note_id")
        .groupBy("notes.id")
        .orderBy("notes.title");
    } else {
      notes = await knex("notes")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title");
    }

    const userTags = await knex("tags").where({ user_id });
    const notesWithTags = notes.map((note) => {
      const noteTags = userTags.filter((tag) => tag.note_id === note.id);

      return {
        ...note,
        tags: noteTags,
      };
    });

    return response.json(notesWithTags);
  }
}

module.exports = NotesController;
