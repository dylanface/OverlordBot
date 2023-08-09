import { SlashCommandBuilder } from "@discordjs/builders";
import { OverlordSlashCommand } from "../../types/Overlord";
import { Guild, GuildMemberRoleManager, PermissionsBitField } from "discord.js";

export = <OverlordSlashCommand>{
  enabled: true,
  name: "export",
  config: {
    global: true,
  },
  data: new SlashCommandBuilder()
    .setName("export")
    .setDescription("Export conversation data to a file.")
    .addStringOption((option) =>
      option
        .setName("conversation")
        .setDescription("Export the conversation associated with this ID.")
        .setRequired(false)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Export this user's most recent conversation.")
        .setRequired(false)
    ),
  async execute(client, interaction) {
    const conversationId = interaction.options.getString("conversation");
    const userId = interaction.options.getUser("user");

    const inGuild = interaction.inGuild();

    if (conversationId && userId) {
      throw new Error("Both conversation ID and user provided.");
    }

    if (inGuild) {
      if (!conversationId && !userId) {
        throw new Error("No conversation ID or user provided.");
      }

      const guildManager = client.DirectMessageManagers.get(
        interaction.guildId!
      );
      if (!guildManager) throw new Error("Guild manager not found.");

      const guildMember = interaction.member;
      const hasModerationRole =
        (guildMember.roles as GuildMemberRoleManager).cache.filter(
          (role) => role.name === "Chancellor"
        ).size > 0;

      if (userId) {
        const user = userId;
        const conversation = await guildManager.getConversationByUser(user);
        if (!conversation) throw new Error("Conversation does not exist.");

        if (!hasModerationRole)
          throw new Error(
            "You do not have permission to export other user's conversations, you can export your own conversations in DMs with Overlord."
          );

        const transcriptFile = await conversation.export();
        if (!transcriptFile) throw new Error("Could not generate transcript.");
        interaction.reply({
          files: [transcriptFile],
        });
      }

      if (conversationId) {
        const conversation = await guildManager.getConversationById(
          conversationId
        );
        if (!conversation) throw new Error("Conversation does not exist.");

        if (
          conversation.user.id !== interaction.user.id &&
          !hasModerationRole
        ) {
          throw new Error(
            "You do not have permission to export other user's conversations, you can export your own conversations in DMs with Overlord."
          );
        }

        const transcriptFile = await conversation.export();
        if (!transcriptFile)
          throw new Error("Could not generate transcipt file.");
        interaction.reply({
          files: [transcriptFile],
        });
      }

      return;
    }

    if (!inGuild) {
      if (!conversationId && !userId) {
        let result: any;
        for (let manager of client.DirectMessageManagers.values()) {
          const conversation = await manager.getConversationByUser(
            interaction.user
          );
          if (!conversation)
            throw new Error(
              "You do not have a recent conversation with Overlord."
            );
          if (!result || result.lastMessageMS < conversation.lastMessageMS)
            result = conversation;
        }
        if (!result) throw new Error("Could not find conversation.");

        const transcriptFile = await result.export();
        if (!transcriptFile) throw new Error("Could not generate transcript.");
        interaction.reply({
          files: [transcriptFile],
        });
      }

      if (userId) {
        throw new Error(
          "You can not export other user's conversations outside of the guild they are associated with."
        );
      }

      if (conversationId) {
        let conversation: any;
        for (let manager of client.DirectMessageManagers.values()) {
          manager.cache.has(conversationId)
            ? (conversation = manager.cache.get(conversationId))
            : undefined;
        }
        if (!conversation) throw new Error("Conversation does not exist.");

        const guild = client.guilds.cache.get(conversation.guildId);
        if (!guild) throw new Error("Guild not found.");
        const guildMember = guild.members.cache.get(interaction.user.id);
        if (!guildMember) throw new Error("Guild member not found.");
        const hasModerationRole =
          (guildMember.roles as GuildMemberRoleManager).cache.filter(
            (role) => role.name === "Chancellor"
          ).size > 0;

        if (
          conversation.user.id !== interaction.user.id &&
          !hasModerationRole
        ) {
          throw new Error(
            "You do not have permission to export other user's conversations, you can export your own conversations in DMs with Overlord."
          );
        }

        const transcriptFile = await conversation.export();
        if (!transcriptFile)
          throw new Error("Could not generate transcipt file.");
        interaction.reply({
          files: [transcriptFile],
        });
      }
    }
  },
};
