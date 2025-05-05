import express from "express";
const router = express.Router();
import fetchUser from "../middleware/fetchUser.js";
import Note from "../models/Note.js";
import { body, validationResult } from "express-validator";

//ROUTE:1:Get all the notes using: GET "api/notes/fetchallnotes" login required

router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});
//ROUTE:2:Add a new note using POST "api/notes/addnote" login required

router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be minimum 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      //If there are errors,return Bad Request and the errors
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(note);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);
//ROUTE:3:Updating an existing note using PUT "api/auth/updatenote" login required

router.put("/updatenote/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;
  //Create a newNote object
  const newNote = {};
  if (title) {
    newNote.title = title;
  }
  if (description) {
    newNote.description = description;
  }
  if (tag) {
    newNote.tag = tag;
  }
  //Find the note to be updated and update it
  let note = await Note.findById(req.params.id);
  if (!note) {
    res.status(404).send("Not Found");
  }
  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("Not Allowed");
  }
  note = await Note.findByIdAndUpdate(
    req.params.id,
    { $set: newNote },
    { new: true }
  );
  res.json({ note });
});
//ROUTE:4:Deleting an existing note using DELETE "api/auth/deletenote" login required

router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;
  //Find the note to be deleted and delete it
  let note = await Note.findById(req.params.id);
  if (!note) {
    res.status(404).send("Not Found");
  }
  //Allow Deletion only if te user owns this note
  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("Not Allowed");
  }
  note = await Note.findByIdAndDelete(req.params.id);
  res.json({ Success: "Note has been deleted", note: note });
});
export default router;
