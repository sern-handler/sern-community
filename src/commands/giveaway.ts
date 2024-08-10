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
        .setTitle(`${item} Giveaway`)
        .addFields(
            {name: '\u200b', value: 'React to enter the giveaway!'},
            {name: '\u200b', value: `Time: ${timeLeft}${timeUnit}`},
            {name: '\u200b', value: `Ends at: ${endTimeStamp}`}
        )
        

        await ctx.reply({
            embeds: [embed],
        }).then(embedMessage => {
            embedMessage.react("🎉")

            let interval
        
            if (timeUnit === 's') {
                interval = 1000
            }
            else if (timeUnit === 'm') {
                interval = 60000
            }
            else if (timeUnit === 'h') {
                interval = 3600000
            }

            setInterval(() => {
                const stmt = db.prepare(`SELECT * FROM entrees`).all()
        
                const winnerIndex = Math.floor(Math.random() * stmt.length)
                const winnerId = stmt[winnerIndex].user_id
                const winner = ctx.guild?.members.cache.get(winnerId)
                const winnerName = winner?.user.globalName

                embed.setFields(
                    {name: '\u200b', value: `Winner: @${winnerName}`},
                    {name: '\u200b', value: `Ended at: ${endTimeStamp}`}
                )

                embedMessage.edit({embeds: [embed]})
            }, timeLeft * interval)
        })

        db.prepare(`DELETE FROM entrees`).run()
    }
})