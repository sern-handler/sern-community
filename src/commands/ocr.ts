import { publish } from '#plugins';
import { commandModule, CommandType } from '@sern/handler';
import { ActionRowBuilder, codeBlock, ComponentType, inlineCode, StringSelectMenuBuilder } from 'discord.js';
import { createWorker } from 'tesseract.js';

export default commandModule({
    type: CommandType.CtxMsg,
    plugins: [publish()],
    description: '',
    execute: async (ctx) => {
        const select = new StringSelectMenuBuilder({
            customId: 'ocr-lang',
            placeholder: 'Select language',
            options: [
                { label: 'English', value: 'eng', emoji: '🇺🇸' },
                { label: 'Spanish', value: 'spa', emoji: '🇪🇸' },
                { label: 'Portuguese', value: 'por', emoji: '🇵🇹' },
                { label: 'French', value: 'fra', emoji: '🇫🇷' },
                { label: 'German', value: 'deu', emoji: '🇩🇪' },
                { label: 'Italian', value: 'ita', emoji: '🇮🇹' },
                { label: 'Japanese', value: 'jpn', emoji: '🇯🇵' },
            ]
        })
        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(select)

        const langMsg = await ctx.reply({
            components: [row],
            ephemeral: true,
        })

        const langCollector = langMsg.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 10000
        })
        langCollector.once('collect', async (i) => {
            const lang = i.values[0]
            langMsg.delete()
            const readingMessage = await ctx.targetMessage.reply({
                content: `Reading image with language ${inlineCode(lang)}...`,
            })

            const image = ctx.targetMessage.attachments.first()
            if (!image) {
                await readingMessage.edit({
                    content: 'No image found',
                })
                return langCollector.stop('No image found')
            }

            const worker = await createWorker(lang)
            const ocrData = await worker.recognize(image.proxyURL)
            await readingMessage.edit({
                content: `Here's what I was able to read:\n${codeBlock(ocrData.data.text)}`,
            })
            await worker.terminate()
        })
    },
});