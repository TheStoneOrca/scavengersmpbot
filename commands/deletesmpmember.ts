import { SlashCommandBuilder } from "discord.js";

const deleteSmpMember = new SlashCommandBuilder()
  .setName("deletesmpmember")
  .setDescription("Add an smp member to the database!")
  .addUserOption((option) =>
    option
      .setName("smpmember")
      .setDescription("The smp member in the server!")
      .setRequired(true)
  );

export default deleteSmpMember;
