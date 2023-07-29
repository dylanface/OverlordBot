import { Channel, DMChannel, Guild, SnowflakeUtil, User } from "discord.js";
import { OverlordClient, DirectMessageContent } from "../types/Overlord";
import clientPromise from "../database/index";
import { generateColoredEmbed } from "../util/embed_generator";
import { EmbedBuilder } from "@discordjs/builders";

export class DirectMessageManager {
  client: OverlordClient;
  guild: Guild;
  cache: Map<string, DirectMessageConversation> = new Map();

  constructor(client: OverlordClient, guild: Guild) {
    this.client = client;
    this.guild = guild;
  }

  getConversation(user: User): Promise<DirectMessageConversation> {
    return new Promise(async (resolve, reject) => {
      let conversation: DirectMessageConversation | undefined;

      if (this.cache.has(user.id)) {
        conversation = this.cache.get(user.id);
        if (!conversation)
          return reject(
            "Conversation has the incorrect format in the cache and can not be returned."
          );
        return resolve(conversation);
      }

      const jsonConversation = await (await clientPromise)
        .db("overlord")
        .collection("direct_messages")
        .findOne({ userId: user.id, guildId: this.guild.id });

      if (!jsonConversation) {
        conversation = new DirectMessageConversation(this, user);
      } else {
        conversation = new DirectMessageConversation(this, user, {
          conversationId: jsonConversation.id ?? undefined,
          channelId: jsonConversation.channelId ?? undefined,
          conversationInfoMessageId:
            jsonConversation.conversationInfoMessageId ?? undefined,
          lastMessageTimestamp:
            jsonConversation.lastMessageTimestamp ?? undefined,
        });
      }

      this.cache.set(user.id, conversation);
      return resolve(conversation);
    });
  }

  async saveConversation(conversation: DirectMessageConversation) {
    await (
      await clientPromise
    )
      .db("overlord")
      .collection("direct_messages")
      .updateOne(
        { userId: conversation.user.id, guildId: conversation.guildId },
        {
          $set: {
            id: conversation.id,
            userId: conversation.user.id,
            guildId: conversation.guildId,
            channelId: conversation.channelId,
            conversationInfoMessageId: conversation.conversationInfoMessageId,
            lastMessageTimestamp: conversation.lastMessageTimestamp,
          },
        },
        { upsert: true }
      );
  }
}

class DirectMessageConversation {
  manager: DirectMessageManager;
  id: string;
  user: User;
  guildId: string;
  channelId: string | undefined;
  channel: DMChannel | undefined;
  conversationInfoMessageId: string | undefined;
  lastMessageTimestamp: number | undefined;
  persistent: boolean = false;

  constructor(
    manager: DirectMessageManager,
    user: User,
    persistedValues?: {
      conversationId?: string;
      channelId?: string;
      conversationInfoMessageId?: string;
      lastMessageTimestamp?: number;
    }
  ) {
    this.manager = manager;
    this.id =
      persistedValues?.conversationId ?? SnowflakeUtil.generate().toString();
    this.user = user;
    this.guildId = manager.guild.id;

    if (persistedValues) {
      this.channelId = persistedValues.channelId;
      this.conversationInfoMessageId =
        persistedValues.conversationInfoMessageId;
      this.lastMessageTimestamp = persistedValues.lastMessageTimestamp;
      this.persistent = true;
    }

    this.#getChannel().then((channel) => {
      this.channel = channel;
      this.channelId = channel.id;
    });

    if (!this.persistent) {
      this.save();
    }
  }

  get lastMessageMS() {
    return this.lastMessageTimestamp ?? 0;
  }

  #getChannel(): Promise<DMChannel> {
    return new Promise(async (resolve, reject) => {
      let dmChannel: Channel | DMChannel | undefined;

      if (!this.channelId || !(typeof this.channelId === "string"))
        dmChannel = await this.user.createDM();
      else dmChannel = this.manager.client.channels.cache.get(this.channelId);

      if (!dmChannel) dmChannel = await this.user.createDM();
      if (!dmChannel)
        return reject("DM channel could not be found or created.");

      if (!dmChannel.isDMBased() || !(dmChannel instanceof DMChannel)) {
        return reject("Channel is not a DM channel.");
      }

      return resolve(dmChannel);
    });
  }

  /**
   * @description Send a direct message with information about the conversation to the user associated with the new conversation.
   */
  async sendConversationInfo() {
    if (!this.channel) this.channel = await this.#getChannel();
    const channel = this.channel;

    const conversationInfoEmbed = new EmbedBuilder()
      .setTitle(`Overlord Conversation: ${this.id}`)
      .setDescription(
        `Overlord has started a new conversation with you on behalf of **${this.manager.guild.name}**. Moderators of **${this.manager.guild.name}** will be able to export and view the contents of this conversation. 
        
        • If you would like to export this conversation for your own records, run the following command in this DM channel: \`/export ${this.id}\`. 

        • If you would like to reject this conversation, run the following command in this DM channel: \`/reject ${this.id}\`.

        • Rejected conversations will be deleted after 24 hours, and can not be interacted with after their deletion.`
      )
      .setColor(0xec8b00);

    const msg = await channel.send({
      embeds: [conversationInfoEmbed],
    });

    if (!this.conversationInfoMessageId)
      this.conversationInfoMessageId = msg.id;
    this.lastMessageTimestamp = msg.createdTimestamp;

    return msg.id;
  }

  /**
   * @description Send a direct message to the user associated with the current conversation. The message will be converted to an embed.
   *
   * @warning This method will **not** apply the automated message warning footer to the embed sent.
   */
  async send(content: DirectMessageContent) {
    if (!this.channel) this.channel = await this.#getChannel();
    const channel = this.channel;

    let dmEmbed = content.embed ?? generateColoredEmbed();

    if (content.color) dmEmbed.setColor(content.color);
    if (content.message) dmEmbed.setDescription(content.message);

    if (!this.conversationInfoMessageId)
      this.conversationInfoMessageId = await this.sendConversationInfo();

    const msg = await channel.send({
      embeds: [dmEmbed],
    });

    this.lastMessageTimestamp = msg.createdTimestamp;
    this.save();
  }

  /**
   * @description Send a direct message to the user associated with the current conversation. The message will be converted to an embed and have an automated message warning footer applied.
   *
   * @info This method will apply an automated message footer to the embed sent.
   */
  async sendFromGuild(content: DirectMessageContent) {
    if (!this.manager.guild.available)
      throw new Error("Guild information is not available.");
    if (!this.channel) this.channel = await this.#getChannel();
    const channel = this.channel;

    let guildEmbed = content.embed ?? generateColoredEmbed();

    guildEmbed.setFooter({
      text: `This is an automated message sent on behalf of ${this.manager.guild?.name}.`,
    });

    if (content.color) guildEmbed.setColor(content.color);
    if (content.message) guildEmbed.setDescription(content.message);

    if (!this.conversationInfoMessageId)
      this.conversationInfoMessageId = await this.sendConversationInfo();

    const msg = await channel.send({
      embeds: [guildEmbed],
    });

    this.lastMessageTimestamp = msg.createdTimestamp;
    this.save();
  }

  async save() {
    await this.manager.saveConversation(this);
  }
}
