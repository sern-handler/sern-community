import { publish } from "#plugins";
import { CommandType, commandModule } from "@sern/handler";
import { ApplicationCommandOptionType } from "discord.js";
import { Octokit } from "@octokit/rest";
import { Timestamp } from "#utils";
import { Emojis } from "#constants";
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

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
					const text = ctx.options.getFocused();
					const repo = ctx.options.getString("repo");
					if (!repo) return ctx.respond([]);

					let search;

					if (text.length) {
						search = await octokit.search.issuesAndPullRequests({
							q: `repo:sern-handler/${repo} ${text} in:title`,
						});
					}

					const prefix = (t: object | undefined) => (t ? "$" : "#");

					if (!text.length) {
						const issues = await octokit.issues.listForRepo({
							owner: "sern-handler",
							repo,
							state: "all",
							per_page: 100,
						});
						const map = issues.data
							.filter((i) => (text.length ? true : i.state === "open"))
							.map((issue) => ({
								name: cutText(
									`${prefix(issue.pull_request)}${issue.number} - ${
										issue.title
									}`
								),
								value: issue.number,
							}));

						return ctx.respond(map.slice(0, 25));
					}

					return ctx.respond(
						search?.data.items
							.filter((i) => i.title.toLowerCase().includes(text.toLowerCase()))
							.map((issue) => ({
								name: cutText(
									`${prefix(issue.pull_request)}${issue.number} - ${
										issue.title
									}`
								),
								value: issue.number,
							}))

							.slice(0, 25) ?? []
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
		const emoji = (i: typeof issue): string => {
			if (i.pull_request) {
				switch (i.state) {
					case "open":
						return i.draft ? Emojis.PRDraft : Emojis.PROpen;
					case "closed":
						return i.pull_request.merged_at ? Emojis.PRMerged : Emojis.PRClosed;
				}
			}
			switch (i.state) {
				case "open":
					return Emojis.IssueOpen;
				case "closed":
					return i.state_reason === "completed"
						? Emojis.IssueClosed
						: i.state_reason === "not_planned"
						? Emojis.IssueNotPlanned
						: "";
			}
			return "";
		};

		const suffix = (i: typeof issue): string => {
			let str = "";
			let time = "";
			if (i.pull_request) {
				switch (i.state) {
					case "open":
						str = i.draft ? "drafted" : "opened";
						time = i.created_at;
						break;
					case "closed":
						str = i.pull_request.merged_at ? "merged" : "closed";
						time = i.pull_request.merged_at ?? i.closed_at ?? "";
						break;
				}
			} else {
				switch (i.state) {
					case "open":
						str = "opened";
						time = i.created_at;
						break;
					case "closed":
						str = i.state_reason === "completed" ? "completed" : "closed";
						time = i.closed_at ?? "";
						break;
				}
			}
			return `${str} ${new Timestamp(
				new Date(time).getTime()
			).getRelativeTime()}`;
		};

		let reply = target
			? `*GitHub ${
					issue.pull_request ? "Pull Request" : "Issue"
			  } data for ${target}>*\n`
			: "";

		reply += `${emoji(issue)}  [\`${prefix(
			issue.pull_request
		)}${number} in sern/${repo}\`](<${issue.html_url}>) ___${
			issue.title
		}___\n${suffix(issue)} by [${issue.user!.login}](<${
			issue.user?.html_url
		}>)`;

		return ctx.reply(reply);
	},
});

function cutText(text: string) {
	return text.length > 99 ? text.slice(0, 97) + "..." : text;
}
