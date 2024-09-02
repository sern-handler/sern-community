import { commandModule, CommandType, scheduledTask } from "@sern/handler";
import { ownerOnly, publish } from "#plugins";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { db } from "../utils/db.js";
import { add, addDays, addHours, addMinutes, addSeconds } from "date-fns"
import { Timestamp } from "#utils";

export default commandModule({
    type: CommandType.Slash,
    description: "Start a giveaway involving users who react to the embed",
    plugins: [publish(), ownerOnly()],
    options: [
        {
            name: "item",
            description: "The item that will be given away",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "time",
            description: "The amount of time that the giveaway will be up",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    execute: async (ctx, { deps }) => {
            const item = ctx.options.getString("item")
            const timeLeftString = ctx.options.getString("time", true)

            let timeUnit1
            let timeLeft1
            let timeUnit2
            let timeLeft2

            const [part1, part2] = timeLeftString?.split("and")
            timeUnit1 = part1?.split(" ")[1]
            timeLeft1 = Number(part1?.split(" ")[0])

            if (part2) {
                const timeLeftStringPart2 = part2.replace(part2.substring(0, 1), "")
                timeUnit2 = timeLeftStringPart2?.split(" ")[1]
                timeLeft2 = Number(timeLeftStringPart2?.split(" ")[0])
            }

            const startTime = new Date()

            let endTime: Date

            const secondNames = ['seconds', 'second', 'sec', 'secs']
            const minuteNames = ['minutes', 'minute', 'min', 'mins']
            const hourNames = ['hours', 'hour', 'hr', 'hrs']
            const dayNames = ['days', 'day']

            endTime = add(startTime, {
                timeUnit1: timeLeft1,
                timeUnit2: timeLeft2
            })

            // This if chain uses date-fns to correctly calculate the time allocated to the giveaway based on what the
            // user types (seconds, minutes, etc.)

            // if the time unit before the "and" is "seconds" or one of the other entries in the secondNames array, add the time entered
            // to the startTime and save that in the endTime
            if (secondNames.includes(timeUnit1!)) {
                endTime = endTime === startTime ? addSeconds(startTime, timeLeft1) : addSeconds(endTime, timeLeft1)
            }
            // if the time unit after the "and" is "seconds" or one of the other entries in the secondNames array, add the time entered
            // to the startTime and save that in the endTime
            if (secondNames.includes(timeUnit2!)) {
                endTime = endTime === startTime ? addSeconds(startTime, timeLeft2!) : addSeconds(endTime, timeLeft2!)
            }
            // if the time unit before the "and" is "minutes" or one of the other entries in the minuteNames array, add the time entered
            // to the startTime and save that in the endTime
            if (minuteNames.includes(timeUnit1!)) {
                endTime = endTime === startTime ? addMinutes(startTime, timeLeft1) : addMinutes(endTime, timeLeft1)
            }
            // if the time unit after the "and" is "minutes" or one of the other entries in the minuteNames array, add the time entered
            // to the startTime and save that in the endTime
            if (minuteNames.includes(timeUnit2!)) {
                endTime = endTime === startTime ? addMinutes(startTime, timeLeft2!) : addMinutes(endTime, timeLeft2!)
            }
            // if the time unit before the "and" is "hours" or one of the other entries in the hourNames array, add the time entered
            // to the startTime and save that in the endTime
            if (hourNames.includes(timeUnit1!)) {
                endTime = endTime === startTime ? addHours(startTime, timeLeft1) : addHours(endTime, timeLeft1)
            }
            // if the time unit after the "and" is "hours" or one of the other entries in the hourNames array, add the time entered
            // to the startTime and save that in the endTime
            if (hourNames.includes(timeUnit2!)) {
                endTime = endTime === startTime ? addHours(startTime, timeLeft2!) : addHours(endTime, timeLeft2!)
            }
            // if the time unit before the "and" is "days" or one of the other entries in the dayNames array, add the time entered
            // to the startTime and save that in the endTime
            if (dayNames.includes(timeUnit1!)) {
                endTime = endTime === startTime ? addDays(startTime, timeLeft1) : addDays(endTime, timeLeft1)
            }
            // if the time unit after the "and" is "days" or one of the other entries in the dayNames array, add the time entered
            // to the startTime and save that in the endTime
            if (dayNames.includes(timeUnit2!)) {
                endTime = endTime === startTime ? addDays(startTime, timeLeft2!) : addDays(endTime, timeLeft2!)
            }

            const endTimeStamp: string = `<t:${Math.floor(endTime!.getTime() / 1000)}:f>`
            const endTimeStamp2 = new Timestamp(endTime.getTime()).timestamp

            let embed = new EmbedBuilder()
            .setTitle(`🥳 ${item} giveaway 🥳`)
            .setDescription('React to enter the giveaway!')
            .addFields(
                {name: '\u200b', value: `Hosted by: <@${ctx.userId}>`},
                {name: '\u200b', value: `Ends: ${new Timestamp(Number(endTimeStamp2)).getRelativeTime()} (${endTimeStamp})`}
            )
            

            await ctx.reply({
                embeds: [embed],
            }).then(embedMessage => {
                embedMessage.react("🎉")

                //checks if author reacted to itself
                const selfReactionInterval = setInterval(() => {
                    const userReactions = embedMessage.reactions.cache.filter(reaction => reaction.users.cache.has(ctx.userId));
            
                    for (const reaction of userReactions.values()) {
                        reaction.users.remove(ctx.userId);
                    }
                }, 1000)

                let intervalTime = endTime.getTime() - startTime.getTime()

                setTimeout(() => {
                    const stmt = db.prepare(`SELECT * FROM entrees`).all()

                    let winnerIndex = Math.floor(Math.random() * stmt.length)

                    if (stmt.length > 0 && stmt[winnerIndex].user_id !== ctx.userId) {
                        const winnerId = stmt[winnerIndex].user_id

                        embed.setDescription('\u200b')
                        embed.setFields(
                            {name: '\u200b', value: `Winner: <@${winnerId}>`},
                            {name: '\u200b', value: `Hosted by: <@${ctx.userId}>`},
                            {name: '\u200b', value: `Ended: ${new Timestamp(Number(endTimeStamp2)).getRelativeTime()} (${endTimeStamp})`}
                        )

                        embedMessage.edit({embeds: [embed]})
                    }
                    else if (stmt.length > 1 && stmt[winnerIndex].user_id === ctx.userId) {
                        winnerIndex = Math.floor(Math.random() * stmt.length)
                    }
                    else if ((stmt.length === 1 && stmt[winnerIndex].user_id === ctx.userId) || stmt.length === 0) {
                        embed.setDescription('\u200b')
                        embed.setFields(
                            {name: '\u200b', value: `Not enough eligible users`},
                            {name: '\u200b', value: `Hosted by: <@${ctx.userId}>`},
                            {name: '\u200b', value: `Ended: ${new Timestamp(Number(endTimeStamp2)).getRelativeTime()} (${endTimeStamp})`}
                        )

                        embedMessage.edit({embeds: [embed]})
                    }
                    clearInterval(selfReactionInterval)
            }, intervalTime)
        })

        db.prepare(`DELETE FROM entrees`).run()
    }
})
