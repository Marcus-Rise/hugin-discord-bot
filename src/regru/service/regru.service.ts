import {IRegruService} from "./regru.service.interface";
import {IRegruConfig} from "../config";

class RegruService implements IRegruService {
    constructor(private readonly _config: IRegruConfig) {
    }

    start(): Promise<unknown> {
        const {token, apiUrl} = this._config;

        return fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify({type: "start"}),
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-type": "application/json",
            },
        })
            .then(res => res.json())
    }

    stop(): Promise<unknown> {
        const {token, apiUrl} = this._config;

        return fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify({type: "stop"}),
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-type": "application/json",
            },
        })
            .then(res => res.json())
    }
}

export {RegruService}
