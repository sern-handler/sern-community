import { commandModule, CommandType, scheduledTask } from "@sern/handler";
import { publish } from "#plugins";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { db } from "../utils/db.js";

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
            description: "The amount of time that the giveaway will be up (end with s, m, or h)",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    execute: async (ctx) => {
        const item = ctx.options.getString("item")
        let timeLeftString = ctx.options.getString("time")
        let timeUnit = timeLeftString?.substring(timeLeftString.length - 1)
        let timeLeft = Number(timeLeftString?.substring(0, timeLeftString.length - 1))

        const startTime = new Date()

        let endTime: Date
        if (timeUnit === 's') {
            endTime = new Date(startTime.getTime() + timeLeft! * 1000)
        }
        else if (timeUnit === 'm') {
            endTime = new Date(startTime.getTime() + timeLeft! * 60000)
        }
        else if (timeUnit === 'h') {
            endTime = new Date(startTime.getTime() + timeLeft! * 3600000)
        }
        const endTimeStamp: string = `<t:${Math.floor(endTime!.getTime() / 1000)}:f>`

        let embed = new EmbedBuilder()
        .setTitle(`🥳 ${item} giveaway 🥳`)
        .setDescription('React to enter the giveaway!')
        .addFields(
            {name: '\u200b', value: `Hosted by: <@${ctx.userId}>`},
            {name: '\u200b', value: `Ends at: ${endTimeStamp}`}
        )
        

        await ctx.reply({
            embeds: [embed],
        }).then(embedMessage => {
            embedMessage.react("🎉")

            let interval = setInterval(() => {
                let now = new Date().getTime()

                let distance = endTime.getTime() - now

                let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
                let seconds = Math.floor((distance % (1000 * 60)) / 1000)

                if (distance >= 0) {
                    embed.setFields(
                        {name: '\u200b', value: `Time Left: ${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`},
                        {name: '\u200b', value: `Hosted by: <@${ctx.userId}>`},
                        {name: '\u200b', value: `Ends at: ${endTimeStamp}`}
                    )

                    embedMessage.edit({embeds: [embed]})
                }

                else if (distance < 0) {
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
                        console.log(winnerIndex)
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
                }
            }, 1000)
        })

        db.prepare(`DELETE FROM entrees`).run()
    }
})