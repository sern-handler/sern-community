import { commandModule, CommandType } from "@sern/handler";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { publish } from "../plugins/publish";

export default commandModule({
  type: CommandType.Slash,
  plugins: [publish()],
  description: "Links to the docs!",
  execute: async (ctx) => {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Docs")
        .setStyle(ButtonStyle.Link)
        .setURL("https://sern-handler.js.org/docs/intro")
    );
    await ctx.reply({ components: [row] });
  },
});
