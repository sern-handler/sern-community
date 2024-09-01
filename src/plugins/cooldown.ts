/**
 * @plugin
 * Allows you to set cooldowns (or "ratelimits") for commands, limits user/channel/guild actions.
 * An extra function cooldown2 is exported if you want your cooldown to be local to the command.
 * @author @trueharuu [<@504698587221852172>]
 * @version 1.0.0
 * @example
 * ```ts
 * import { cooldown, cooldown2 } from "../plugins/cooldown";
 * import { commandModule } from "@sern/handler";
 * //IF you want this cooldown to be local to this command: 
 * const localCooldown = cooldown2()
 * export default commandModule({
 *  plugins: [cooldown.add([['channel', '1/4']]), // limit to 1 action every 4 seconds per channel
 *            localCooldown.add([["user", "1/10"]])], // limit to 1 action every 10 seconds, local to command
 *  execute: (ctx) => { //your code here }
 * })
 * ```
 * @end
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
		iterable: [K, V][] | ReadonlyMap<K, V> = [],
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


function parseCooldown(
	location: CooldownLocation,
	cooldown: CooldownString,
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

function __add(map : ExpiryMap<string, number>,
               items: Array<| [CooldownLocation 
                            | keyof typeof CooldownLocation, CooldownString]
                            | Cooldown>,
                message?: CooldownResponse) {
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

type Location = (value: CooldownString) => ReturnType<typeof __add>;

const locationsFn  = (map: ExpiryMap<string, number>)=>  ({
	[CooldownLocation.channel]: (value) => __add(map, [[CooldownLocation.channel, value]]),
	[CooldownLocation.user]: (value) => __add(map, [[CooldownLocation.user, value]]),
	[CooldownLocation.guild]: (value) => __add(map, [[CooldownLocation.guild, value]]),
} as Record<CooldownLocation, Location>);



export const cooldown2 = () => {
    const cooldownMap = new ExpiryMap<string, number>();
    return {
        add:(items: Array<| [CooldownLocation 
                            | keyof typeof CooldownLocation, CooldownString]
                            | Cooldown>,
             message?: CooldownResponse) =>  __add(cooldownMap, items, message),
        locations: locationsFn(cooldownMap),
        map: cooldownMap
    }
};

const map = new ExpiryMap<string, number>();
export const cooldown = {
    map,
    locations: locationsFn(map),
    add: (items: Array<| [CooldownLocation 
                       | keyof typeof CooldownLocation, CooldownString]
                       | Cooldown>,
          message?: CooldownResponse) => __add(map, items, message)
}

