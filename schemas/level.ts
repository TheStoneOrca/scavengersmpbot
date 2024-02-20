import mongoose from "mongoose";

const LevelSchema = new mongoose.Schema({
  userid: String,
  level: Number,
  xp: Number,
});

const LevelModel = mongoose.model("levels", LevelSchema);

export default LevelModel;
