import { createRequire } from "node:module";

export * from "./FuzzyMatcher.js";
export * from "./Paginator.js";
export * from "./Resolver.js";
export * from "./TicTacToe.js";
export * from "./Timestamp.js";
export * from "./pagination.js";
export * from "./Logger.js";
export * from "./composable/slashCommand.js";

export const require = createRequire(import.meta.url);

export function cutText(text: string) {
    if (text.length > 100) {
        return text.slice(0, 97) + "...";
    }
    return text;
}

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
