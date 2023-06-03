import { OverlordClient, OverlordEvent } from "../types/Overlord";

import fs from "fs";
import path from "node:path";
import { AsciiTable3 } from "ascii-table3";
let table = new AsciiTable3("Events");

table.setHeading("Event", "Status", "Once");

const event_dir = path.join(__dirname, "../events");

export = async (client: OverlordClient) => {
  const load_dir = async (dir: string) => {
    const event_files = fs
      .readdirSync(`${event_dir}/${dir}`)
      .filter((file: string) => file.endsWith(".js"));

    for (const file of event_files) {
      const event: OverlordEvent = await import(`${event_dir}/${dir}/${file}`);
      if (event.once) {
        client.once(event.name, (...args: any[]) =>
          event.execute(client, ...args)
        );
      } else {
        client.on(event.name, (...args: any[]) =>
          event.execute(client, ...args)
        );
      }
      table.addRow(file, "✓", event.once ? "✓" : "✕");
    }

    console.log(table.toString());
  };

  load_dir("client");
};
