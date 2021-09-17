import {NextApiHandler} from "next";
import {InteractionResponseType, InteractionType, verifyKey} from "discord-interactions";
import getRawBody from "raw-body";

const INVITE_COMMAND = {
    name: "Invite",
    description: "Get an invite link to add the bot to your server",
};

const APPLICATION_ID: string = process.env.APPLICATION_ID || "";
const PUBLIC_KEY: string = process.env.PUBLIC_KEY || "";

const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${APPLICATION_ID}&scope=applications.commands`;

const Handler: NextApiHandler = async (request, response) => {
    // Only respond to POST requests
    if (request.method === "POST") {
        // Verify the request
        const signature = String(request.headers["x-signature-ed25519"]);
        const timestamp = String(request.headers["x-signature-timestamp"]);
        const rawBody = await getRawBody(request);

        const isValidRequest = verifyKey(
            rawBody,
            signature,
            timestamp,
            PUBLIC_KEY,
        );

        if (!isValidRequest) {
            console.error("Invalid Request");
            return response.status(401).send({ error: "Bad request signature " });
        }

        // Handle the request
        const message = request.body;

        // Handle PINGs from Discord
        if (message.type === InteractionType.PING) {
            console.log("Handling Ping request");
            response.send({
                type: InteractionResponseType.PONG,
            });
        } else if (message.type === InteractionType.APPLICATION_COMMAND) {
            // Handle our Slash Commands
            switch (message.data.name.toLowerCase()) {
                case INVITE_COMMAND.name.toLowerCase():
                    response.status(200).send({
                        type: 4,
                        data: {
                            content: INVITE_URL,
                            flags: 64,
                        },
                    });
                    console.log("Invite request");
                    break;
                default:
                    console.error("Unknown Command");
                    response.status(400).send({ error: "Unknown Type" });
                    break;
            }
        } else {
            console.error("Unknown Type");
            response.status(400).send({ error: "Unknown Type" });
        }
    }
};

export default Handler;
