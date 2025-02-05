import { ownerIDs } from "#constants";
import { commandModule, CommandType } from "@sern/handler";
import { db } from "../../utils/db.js";

export default commandModule({
    type: CommandType.Button,
    name: "resend",
    async execute(ctx) {
        // if (!ownerIDs.includes(ctx.user.id))
        //     return ctx.reply({
        //         ephemeral: true,
        //         content: `You cannot resend the giveaway because you are not one of the owners`,
        //     }

        console.log(ctx.message.interaction?.commandName)
        let test = await ctx.guild?.commands.fetch(ctx.message.interaction?.id)!.then(res => res.toJSON())
        console.log(test)
    },
});
