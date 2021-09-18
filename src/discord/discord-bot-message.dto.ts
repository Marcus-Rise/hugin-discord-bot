import {InteractionType} from "discord-interactions";
import {DiscordBotCommandEnum} from "./discord-bot-command.enum";

interface IDiscordBotMessage {
    application_id: string;
    channel_id: string;
    data: {
        id: string;
        name: DiscordBotCommandEnum;
        type: number;
    };
    guild_id: string;
    id: string;
    member: {
        avatar: null | unknown;
        deaf: boolean;
        is_pending: boolean;
        joined_at: string;
        mute: boolean;
        /**
         * server nick
         */
        nick: string;
        pending: boolean;
        permissions: string;
        premium_since: null | unknown;
        roles: string[];
        user: {
            avatar: string;
            discriminator: string;
            id: string;
            public_flags: number;
            username: string;
        }
    }
    token: string;
    type: InteractionType,
    /**
     * command version
     */
    version: string;
}

export type {IDiscordBotMessage}
