import { SlashCommandBuilder } from "discord.js";

const getMembers = new SlashCommandBuilder()
  .setName("smpmembers")
  .setDescription("Get information about all the smp members!!");

export default getMembers;
