import { Args, CommandType, Context, commandModule } from "@sern/handler";
import { inspect } from "util";
import { ownerOnly } from "../plugins/ownerOnly";

export default commandModule({
	type: CommandType.Text,
	description: "Eval something",
	plugins: [ownerOnly()],
	alias: ["ev"],
	execute: async (ctx, args) => {
		const [type, code] = args;
		const { channel, guild, client, user, member, message: msg } = ctx;
		if (
			guild.id !== "941002690211766332" &&
			ctx.user.id !== "697795666373640213"
		)
			return;
		if (type !== "text") return;
		if (
			(code.join(" ").includes("send") || code.join(" ").includes("reply")) &&
			ctx.user.id !== "697795666373640213"
		)
			return;

		if (code.join(" ").includes("process.env")) return;
		if (code.join(" ").includes("token")) return;
		let result: unknown | string;

		try {
			result = eval(code.join(" "));
		} catch (error) {
			result = error;
		}
		if (result instanceof Promise) result = await result;
		if (typeof result !== "string") {
			result = inspect(result, {
				depth: 0,
			});
		}

		result = "```js\n" + result + "\n```";

		if ((result as string).length > 2000) {
			channel!.send("Result is too long to send");
		}
		ctx.channel!.send({ content: result as string });
	},
});
