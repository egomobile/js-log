// This file is part of the @egomobile/js-log distribution.
// Copyright (c) Next.e.GO Mobile SE, Aachen, Germany (https://e-go-mobile.com/)
//
// @egomobile/js-log is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as
// published by the Free Software Foundation, version 3.
//
// @egomobile/js-log is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

/**
 * A logger.
 */
export interface ILogger extends LogAction {
    /**
     * Write DEBUG message.
     */
    debug: LogAction;
    /**
     * Write ERROR message.
     */
    error: LogAction;
    /**
     * Write INFO message.
     */
    info: LogAction;
    /**
     * Write TRACE message.
     */
    trace: LogAction;
    /**
     * Write WARNING message.
     */
    warn: LogAction;
}

/**
 * A logger action.
 *
 * @param {any[]} [args] One or more argument / data to log.
 */
export type LogAction = (...args: any[]) => void;

/**
 * Creates a new logger instance.
 *
 * @returns {ILogger} The new instance.
 */
export function createLogger(): ILogger {
    // default
    const newLogger: ILogger = function (...args: any[]) {
        console.log(...args);
    } as any;

    // debug
    newLogger.debug = function (...args: any[]) {
        console.debug(...args);
    };

    newLogger.error = function (...args: any[]) {
        console.error(...args);
    };

    newLogger.info = function (...args: any[]) {
        console.info(...args);
    };

    // trace
    newLogger.trace = function (...args: any[]) {
        console.trace(...args);
    };

    // warn
    newLogger.warn = function (...args: any[]) {
        console.warn(...args);
    };

    return newLogger;
}
