import { commandModule, CommandType } from "@sern/handler";
import { ownerOnly, publish } from "#plugins";
import { ApplicationCommandOptionType, ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
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

            endTime = add(startTime, {
                seconds: secondNames.includes(timeUnit1!) ? timeLeft1 : secondNames.includes(timeUnit2!) ? timeLeft2 : 0,
                minutes: minuteNames.includes(timeUnit1!) ? timeLeft1 : minuteNames.includes(timeUnit2!) ? timeLeft2 : 0,
                hours: hourNames.includes(timeUnit1!) ? timeLeft1 : hourNames.includes(timeUnit2!) ? timeLeft2 : 0,
                days: dayNames.includes(timeUnit1!) ? timeLeft1 : dayNames.includes(timeUnit2!) ? timeLeft2 : 0
            })

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
                let giveawayEnded = false

                db.prepare(`INSERT INTO giveaway_message(message_id, host_id) VALUES (?, ?)`).run(embedMessage.id, ctx.userId)

                embedMessage.react("🎉")

                //checks if author reacted to itself
                const selfReactionInterval = setInterval(() => {
                    const userReactions = embedMessage.reactions.cache.filter(reaction => reaction.users.cache.has(ctx.userId));
            
                    for (const reaction of userReactions.values()) {
                        reaction.users.remove(ctx.userId);
                        ctx.interaction.followUp({content: "As the host of the giveaway, you cannot enter it.", ephemeral: true})
                    }
                }, 1000)

                let intervalTime = endTime.getTime() - startTime.getTime()

                setTimeout(() => {
                    const stmt = db.prepare(`SELECT * FROM entries WHERE message_id = ?`).all(embedMessage.id)

                    let winnerIndex = Math.floor(Math.random() * stmt.length)

                    if (stmt.length > 0 && stmt[winnerIndex].user_id !== ctx.userId) {
                        const winnerId = stmt[winnerIndex].user_id

                        embedMessage.edit({content: `Congratulations <@${winnerId}> on winning the ${item} giveaway! ${stmt.length} users entered`, embeds: []})
                        giveawayEnded = true
                    }
                    else if (stmt.length > 1 && stmt[winnerIndex].user_id === ctx.userId) {
                        while (stmt[winnerIndex].user_id === ctx.userId) {
                            winnerIndex = Math.floor(Math.random() * stmt.length)
                        }
                        const winnerId = stmt[winnerIndex].user_id

                        embedMessage.edit({content: `Congratulations <@${winnerId}> on winning the ${item} giveaway! ${stmt.length} users entered`, embeds: []})
                        giveawayEnded = true

                    }
                    else if ((stmt.length === 1 && stmt[winnerIndex].user_id === ctx.userId) || stmt.length === 0) {
                        embedMessage.edit({content: `Couldn't determine a winner: Not enough eligible users. ${stmt.length} users entered`, embeds: [], components: [retryRows()]})
                        giveawayEnded = true
                    }
                    db.prepare(`DELETE FROM giveaway_message WHERE message_id = ?`).run(embedMessage.id)
                    db.prepare(`DELETE FROM entries WHERE message_id = ?`).run(embedMessage.id)

                    if (giveawayEnded) {
                        embedMessage.reactions.removeAll()
                    }
                    clearInterval(selfReactionInterval)
            }, intervalTime)
        })
    }
})

function retryRows() {
    const attemptReroll = new ButtonBuilder({
        customId: 'reroll',
        label: 'Attempt Reroll',
        style: ButtonStyle.Primary
    })

    const resendGiveaway = new ButtonBuilder({
        customId: 'resend',
        label: 'Resend Giveaway',
        style: ButtonStyle.Primary
    })

    const discardGiveaway = new ButtonBuilder({
        customId: 'discard',
        label: 'Discard Giveaway',
        style: ButtonStyle.Primary
    })

    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(attemptReroll, resendGiveaway, discardGiveaway);
}