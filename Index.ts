import {
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  GuildMember,
  Interaction,
  Message,
} from "discord.js";
import aboutMessage from "./commands/about";
import dotenv from "dotenv";
import mongoose from "mongoose";
import LevelModel from "./schemas/level";
import checkLevel from "./commands/checklevel";
import createSmpMember from "./commands/createsmpmember";
import SMPModel from "./schemas/smpmember";
import getMembers from "./commands/getsmpmembers";
import deleteSmpMember from "./commands/deletesmpmember";

dotenv.config();

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

    await mongoose.connect(process.env.MONGODB_URL as string);
    console.log("Connected to database!");
  } catch (error) {
    console.error(error);
  }
});

client.on("guildMemberAdd", async (member: GuildMember) => {
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

client.on("interactionCreate", async (interaction: Interaction) => {
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
        const smpmembersembeds = smpmembers.map((member: any) => {
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

client.on("messageCreate", async (Message: Message) => {
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
