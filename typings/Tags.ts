import type { Message } from "discord.js";

export interface TagData {
    name: string;
    content: string;
    keywords: string[];
    embed?: boolean;
}

export type TagMessage = Message & { tagTriggerId?: string };
