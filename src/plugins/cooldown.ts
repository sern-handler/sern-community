// @ts-nocheck
/**
 * Allows you to set cooldowns (or "ratelimits") for commands
 * limits user/channel/guild actions,
 * @author @trueharuu [<@504698587221852172>]
 * @version 1.0.0
 * @example
 * ```ts
 * import { cooldown } from "../plugins/cooldown";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [cooldown.add( [ ['channel', '1/4'] ] )], // limit to 1 action every 4 seconds per channel
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 */

import {
	CommandControlPlugin,
	CommandType,
	Context,
	controller,
} from "@sern/handler";
import { GuildMember } from "discord.js";
/**
 * actions/seconds
 */
export type CooldownString = `${number}/${number}`;
export interface Cooldown {
	location: CooldownLocation;
	seconds: number;
	actions: number;
}
export enum CooldownLocation {
	channel = "channel",
	user = "user",
	guild = "guild",
}

export class ExpiryMap<K, V> extends Map<K, V> {
	public readonly expiry: number;
	constructor(
		expiry: number = Infinity,
		iterable: [K, V][] | ReadonlyMap<K, V> = []
	) {
		super(iterable);
		this.expiry = expiry;
	}

	public set(key: K, value: V, expiry: number = this.expiry): this {
		super.set(key, value);
		if (expiry !== Infinity)
			setTimeout(() => {
				super.delete(key);
			}, expiry);
		return this;
	}
}

export const map = new ExpiryMap<string, number>();

function parseCooldown(
	location: CooldownLocation,
	cooldown: CooldownString
): Cooldown {
	const [actions, seconds] = cooldown.split("/").map((s) => Number(s));

	if (
		!Number.isSafeInteger(actions) ||
		!Number.isSafeInteger(seconds) ||
		actions === undefined ||
		seconds === undefined
	) {
		throw new Error(`Invalid cooldown string: ${cooldown}`);
	}

	return {
		actions,
		seconds,
		location,
	};
}

function getPropertyForLocation(context: Context, location: CooldownLocation) {
	switch (location) {
		case CooldownLocation.channel:
			return context.channel!.id;
		case CooldownLocation.user:
			if (!context.member || !(context.member instanceof GuildMember)) {
				throw new Error("context.member is not a GuildMember");
			}
			return context.member.id;
		case CooldownLocation.guild:
			return context.guildId;
	}
}

export interface RecievedCooldown {
	location: CooldownLocation;
	actions: number;
	maxActions: number;
	seconds: number;
	context: Context;
}
type CooldownResponse = (cooldown: RecievedCooldown) => any;

function add(
	items: Array<
		| [CooldownLocation | keyof typeof CooldownLocation, CooldownString]
		| Cooldown
	>,
	message?: CooldownResponse
) {
	const raw = items.map((c) => {
		if (!Array.isArray(c)) return c;
		return parseCooldown(c[0] as CooldownLocation, c[1]);
	}) as Array<Cooldown>;
	return CommandControlPlugin<CommandType.Both>(async (context, args) => {
		for (const { location, actions, seconds } of raw) {
			const id = getPropertyForLocation(context, location);
			const cooldown = map.get(id!);

			if (!cooldown) {
				map.set(id!, 1, seconds * 1000);
				continue;
			}

			if (cooldown >= actions) {
				if (message) {
					await message({
						location,
						actions: cooldown,
						maxActions: actions,
						seconds,
						context,
					});
				}
				return controller.stop();
			}

			map.set(id!, cooldown + 1, seconds * 1000);
		}
		return controller.next();
	});
}

type Location = (value: CooldownString) => ReturnType<typeof add>;

const locations: Record<CooldownLocation, Location> = {
	[CooldownLocation.channel]: (value) =>
		add([[CooldownLocation.channel, value]]),
	[CooldownLocation.user]: (value) => add([[CooldownLocation.user, value]]),
	[CooldownLocation.guild]: (value) => add([[CooldownLocation.guild, value]]),
};

export const cooldown = {
	add,
	locations,
	map,
};
