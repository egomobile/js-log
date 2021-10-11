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
 *
 * @example
 * ```
 * import log, { LogType } from "@egomobile/log"
 *
 * // filter: no debug or trace
 * log.filter((type: LogType, args: any[]) => type <= LogType.Info)
 *
 * // add one or more custom middlewares
 * log.use((type: LogType, args: any[]) => {
 *   // your code
 * })
 *
 * // 'log' uses console by default
 * log("foo") // default: debug
 * log.debug("foo") // debug
 * log.error("foo") // error
 * log.warn("foo") // warning
 * log.info("foo") // information
 * log.trace("foo") // trace
 * ```
 */
export interface ILogger extends LogAction {
    /**
     * Write DEBUG message.
     *
     * @example
     * ```
     * import log from '@egomobile/log'
     *
     * log.debug('foo')
     * ```
     */
    debug: LogAction;
    /**
     * Write ERROR message.
     *
     * @example
     * ```
     * import log from '@egomobile/log'
     *
     * log.error('foo')
     * ```
     */
    error: LogAction;
    /**
     * Sets a new log filter.
     *
     * @example
     * ```
     * import log, { LogType } from '@egomobile/log'
     *
     * log.filter((type: LogType, args: any[]) => {
     *   // no debug or trace
     *   return type <= LogType.Info
     * })
     * ```
     *
     * @param {LoggerFilter|undefined|null} newFilter The new filter.
     *
     * @returns {this}
     *
     * @throws LoggerMiddleware Argument is not (null) and not (undefined) and no function.
     */
    filter(newFilter: LoggerFilter | undefined | null): this;
    /**
     * Write INFO message.
     *
     * @example
     * ```
     * import log from '@egomobile/log'
     *
     * log.info('foo')
     * ```
     */
    info: LogAction;
    /**
     * Resets that instance.
     *
     * @example
     * ```
     * import log, { LogType } from '@egomobile/log'
     *
     * log.reset().use((type: LogType, args: any[]) => {
     *   // your code here
     * })
     * ```
     *
     * @returns {this}
     */
    reset(): this;
    /**
     * Write TRACE message.
     *
     * @example
     * ```
     * import log from '@egomobile/log'
     *
     * log.trace('foo')
     * ```
     */
    trace: LogAction;
    /**
     * Adds one or more middlewares.
     *
     * @example
     * ```
     * import log, { LogType } from '@egomobile/log'
     *
     * log.use((type: LogType, args: any[]) => {
     *   // your code here
     * })
     * ```
     *
     * @param {LoggerMiddleware[]} [middlewares] One or more middlewares to add.
     *
     * @returns {this}
     *
     * @throws LoggerMiddleware At least one element is not a function.
     */
    use(...middlewares: LoggerMiddleware[]): this;
    /**
     * Write WARNING message.
     *
     * @example
     * ```
     * import log from '@egomobile/log'
     *
     * log.warn('foo')
     * ```
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
 *
 * @returns {any} If falsy nothing is logged.
 */
export type LoggerFilter = (type: LogType, args: any[]) => any;

/**
 * A logger middleware.
 *
 * @param {LogType} type The type.
 * @param {any[]} args The submitted arguments.
 */
export type LoggerMiddleware = (type: LogType, args: any[]) => void;

const defaultFilter: LoggerFilter = () => true;

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
 * @example
 * ```
 * import { consoleLogger, createLogger, LogType } from "@egomobile/log"
 *
 * // create custom logger
 * const myLogger = createLogger()
 *
 * // add build-in middleware
 * myLogger.use(consoleLogger())
 *
 * // add one or more custom middlewares
 * // for your custom logger
 * myLogger.use((type: LogType, args: any[]) => {
 *   // your code
 * })
 *
 * // start logging
 * myLogger("foo")
 * myLogger.error("bar")
 * ```
 *
 * @returns {ILogger} The new instance.
 */
export function createLogger(): ILogger {
    let filter = defaultFilter;
    let middlewares: LoggerMiddleware[] = [];
    const doLog: LoggerMiddleware = (type, args) => {
        try {
            if (filter(type, args)) {
                middlewares.forEach((mw) => {
                    try {
                        mw(type, args);
                    } catch { /* ignore */ }
                });
            }
        } catch { /* ignore */ }
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

    newLogger.filter = (newFilter) => {
        if (typeof newFilter === 'undefined' && newFilter === null) {
            filter = defaultFilter;  // reset
        } else {
            if (typeof newFilter !== 'function') {
                throw new TypeError('newFilter must be function');
            }

            filter = newFilter;
        }

        return newLogger;
    };

    newLogger.reset = () => {
        filter = defaultFilter;
        middlewares = [];

        return newLogger;
    };

    newLogger.use = (...middlewaresToAdd: LoggerMiddleware[]) => {
        if (middlewaresToAdd.some(mw => typeof mw !== 'function')) {
            throw new TypeError('All items in middleware must be functions');
        }

        // create copies of middleware functions
        // binded to logger instance
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
