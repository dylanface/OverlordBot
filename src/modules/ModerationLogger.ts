import { EmbedBuilder } from "@discordjs/builders";
import { Guild, GuildMember, User } from "discord.js";
import { OverlordLogEvent } from "./EventLogger";
import { OverlordClient } from "../types/Overlord";

/**
 * Main point of contact to publish moderation events to guild-logs.
 */
export class ModerationLogger {
  client: OverlordClient;

  constructor(client: OverlordClient) {
    this.client = client;
  }

  /**
   * Publishes a moderation event to the guild-logs channel in the provided guild.
   */
  async publish(guild: Guild, event: any) {
    const channel = this.#getLogChannel(guild);
    if (!channel)
      throw new Error(`No log channel found for guild: ${guild.name}`);

    const { type, suspectId, suspect, moderator, reason } = event;

    let fetchedSuspect;
    if (type === "banned" && suspect != undefined && suspectId === undefined) {
      fetchedSuspect = suspect;
    } else if (type === "bannned") {
      fetchedSuspect = await this.client.users.fetch(suspectId, {
        cache: true,
      });
      event.suspect = fetchedSuspect;
    }

    let embed;
    if (type === "mass-ban") {
      const suspects = event.suspects;
      embed = this.#massModerationEventToEmbed(
        moderator,
        type,
        suspects,
        reason
      );
    } else {
      embed = this.#singularModerationEventToEmbed(
        moderator,
        type,
        suspect,
        reason
      );
    }

    if (!channel.isTextBased())
      throw new Error("Moderation channel is not text based.");
    try {
      channel.send({ embeds: [embed] });
    } catch {
      console.log("Failed to send registry message");
    }

    try {
      this.#publishToEventLogger(guild, event);
    } catch (err) {
      console.log(err);
      console.log("Failed to publish to event log.");
    }
  }

  /**
   * Get the log channel for the provided guild.
   */
  #getLogChannel = (guild: Guild) => {
    const guildLogChannel = guild.channels.cache.find(
      (channel) => channel.name === "guild-logs"
    );
    if (!guildLogChannel) return false;
    return guildLogChannel;
  };

  /**
   * Convert a moderation event to an log embed.
   */
  #singularModerationEventToEmbed = (
    moderator: GuildMember,
    action: string,
    suspect: User,
    reason: string | undefined
  ) => {
    const registryEmbed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setAuthor({
        name: `${suspect.tag}`,
        iconURL: suspect.displayAvatarURL(),
      })
      .addFields({
        name: "Action:",
        value: `\`\`\`The user has been ${action}.\`\`\``,
      })
      .setFooter({
        text: moderator.user.tag,
        iconURL: moderator.user.displayAvatarURL(),
      })
      .setTimestamp();

    if (reason)
      registryEmbed.addFields({
        name: "Reason",
        value: `\`\`\`${reason}\`\`\``,
      });

    return registryEmbed;
  };

  #massModerationEventToEmbed = (
    moderator: GuildMember,
    action: any,
    suspects: Array<User>,
    reason: string
  ) => {
    const registryEmbed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setAuthor({
        name: `${moderator.user.tag}`,
        iconURL: moderator.user.displayAvatarURL(),
      })
      .addFields(
        {
          name: "Action:",
          value: `\`\`\`The affected users have been banned in a mass ban.\`\`\``,
        },
        { name: "Users affected:", value: `\`\`\`${suspects.length}\`\`\`` }
      )
      .setTimestamp();

    if (reason)
      registryEmbed.addFields([
        { name: "Default Reason:", value: `\`\`\`${reason}\`\`\`` },
      ]);

    return registryEmbed;
  };

  #publishToEventLogger = (guild: Guild, event: any) => {
    const formattedEvent = new OverlordLogEvent(this.client)
      .setType(event.type)
      .setAssociatedGuild(guild.id);

    if (event["reason"]) formattedEvent.setDescription(event.reason);
    else formattedEvent.setDescription(`No reason provided.`);

    if (event["suspect"])
      formattedEvent.attachContext({ id: "suspect", item: event.suspect });
    if (event["suspectId"] && !event["suspect"])
      formattedEvent.attachContext({ id: "suspectId", item: event.suspectId });
    if (event["moderator"])
      formattedEvent.attachContext({ id: "moderator", item: event.moderator });
    if (event["moderatorId"] && !event["moderator"])
      formattedEvent.attachContext({
        id: "moderatorId",
        item: event.moderatorId,
      });
    if (event["suspects"])
      formattedEvent.attachContext({ id: "suspects", item: event.suspects });

    formattedEvent.submit();
  };
}
