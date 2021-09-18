import {IRegruConfig} from "./regru.config.interface";

class RegruConfig implements IRegruConfig {
    readonly apiUrl: string;

    constructor(
        public readonly token: string = process.env.REGRU_TOKEN || "",
        private readonly _serverId: string = process.env.REGRU_SERVER_ID || "",
    ) {
        this.apiUrl = `https://api.cloudvps.reg.ru/v1/reglets/${_serverId}/actions`;
    }
}

export {RegruConfig}
