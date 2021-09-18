import {NextApiRequest, NextApiResponse} from "next";
import {IDiscordBotMessage} from "./discord-bot-message.dto";
import {verifyKey} from "discord-interactions";

const PUBLIC_KEY: string = process.env.DISCORD_PUBLIC_KEY || "";

const DiscordBotInterceptor = async (req: NextApiRequest, res: NextApiResponse): Promise<IDiscordBotMessage | void> => {
    if (req.method !== "POST") {
        return res.status(405).json("Method not allowed");
    }

    const rawBody = await new Promise<string>((resolve) => {
        if (!req.body) {
            let buffer = ''
            req.on('data', (chunk) => {
                buffer += chunk
            })

            req.on('end', () => {
                // res.status(200).json(JSON.parse(Buffer.from(buffer).toString()))
                resolve(Buffer.from(buffer).toString());
            })
        }
    });

    const signature = String(req.headers["x-signature-ed25519"]);
    const timestamp = String(req.headers["x-signature-timestamp"]);

    const isValidRequest = verifyKey(
        rawBody,
        signature,
        timestamp,
        PUBLIC_KEY,
    );

    if (!isValidRequest) {
        console.error("Invalid Request");
        return res.status(401).send({error: "Bad request signature "});
    }

    return JSON.parse(rawBody) as IDiscordBotMessage;
}

export {DiscordBotInterceptor}
