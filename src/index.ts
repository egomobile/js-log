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
     * Resets that instance.
     */
    reset(): this;
    /**
     * Write TRACE message.
     */
    trace: LogAction;
    /**
     * Adds one or more middlewares.
     *
     * @param {LoggerMiddleware[]} [middlewares] One or more middlewares to add.
     */
    use(...middlewares: LoggerMiddleware[]): this;
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
 * A logger middleware.
 *
 * @param {LogType} type The type.
 * @param {any[]} args The submitted arguments.
 */
export type LoggerMiddleware = (type: LogType, args: any[]) => void;

/**
 * A log type.
 */
export enum LogType {
    /**
     * Default
     */
    Default = 0,
    /**
     * Error
     */
    Error,
    /**
     * Warning
     */
    Warn,
    /**
     * Information
     */
    Info,
    /**
     * Debug
     */
    Debug,
    /**
     * Trace
     */
    Trace,
}

/**
 * Creates a new logger instance.
 *
 * @returns {ILogger} The new instance.
 */
export function createLogger(): ILogger {
    let middlewares: LoggerMiddleware[] = [];
    const doLog: LoggerMiddleware = (type, args) => {
        middlewares.forEach((mw) => {
            try {
                mw(type, args);
            } catch { }
        });
    };

    // default
    const newLogger: ILogger = function (...args: any[]) {
        doLog(LogType.Default, args);
    } as any;

    // debug
    newLogger.debug = function (...args: any[]) {
        doLog(LogType.Debug, args);
    };

    newLogger.error = function (...args: any[]) {
        doLog(LogType.Error, args);
    };

    newLogger.info = function (...args: any[]) {
        doLog(LogType.Info, args);
    };

    // trace
    newLogger.trace = function (...args: any[]) {
        doLog(LogType.Trace, args);
    };

    // warn
    newLogger.warn = function (...args: any[]) {
        doLog(LogType.Warn, args);
    };

    newLogger.reset = () => {
        middlewares = [];

        return newLogger;
    };

    newLogger.use = (...middlewaresToAdd: LoggerMiddleware[]) => {
        if (middlewaresToAdd.some(mw => typeof mw !== 'function')) {
            throw new TypeError('All items in middleware must be functions');
        }

        middlewares.push(...middlewaresToAdd.map(mw => mw.bind(newLogger)));

        return newLogger;
    };

    return newLogger;
}

/**
 * The global, default logger.
 */
export const log = createLogger();

// setup default middlewares
log.use(require('./middlewares/console').consoleLogger());

export default log;

export * from './middlewares';
