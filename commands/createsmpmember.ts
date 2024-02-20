import { SlashCommandBuilder } from "discord.js";

const createSmpMember = new SlashCommandBuilder()
  .setName("createsmpmember")
  .setDescription("Add an smp member to the database!")
  .addUserOption((option) =>
    option
      .setName("smpmember")
      .setDescription("The smp member in the server!")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("memberdesc")
      .setDescription("The description of the SMP Member's role in the server!")
      .setRequired(true)
  );

export default createSmpMember;
