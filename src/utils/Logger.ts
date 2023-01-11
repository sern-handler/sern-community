import type { Logging, LogPayload } from "@sern/handler";
import winston from "winston";
import util from "util";
export class SernLogger implements Logging {
	private _winston!: winston.Logger;

	public constructor(level: string, isProd = false) {
		this._winston = winston.createLogger({
			level,
			format: winston.format.json(),
		});
		if (!isProd) {
			this._winston.add(
				new winston.transports.Console({
					format: winston.format.simple(),
				})
			);
		} else {
			this._winston.add(
				new winston.transports.File({ filename: "error.log" })
			);
		}
	}

	public error(payload: LogPayload<unknown>): void {
		this._winston.error(payload.message);
	}

	public warning(payload: LogPayload<unknown>): void {
		this._winston.warn(util.format(payload.message));
	}

	public info(payload: LogPayload<unknown>): void {
		this._winston.info(payload.message);
	}

	public debug(payload: LogPayload<unknown>): void {
		this._winston.debug(payload.message);
	}
}
