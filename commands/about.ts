import { SlashCommandBuilder } from "discord.js";

const aboutMessage = new SlashCommandBuilder()
  .setName("about")
  .setDescription("Learn about the SMP!");

export default aboutMessage;
