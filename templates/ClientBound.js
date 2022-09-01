const { Client } = require("discord.js");

class ClientBound {
  /**
   * @param { Client } client
   */
  client;

  /**
   * @param { Client } client
   */
  constructor(client) {
    if (!client) throw new Error("No client provided.");
    if (!(client instanceof Client))
      throw new Error("Invalid client provided.");

    this.client = client;
  }
}

module.exports = ClientBound;
