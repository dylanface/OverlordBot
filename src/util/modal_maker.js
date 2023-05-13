const {
  BaseInteraction,
  TextInputStyle,
  InteractionType,
  ComponentType,
} = require("discord.js");
const {
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
} = require("@discordjs/builders");

module.exports = {
  /**
   * @param { BaseInteraction } interaction The command interaction object.
   */
  prompt: async (interaction, client, prompt) => {
    return new Promise(async (resolve, reject) => {
      const modalCustomId = `prompt_${Math.floor(
        Math.random() * 100
      ).toString()}`;

      const modal = new ModalBuilder()
        .setCustomId(modalCustomId)
        .setTitle("Prompt");

      const promptRow = new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("prompt")
          .setLabel(prompt)
          .setPlaceholder("Answer the prompt and click sumbit.")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      );

      modal.addComponents(promptRow);

      await interaction.showModal(modal);

      const filter = (i) => (i.customId === modalCustomId ? true : false);

      const process = (i) => {
        if (i.type !== InteractionType.ModalSubmit) return;
        console.log("Modal submitted");
        if (filter(i)) {
          console.log("Modal filtered");
          client.off("interactionCreate", process);
          resolve({ response: i.fields.getTextInputValue("prompt") });
          i.update({});
        } else return;
      };

      client.on("interactionCreate", process);

      setTimeout(() => {
        client.off("interactionCreate", process);
        reject("Prompt timed out.");
      }, 5 * 60 * 1000);
    });
  },
  // options_prompt: async (interaction, client, options, multi = false) => {
  //   if (!options || typeof options !== "object")
  //     throw new Error("No options provided.");

  //   return new Promise(async (resolve, reject) => {
  //     const modalCustomId = `prompt_${Math.floor(
  //       Math.random() * 100
  //     ).toString()}`;

  //     const modal = new ModalBuilder()
  //       .setCustomId(modalCustomId)
  //       .setTitle("Prompt");

  //     const selectMenu = new SelectMenuBuilder()
  //       .setCustomId("prompt")
  //       .setPlaceholder("Select an option and click sumbit.");

  //     if (multi) selectMenu.setMinValues(1).setMaxValues(options.length);

  //     for (const opt of options) {
  //       selectMenu.addOptions(
  //         new SelectMenuOptionBuilder().setLabel(opt.label).setValue(opt.value)
  //       );
  //     }

  //     const promptRow = new ActionRowBuilder().addComponents(selectMenu);

  //     modal.setComponents(promptRow);

  //     await interaction.showModal(modal);

  //     const filter = (i) => (i.customId === modalCustomId ? true : false);

  //     const process = (i) => {
  //       if (i.type !== InteractionType.ModalSubmit) return;
  //       console.log("Modal submitted");
  //       if (filter(i)) {
  //         console.log("Modal filtered");
  //         client.off("interactionCreate", process);
  //         resolve({
  //           choice: i.fields.getField("prompt", ComponentType.SelectMenu),
  //         });
  //         i.update({});
  //       } else return;
  //     };

  //     client.on("interactionCreate", process);

  //     setTimeout(() => {
  //       client.off("interactionCreate", process);
  //       reject("Prompt timed out.");
  //     }, 5 * 60 * 1000);
  //   });
  // },
};
