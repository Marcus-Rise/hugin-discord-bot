import {NextApiHandler} from "next";
import {InteractionResponseType, InteractionType} from "discord-interactions";
import {Regru} from "../../src/regru";
import {DiscordBotCommandEnum, DiscordBotInterceptor} from "../../src/discord";

enum Roles {
    JARL = "888462183875366962",
}

const APPLICATION_ID: string = process.env.DISCORD_APPLICATION_ID || "";
const url = new URL("/api/oauth2/authorize", "https://discord.com");
url.searchParams.append("client_id", APPLICATION_ID);
url.searchParams.append("permissions", JSON.stringify(["bot", "applications.commands"]));

const config = {
    api: {
        bodyParser: false,
    },
}

const Handler: NextApiHandler = async (request, response) => {
    const message = await DiscordBotInterceptor(request, response);

    if (message) {
        // Handle PINGs from Discord
        if (message.type === InteractionType.PING) {
            console.log("Handling Ping request");
            response.send({
                type: InteractionResponseType.PONG,
            });
        } else if (message.type === InteractionType.APPLICATION_COMMAND) {
            if (!message.member.roles.includes(Roles.JARL)) {
                return response.status(200).json({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: "Ты не похож на Ярла!"
                    }
                })
            }
            // Handle our Slash Commands
            switch (message.data.name.toLowerCase()) {
                case DiscordBotCommandEnum.START:
                    console.log("starting valheim server");
                    await Regru.start()
                        .then(res => {
                            console.log(res);
                            response.status(200).send({
                                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                                data: {
                                    content: "Вальхалла ждет!",
                                    // flags: 64,
                                },
                            })
                        })
                        .catch(e => {
                            console.error(e);
                            response.status(200).send({
                                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                                data: {
                                    content: String(e),
                                    // flags: 64,
                                },
                            });
                        })
                    break;
                case DiscordBotCommandEnum.STOP:
                    console.log("stopping valheim server");
                    await Regru.stop()
                        .then(res => {
                            console.log(res);
                            response.status(200).send({
                                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                                data: {
                                    content: "Еще увидимся...",
                                    // flags: 64,
                                },
                            });
                        })
                        .catch(e => {
                            console.error(e);
                            response.status(200).send({
                                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                                data: {
                                    content: String(e),
                                    // flags: 64,
                                },
                            });
                        })
                    break;
                default:
                    console.error("Unknown Command");
                    response.status(400).send({error: "Unknown Type"});
                    break;
            }
        } else {
            console.error("Unknown Type");
            response.status(400).send({error: "Unknown Type"});
        }
    }
};

export default Handler;
export {config};
