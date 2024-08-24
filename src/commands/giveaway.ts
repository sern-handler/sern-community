import { commandModule, CommandType, scheduledTask } from "@sern/handler";
import { publish } from "#plugins";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { db } from "../utils/db.js";
import { add, addDays, addHours, addMinutes, addSeconds } from "date-fns"
import { Timestamp } from "#utils";

export default commandModule({
    type: CommandType.Slash,
    description: "Start a giveaway involving users who react to the embed",
    plugins: [publish()],
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
            let timeLeftString = ctx.options.getString("time")

            let timeUnit1
            let timeLeft1
            let timeUnit2
            let timeLeft2
            if (!timeLeftString?.includes("and")) {
                timeUnit1 = timeLeftString?.split(" ")[1]
                timeLeft1 = Number(timeLeftString?.split(" ")[0])
            }
            else {
                let timeLeftStringPart1 = timeLeftString.split("and")[0]
                timeUnit1 = timeLeftStringPart1?.split(" ")[1]
                timeLeft1 = Number(timeLeftStringPart1?.split(" ")[0])

                let timeLeftStringPart2 = timeLeftString.split("and")[1].replace(timeLeftString.split("and")[1].substring(0, 1), "")
                timeUnit2 = timeLeftStringPart2?.split(" ")[1]
                timeLeft2 = Number(timeLeftStringPart2?.split(" ")[0])
            }

            const startTime = new Date()

            let endTime: Date

            let secondNames = ['seconds', 'second', 'sec', 'secs']
            let minuteNames = ['minutes', 'minute', 'min', 'mins']
            let hourNames = ['hours', 'hour', 'hr', 'hrs']
            let dayNames = ['days', 'day']

            endTime = add(startTime, {
                timeUnit1: timeLeft1,
                timeUnit2: timeLeft2
            })

            if (secondNames.includes(timeUnit1!)) {
                endTime = endTime === startTime ? addSeconds(startTime, timeLeft1) : addSeconds(endTime, timeLeft1)
            }
            if (secondNames.includes(timeUnit2!)) {
                endTime = endTime === startTime ? addSeconds(startTime, timeLeft2!) : addSeconds(endTime, timeLeft2!)
            }
            if (minuteNames.includes(timeUnit1!)) {
                endTime = endTime === startTime ? addMinutes(startTime, timeLeft1) : addMinutes(endTime, timeLeft1)
            }
            if (minuteNames.includes(timeUnit2!)) {
                endTime = endTime === startTime ? addMinutes(startTime, timeLeft2!) : addMinutes(endTime, timeLeft2!)
            }
            if (hourNames.includes(timeUnit1!)) {
                endTime = endTime === startTime ? addHours(startTime, timeLeft1) : addHours(endTime, timeLeft1)
            }
            if (hourNames.includes(timeUnit2!)) {
                endTime = endTime === startTime ? addHours(startTime, timeLeft2!) : addHours(endTime, timeLeft2!)
            }
            if (dayNames.includes(timeUnit1!)) {
                endTime = endTime === startTime ? addDays(startTime, timeLeft1) : addDays(endTime, timeLeft1)
            }
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
                {name: '\u200b', value: `Time Left: ${new Timestamp(Number(endTimeStamp2)).getRelativeTime()}`},
                {name: '\u200b', value: `Ends at: ${endTimeStamp}`}
            )
            

            await ctx.reply({
                embeds: [embed],
            }).then(embedMessage => {
                embedMessage.react("🎉")

                let intervalTime = endTime.getTime() - startTime.getTime()

                let interval = setInterval(() => {
                    const stmt = db.prepare(`SELECT * FROM entrees`).all()

                    let winnerIndex = Math.floor(Math.random() * stmt.length)

                    if (stmt.length > 0 && stmt[winnerIndex].user_id !== ctx.userId) {
                        const winnerId = stmt[winnerIndex].user_id

                        embed.setDescription('\u200b')
                        embed.setFields(
                            {name: '\u200b', value: `Winner: <@${winnerId}>`},
                            {name: '\u200b', value: `Hosted by: <@${ctx.userId}>`},
                            {name: '\u200b', value: `Ended at: ${endTimeStamp}`}
                        )

                        embedMessage.edit({embeds: [embed]})

                        clearInterval(interval)
                    }
                    else if (stmt.length > 1 && stmt[winnerIndex].user_id === ctx.userId) {
                        winnerIndex = Math.floor(Math.random() * stmt.length)
                    }
                    else if ((stmt.length === 1 && stmt[winnerIndex].user_id === ctx.userId) || stmt.length === 0) {
                        embed.setDescription('\u200b')
                        embed.setFields(
                            {name: '\u200b', value: `Not enough eligible users`},
                            {name: '\u200b', value: `Hosted by: <@${ctx.userId}>`},
                            {name: '\u200b', value: `Ended at: ${endTimeStamp}`}
                        )

                        embedMessage.edit({embeds: [embed]})

                        clearInterval(interval)
                    }
            }, intervalTime)
        })

        db.prepare(`DELETE FROM entrees`).run()
    }
})