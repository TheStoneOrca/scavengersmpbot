import { SlashCommandBuilder } from "discord.js";

const checkLevel = new SlashCommandBuilder()
  .setName("level")
  .setDescription("Check your user level!");

export default checkLevel;
