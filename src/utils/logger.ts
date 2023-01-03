import type { Logging, LogPayload } from "@sern/handler";
import winston from "winston";
import util from 'util'
export class SernLogger implements Logging {
	private _winston!: winston.Logger

	constructor(
		level: string,
		isProd : boolean = false
	) {
		this._winston = winston.createLogger({
			level,
			format: winston.format.json(),
		});
		if(!isProd) {
			this._winston.add(new winston.transports.Console({
				format: winston.format.simple(),
			}))
		} else {
			this._winston.add(new winston.transports.File({ filename: 'combined.log' }))
		}
	}

	error(payload: LogPayload<unknown>): void {
		this._winston.error(payload.message)
	}

	warning(payload: LogPayload<unknown>): void {
		this._winston.warn(util.format(payload.message))
	}

	info(payload: LogPayload<unknown>): void {
		this._winston.info(payload.message)
	}

	debug(payload: LogPayload<unknown>): void {
		this._winston.debug(payload.message)
	}

}