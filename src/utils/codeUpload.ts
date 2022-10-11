import { fetch } from "undici";

export async function upload(code: string, name?: string) {
	const response = await fetch("https://sourceb.in/api/bins", {
		body: JSON.stringify({
			title: "Code",
			description: "Because I am lazy",
			files: [{ name, content: code, languageId: 378 }],
		}),
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const data = (await response.json()) as PostData;
	return `<https://sourceb.in/${data.key}>`;
}

interface PostData {
	key: string;
}
