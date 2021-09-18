interface IRegruService {
    stop(): Promise<unknown>;
    start(): Promise<unknown>;
}

export type {IRegruService}
