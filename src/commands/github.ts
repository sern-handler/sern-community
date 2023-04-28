import { publish } from "#plugins";
import { CommandType, commandModule } from "@sern/handler";
import { ApplicationCommandOptionType } from "discord.js";
import { Octokit } from "@octokit/rest";
import { Timestamp } from "#utils";
const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN,
});

export default commandModule({
	type: CommandType.Slash,
	description: "Get info about a PR or issue",
	plugins: [publish({ dmPermission: false })],
	options: [
		{
			name: "repo",
			description: "The repo to get info from",
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true,
			command: {
				onEvent: [],
				async execute(ctx) {
					const text = ctx.options.getFocused();
					const org = await octokit.repos.listForOrg({ org: "sern-handler" });

					if (!org) return ctx.respond([]);
					const repos = org.data
						.sort(
							(a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0)
						)
						.map((repo) => ({ name: `sern/${repo.name}`, value: repo.name }));

					if (!text.length) {
						return ctx.respond(repos.slice(0, 25));
					}
					return ctx.respond(
						repos
							.filter((repo) =>
								repo.name.toLowerCase().includes(text.toLowerCase())
							)
							.slice(0, 25)
					);
				},
			},
		},
		{
			name: "number",
			description: "The number of the PR or issue",
			type: ApplicationCommandOptionType.Integer,
			required: true,
			autocomplete: true,
			command: {
				onEvent: [],
				async execute(ctx) {
					const repo = ctx.options.getString("repo");
					if (!repo) return ctx.respond([]);
					const issues = await octokit.issues.listForRepo({
						owner: "sern-handler",
						repo,
						state: "all",
					});

					const prefix = (t: object | undefined) => (t ? "$" : "#");

					const text = ctx.options.getFocused();
					const map = issues.data
						.filter((i) => (text.length ? true : i.state === "open"))
						.map((issue) => ({
							name: cutText(
								`${prefix(issue.pull_request)}${issue.number} - ${issue.title}`
							),
							value: issue.number,
						}));

					if (!text.length) {
						return ctx.respond(map.slice(0, 25));
					}
					return ctx.respond(
						map
							.filter((issue) =>
								issue.name.toLowerCase().includes(text.toLowerCase())
							)
							.slice(0, 25)
					);
				},
			},
		},
		{
			name: "target",
			description: "Who should I ping that should see this?",
			type: ApplicationCommandOptionType.User,
			required: false,
		},
	],
	async execute(ctx, [, options]) {
		const octokit = new Octokit();

		const repo = options.getString("repo", true);
		const number = options.getInteger("number", true);
		const target = options.getUser("target");

		const issue = (
			await octokit.issues.get({
				owner: "sern-handler",
				repo,
				issue_number: number,
			})
		).data;
		const prefix = (t: object | undefined) => (t ? "$" : "#");

		const reply = `[\`${prefix(
			issue.pull_request
		)}${number} in sern/${repo}\`](<${issue.html_url}>) ___${
			issue.title
		}___\nOpened by [${issue.user!.login}](<${
			issue.user?.html_url
		}>) ${new Timestamp(
			new Date(issue.created_at).getTime()
		).getRelativeTime()}`;

		return ctx.reply(reply);
	},
});

function cutText(text: string) {
	return text.length > 99 ? text.slice(0, 97) + "..." : text;
}
