import {NextApiHandler} from "next";
import {InteractionResponseType, InteractionType, verifyKey} from "discord-interactions";

enum Commands {
    START = "start",
    STOP = "stop",
}

enum Roles {
    JARL = "888462183875366962",
}

interface IMessage {
    application_id: string;
    channel_id: string;
    data: {
        id: string;
        name: Commands;
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

const REGRU_TOKEN: string = process.env.REGRU_TOKEN || "";
const REGRU_SERVER_ID: string = process.env.REGRU_SERVER_ID || "";
const APPLICATION_ID: string = process.env.DISCORD_APPLICATION_ID || "";
const PUBLIC_KEY: string = process.env.DISCORD_PUBLIC_KEY || "";
const url = new URL("/api/oauth2/authorize", "https://discord.com");
url.searchParams.append("client_id", APPLICATION_ID);
url.searchParams.append("permissions", JSON.stringify(["bot", "applications.commands"]));

const config = {
    api: {
        bodyParser: false,
    },
}

const Handler: NextApiHandler = async (request, response) => {
    // Only respond to POST requests
    if (request.method === "POST") {
        // Verify the request
        // const rawBody = await getRawBody(request.body);
        const rawBody = await new Promise<string>((resolve) => {
            if (!request.body) {
                let buffer = ''
                request.on('data', (chunk) => {
                    buffer += chunk
                })

                request.on('end', () => {
                    // res.status(200).json(JSON.parse(Buffer.from(buffer).toString()))
                    resolve(Buffer.from(buffer).toString());
                })
            }
        });
        const signature = String(request.headers["x-signature-ed25519"]);
        const timestamp = String(request.headers["x-signature-timestamp"]);

        const isValidRequest = verifyKey(
            rawBody,
            signature,
            timestamp,
            PUBLIC_KEY,
        );

        if (!isValidRequest) {
            console.error("Invalid Request");
            return response.status(401).send({error: "Bad request signature "});
        }

        // Handle the request
        const message: IMessage = JSON.parse(rawBody);

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
                case Commands.START:
                    response.status(200).send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: "Вальхалла ждет!",
                            // flags: 64,
                        },
                    });
                    console.log("starting valheim server");
                    fetch("https://api.cloudvps.reg.ru/v1/reglets/" + REGRU_SERVER_ID + "/actions", {
                        method: "POST",
                        body: JSON.stringify({type: "start"}),
                        headers: {
                            Authorization: `Bearer ${REGRU_TOKEN}`,
                            "Content-type": "application/json",
                        },
                    })
                        .then(res => res.json())
                        .then(console.log)
                    break;
                case Commands.STOP:
                    response.status(200).send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: "Еще увидимся...",
                            // flags: 64,
                        },
                    });
                    console.log("stopping valheim server");
                    fetch("https://api.cloudvps.reg.ru/v1/reglets/" + REGRU_SERVER_ID + "/actions", {
                        method: "POST",
                        body: JSON.stringify({type: "stop"}),
                        headers: {
                            Authorization: `Bearer ${REGRU_TOKEN}`,
                            "Content-type": "application/json",
                        },
                    })
                        .then(res => res.json())
                        .then(console.log)
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
    } else {
        response.status(200).send({});
    }
};

export default Handler;
export {config};
