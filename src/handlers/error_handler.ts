import { OverlordClient } from "../types/Overlord";

/**
 * Background process to handle errors and report them to the developer
 */
export class ErrorHandler {
  client: OverlordClient;

  constructor(client: OverlordClient) {
    this.client = client;
  }

  async messageDev(error: Error) {
    console.error(error);

    if (process.env.DEVELOPMENT_MODE) return;

    const adminDM = await this.client.users.createDM("265023187614433282");
    await adminDM.send(`An error occured: \`\`\`${error}\`\`\``);
  }

  async fatal(error: Error) {}
}
