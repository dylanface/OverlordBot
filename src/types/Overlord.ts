import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  Client,
  Collection,
  Events,
  AutocompleteInteraction,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import { REST } from "@discordjs/rest";

import token from "../util/token_provider";

import { ModerationLogger } from "../modules/ModerationLogger";
import { ErrorHandler } from "../handlers/error_handler";
import { EventLogger } from "../modules/EventLogger";
import { GuildSettingsManager } from "../modules/GuildSettings";

export interface OverlordEvent {
  name: string;
  once?: boolean;
  execute: (client: OverlordClient, ...args: any[]) => void;
}

export interface OverlordSlashCommand {
  name: string;
  enabled?: boolean;
  config?: {
    help?: {};
    permissions?: {};
  };
  data: SlashCommandBuilder;
  execute: (
    client: OverlordClient,
    interaction: ChatInputCommandInteraction
  ) => Promise<void>;
}

export interface OverlordSubCommandGroup {
  name: string;
  enabled?: boolean;
  config: {
    hasSubs?: boolean;
    help?: {};
  };
  data: SlashCommandBuilder;
}

export interface OverlordSubCommand {
  name: string;
  enabled?: boolean;
  category?: string;
  config?: {
    help?: {};
  };
  data: SlashCommandSubcommandBuilder;
  execute: (
    client: OverlordClient,
    interaction: ChatInputCommandInteraction
  ) => Promise<void>;
}

export interface OverlordAutocompleteInteraction {
  name: string;
  enabled?: boolean;
  config?: {};
  execute: (
    client: OverlordClient,
    interaction: AutocompleteInteraction
  ) => Promise<void>;
}

export interface OverlordContextMenuCommand {
  name: string;
  enabled?: boolean;
  config?: {};
  data: ContextMenuCommandBuilder;
  execute: (
    client: OverlordClient,
    interaction: MessageContextMenuCommandInteraction
  ) => Promise<void>;
}

export type OverlordCommandType =
  | OverlordSlashCommand
  | OverlordSubCommand
  | OverlordSubCommandGroup
  | undefined;

export class OverlordClient extends Client {
  REST: REST;
  slashCommands: Collection<
    string,
    OverlordSlashCommand | OverlordSubCommandGroup
  >;
  subCommands: Collection<string, OverlordSubCommand>;
  contextMenuCommands: Collection<string, any>;
  autocompleteInteractions: Collection<string, any>;

  ModerationLogger: ModerationLogger;
  ErrorHandler: ErrorHandler;
  EventLogger: EventLogger;
  GuildSettingsManager: GuildSettingsManager;

  connect() {
    this.login(token());
  }

  constructor(options: any) {
    super(options);

    this.REST = new REST({ version: "10" }).setToken(token());
    this.slashCommands = new Collection();
    this.subCommands = new Collection();
    this.contextMenuCommands = new Collection();
    this.autocompleteInteractions = new Collection();

    this.ModerationLogger = new ModerationLogger(this);
    this.ErrorHandler = new ErrorHandler(this);
    this.EventLogger = new EventLogger(this);

    this.GuildSettingsManager = new GuildSettingsManager();

    // Start the ErrorHandler when the client is ready
    this.once(Events.ClientReady, () => {
      console.log(`Logged in as ${this.user?.tag}!`);
      process.on("uncaughtException", (err) =>
        this.ErrorHandler.messageDev(err)
      );
    });
  }
}
