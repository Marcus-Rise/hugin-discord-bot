import {IRegruService, RegruService} from "./service";
import {RegruConfig} from "./config";

export type {IRegruService} from './service'

const Regru: IRegruService = new RegruService(new RegruConfig());

export {Regru}
