import { AttachmentBuilder, Channel, DMChannel, Guild, User } from "discord.js";
import { OverlordClient, DirectMessageContent } from "../types/Overlord";
import clientPromise from "../database/index";
import { generateColoredEmbed } from "../util/embed_generator";
import { EmbedBuilder } from "@discordjs/builders";
import * as Transcript from "discord-html-transcripts";
import { generateAlphaNumericString } from "../util/string_utils";

export class DirectMessageManager {
  client: OverlordClient;
  guild: Guild;
  cache: Map<string, DirectMessageConversation> = new Map();

  constructor(client: OverlordClient, guild: Guild) {
    this.client = client;
    this.guild = guild;
  }

  /**
   * @description Get the most recent conversation with the user.
   */
  async getConversationByUser(
    user: User,
    options?: {
      upsert?: boolean;
    }
  ): Promise<DirectMessageConversation> {
    return new Promise(async (resolve, reject) => {
      let conversation: DirectMessageConversation | undefined;

      for (const [key, value] of this.cache.entries()) {
        if (value.user.id === user.id) {
          if (conversation) {
            if (value.lastMessageMS > conversation.lastMessageMS) {
              conversation = value;
            }
          } else conversation = value;
          break;
        }
      }

      if (conversation) return resolve(conversation);

      const jsonConversation = await (await clientPromise)
        .db("overlord")
        .collection("direct_messages")
        .findOne({ userId: user.id, guildId: this.guild.id });

      if (!jsonConversation) {
        if (options?.upsert) {
          conversation = new DirectMessageConversation(this, user);
          this.cache.set(conversation.id, conversation);
          return resolve(conversation);
        }
        return reject("Conversation not found.");
      }

      conversation = new DirectMessageConversation(this, user, {
        conversationId: jsonConversation.id ?? undefined,
        channelId: jsonConversation.channelId ?? undefined,
        conversationInfoMessageId:
          jsonConversation.conversationInfoMessageId ?? undefined,
        lastMessageTimestamp:
          jsonConversation.lastMessageTimestamp ?? undefined,
      });

      this.cache.set(conversation.id, conversation);
      return resolve(conversation);
    });
  }

  /**
   * @description Get a conversation by it's ID.
   */
  async getConversationById(id: string): Promise<DirectMessageConversation> {
    return new Promise(async (resolve, reject) => {
      let conversation: DirectMessageConversation | undefined;

      if (this.cache.has(id)) {
        conversation = this.cache.get(id);
        if (!conversation)
          return reject(
            "Conversation has the incorrect format in the cache and can not be returned."
          );
        return resolve(conversation);
      }

      const jsonConversation = await (await clientPromise)
        .db("overlord")
        .collection("direct_messages")
        .findOne({ id: id, guildId: this.guild.id });

      if (!jsonConversation) {
        return reject("Conversation not found.");
      }

      const user = await this.client.users.fetch(jsonConversation.userId);

      conversation = new DirectMessageConversation(this, user, {
        conversationId: jsonConversation.id ?? undefined,
        channelId: jsonConversation.channelId ?? undefined,
        conversationInfoMessageId:
          jsonConversation.conversationInfoMessageId ?? undefined,
        lastMessageTimestamp:
          jsonConversation.lastMessageTimestamp ?? undefined,
      });

      this.cache.set(id, conversation);
      return resolve(conversation);
    });
  }

  /**
   * @description Create a new conversation with a user.
   */
  async createConversation(user: User): Promise<DirectMessageConversation> {
    return new Promise(async (resolve, reject) => {
      const conversation = new DirectMessageConversation(this, user);

      this.cache.set(conversation.id, conversation);
      return resolve(conversation);
    });
  }

  /**
   * @description Save a conversation to the database.
   */
  async saveConversation(conversation: DirectMessageConversation) {
    await (
      await clientPromise
    )
      .db("overlord")
      .collection("direct_messages")
      .updateOne(
        { id: conversation.id, guildId: conversation.guildId },
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
  #manager: DirectMessageManager;
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
    this.#manager = manager;
    // Generate a random ID for the conversation if one is not provided from the persisted data.
    // The ID is a 6 character alphanumeric string.
    this.id = persistedValues?.conversationId ?? generateAlphaNumericString(6);
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

    if (!this.persistent) this.save();
  }

  get lastMessageMS() {
    return this.lastMessageTimestamp ?? 0;
  }

  #getChannel(): Promise<DMChannel> {
    return new Promise(async (resolve, reject) => {
      let dmChannel: Channel | DMChannel | undefined;

      if (!this.channelId || !(typeof this.channelId === "string"))
        dmChannel = await this.user.createDM();
      else dmChannel = this.#manager.client.channels.cache.get(this.channelId);

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
        `Overlord has started a new conversation with you on behalf of **${
          this.#manager.guild.name
        }**. 

        Moderators of **${
          this.#manager.guild.name
        }** will be able to export and view the contents of this conversation.

        If you would like to export this conversation for your own records, run the following command in this DM channel: \`/export ${
          this.id
        }\`.`
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
    if (!this.#manager.guild.available)
      throw new Error("Guild information is not available.");
    if (!this.channel) this.channel = await this.#getChannel();
    const channel = this.channel;

    let guildEmbed = content.embed ?? generateColoredEmbed();

    guildEmbed.setFooter({
      text: `This is an automated message sent on behalf of ${
        this.#manager.guild?.name
      }.`,
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
    await this.#manager.saveConversation(this);
  }

  export(): Promise<AttachmentBuilder> | undefined {
    return new Promise(async (resolve, reject) => {
      let transcript: Promise<AttachmentBuilder>;

      if (!this.channel) this.channel = await this.#getChannel();
      const channel = this.channel;

      if (!this.conversationInfoMessageId) {
        return undefined;
      } else {
        let messages = await channel.messages.fetch({
          after: this.conversationInfoMessageId,
        });

        messages = messages.filter(
          (msg) =>
            !msg.attachments.some((a) => a.contentType?.includes("text/html"))
        );

        transcript = Transcript.generateFromMessages(
          messages.reverse(),
          channel,
          {
            filename: `overlord_conversation_${this.id}.html`,
            poweredBy: false,
          }
        );
      }

      return resolve(transcript);
    });
  }
}
