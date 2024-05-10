// @ts-nocheck
/**
 * This is OwnerOnly plugin, it allows only bot owners to run the command, like eval.
 *
 * @author @EvolutionX-10 [<@697795666373640213>]
 * @version 1.0.0
 * @example
 * ```ts
 * import { ownerOnly } from "../plugins/ownerOnly";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [ ownerOnly() ],
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 */

import { CommandType, CommandControlPlugin, controller } from "@sern/handler";
import { ownerIDs } from "#constants";

function map(s: string[]) {
    const userMention = (s: string) => `<@!${s}>`;
    return s.map((id) => `\` - \` ${userMention(id)}`).join("\n");
}
export function ownerOnly(override?: string[]) {
    return CommandControlPlugin<CommandType.Both>(async (ctx, args) => {
        if ((override ?? ownerIDs).includes(ctx.user.id)) return controller.next();
        //* If you want to reply when the command fails due to user not being owner, you can use following
        await ctx.reply({
            content: `Not for you! Only these users can run this\n${map(override ?? ownerIDs)}`,
            ephemeral: true,
            allowedMentions: { repliedUser: false },
        });
        return controller.stop(); //! Important: It stops the execution of command!
    });
}
