// for hosting

import { Client, EmbedBuilder, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { SlashCommandBuilder } from "discord.js";

const getMembers = new SlashCommandBuilder()
  .setName("smpmembers")
  .setDescription("Get information about all the smp members!!");

dotenv.config();

const LevelSchema = new mongoose.Schema({
  userid: String,
  level: Number,
  xp: Number,
});

const LevelModel = mongoose.model("levels", LevelSchema);

const SMPMemberSchema = new mongoose.Schema({
  memberid: String,
  membername: String,
  memberdescription: String,
  memberprofile: String,
});

const SMPModel = mongoose.model("smpmembers", SMPMemberSchema);

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

const deleteSmpMember = new SlashCommandBuilder()
  .setName("deletesmpmember")
  .setDescription("Add an smp member to the database!")
  .addUserOption((option) =>
    option
      .setName("smpmember")
      .setDescription("The smp member in the server!")
      .setRequired(true)
  );

const checkLevel = new SlashCommandBuilder()
  .setName("level")
  .setDescription("Check your user level!");

const aboutMessage = new SlashCommandBuilder()
  .setName("about")
  .setDescription("Learn about the SMP!");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.on("ready", async () => {
  try {
    if (!client.user) return;
    console.log(`Logged in as ${client.user.tag}!`);

    client.application?.commands.create(aboutMessage);
    client.application?.commands.create(checkLevel);
    client.application?.commands.create(createSmpMember);
    client.application?.commands.create(deleteSmpMember);
    client.application?.commands.create(getMembers);

    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to database!");
  } catch (error) {
    console.error(error);
  }
});

client.on("guildMemberAdd", async (member) => {
  try {
    const welcomeChannel = await member.guild.channels.cache.get(
      "1209376800061399142"
    );
    if (welcomeChannel && welcomeChannel.isTextBased()) {
      const userEmbed = new EmbedBuilder()
        .setTitle(`${member.user.username} has joined the server!`)
        .setImage(member.user.avatarURL())
        .setColor("Green");
      welcomeChannel.send({ embeds: [userEmbed] });
    }
  } catch (error) {
    console.error(error);
  }
});

client.on("guildMemberRemove", async (member) => {
  try {
    const welcomeChannel = await member.guild.channels.cache.get(
      "1209531489591627836"
    );
    if (welcomeChannel && welcomeChannel.isTextBased()) {
      const userEmbed = new EmbedBuilder()
        .setTitle(`${member.user.username} has left the server!`)
        .setImage(member.user.avatarURL())
        .setColor("Red");
      welcomeChannel.send({ embeds: [userEmbed] });
    }
  } catch (error) {
    console.error(error);
  }
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isCommand()) return;
    switch (interaction.commandName) {
      case "about":
        const aboutEmbed = new EmbedBuilder()
          .setTitle("Scavenger SMP")
          .setDescription(
            "Scavenger SMP is a Minecraft SMP (Survival Minecraft Multiplayer) where everyone" +
              " spawns in with a gem. Around the map, there is name tags. When you name your gem with the name of the nametag, it gains powers."
          );
        await interaction.reply({ embeds: [aboutEmbed] });
        break;
      case "level":
        const user = await LevelModel.findOne({ userid: interaction.user.id });

        if (user) {
          const levelEmbed = new EmbedBuilder()
            .setTitle(`Your Level Is ${user.level}`)
            .setDescription(`Your xp for the server is ${user.xp}`)
            .setImage(interaction.user.avatarURL());
          await interaction.reply({ embeds: [levelEmbed] });
        } else {
          await interaction.reply("Error, you are not in the database!");
        }
        break;
      case "createsmpmember":
        const userName = interaction.options.getUser("smpmember");
        const memberDesc = interaction.options.get("memberdesc");

        if (!userName || !memberDesc) return;

        await SMPModel.create({
          memberid: userName.id.toString(),
          membername: userName.username.toString(),
          memberdescription: memberDesc.value,
          memberprofile: userName?.avatarURL(),
        });

        await interaction.reply("Success!");
        break;
      case "smpmembers":
        const smpmembers = await SMPModel.find();
        const smpmembersembeds = smpmembers.map((member) => {
          return new EmbedBuilder()
            .setTitle(member.membername)
            .setDescription(member.memberdescription)
            .setImage(member.memberprofile.toString());
        });

        await interaction.reply({ embeds: smpmembersembeds });
        break;
      case "deletesmpmember":
        const userData = interaction.options.getUser("smpmember");

        const checkUser = await SMPModel.findOne({ memberid: userData?.id });

        if (checkUser) {
          await SMPModel.deleteOne({ memberid: userData?.id });
          await interaction.reply("Success!");
        } else {
          await interaction.reply("SMP Member does not exist!");
        }
    }
  } catch (error) {
    console.error(error);
  }
});

client.on("messageCreate", async (Message) => {
  try {
    const userExists = await LevelModel.findOne({ userid: Message.author.id });

    if (userExists === null) {
      await LevelModel.create({ userid: Message.author.id, level: 0, xp: 10 });
    } else {
      if (userExists.xp === 100) {
        await LevelModel.findOneAndUpdate(
          { userid: Message.author.id },
          { xp: 0, $inc: { level: 1 } }
        );
      } else {
        await LevelModel.findOneAndUpdate(
          { userid: Message.author.id },
          { $inc: { xp: 10 } }
        );
      }
    }
  } catch (error) {
    console.error(error);
  }
});

client.login(process.env.DISCORD_SECRET);
