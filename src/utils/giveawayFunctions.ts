import { ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";

export function parseTimeInput(
    input: string
): { days: number; hours: number; minutes: number; seconds: number } | string {
    if (!input.includes(":")) {
        const minutes = parseInt(input);
        if (isNaN(minutes) || minutes <= 0) {
            return "Invalid time format. Use a positive number for minutes or DD:HH:MM:SS format.";
        }
        return { days: 0, hours: 0, minutes, seconds: 0 };
    }
    const parts = input.split(":").map((part) => parseInt(part));

    if (parts.some((part) => isNaN(part) || part < 0)) {
        return "Invalid time format. All time components must be non-negative numbers.";
    }

    let days = 0,
        hours = 0,
        minutes = 0,
        seconds = 0;

    if (parts.length === 4) {
        // DD:HH:MM:SS
        [days, hours, minutes, seconds] = parts;
    } else if (parts.length === 3) {
        // HH:MM:SS (assume no days)
        [hours, minutes, seconds] = parts;
    } else if (parts.length === 2) {
        // MM:SS (assume no days or hours)
        [minutes, seconds] = parts;
    } else {
        return "Invalid time format. Use DD:HH:MM:SS, HH:MM:SS, MM:SS, or just minutes.";
    }

    if (hours >= 24) return "Hours must be less than 24.";
    if (minutes >= 60) return "Minutes must be less than 60.";
    if (seconds >= 60) return "Seconds must be less than 60.";

    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
        return "Giveaway duration must be greater than 0.";
    }

    return { days, hours, minutes, seconds };
}

export function discardRows() {
    const discardGiveaway = new ButtonBuilder({
        customId: "discard",
        label: "Discard",
        style: ButtonStyle.Primary,
    });

    return new ActionRowBuilder<ButtonBuilder>().addComponents(discardGiveaway);
}

export function setupRows() {
    const enterGiveaway = new ButtonBuilder({
        customId: "enter",
        label: "Enter Giveaway",
        style: ButtonStyle.Success,
    });
    const leaveGiveaway = new ButtonBuilder({
        customId: "leave",
        label: "Leave Giveaway",
        style: ButtonStyle.Danger,
    });
    const editGiveaway = new ButtonBuilder({
        customId: "edit",
        label: "Edit Giveaway",
        style: ButtonStyle.Primary,
    });
    const endGiveaway = new ButtonBuilder({
        customId: "end",
        label: "End Giveaway",
        style: ButtonStyle.Secondary,
    });

    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        enterGiveaway,
        leaveGiveaway,
        editGiveaway,
        endGiveaway
    );
}
