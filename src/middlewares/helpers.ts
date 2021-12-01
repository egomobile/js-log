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

import type { AsyncLoggerMiddleware, LoggerFilter, LoggerMiddleware, NextFunction } from '..';

/**
 * Creates a middleware, that tries to execute all loggers
 * in a chain, using a 'next function'.
 *
 * @example
 * ```
 * import log, { AsyncLoggerMiddleware, useAll } from "@egomobile/log"
 *
 * const myFirstMiddleware: AsyncLoggerMiddleware = (type, args, next) => {
 *    try {
 *      // do your stuff here
 *
 *      next()  // tell the iteration, that we are finished here
 *    } catch (error) {
 *      next(error)  // you can explicitly tell the iteration
 *                   // that some failed here and we need to execute
 *                   // the upcoming fallback
 *    }
 * }
 *
 * // is called after 'myFirstMiddleware' has
 * // called 'next()' without errors
 * const mySecondMiddleware: AsyncLoggerMiddleware = (type, args, next) => {
 *   // do your stuff here
 *   //
 *   // if something fails here and throws an error
 *   // it is the same thing as calling 'next(error)'
 *
 *   next()  // tell, that we are OK here
 * }
 *
 * // is called after 'mySecondMiddleware' has
 * // called 'next()' without errors
 * const myThirdMiddleware: AsyncLoggerMiddleware = (type, args, done) => {
 *   // do your stuff here
 *
 *   done()
 * }
 *
 * log.use(useAll(myFirstMiddleware, mySecondMiddleware, myThirdMiddleware))
 *
 * log('foo')
 * ```
 *
 * @param {AsyncLoggerMiddleware} firstLogger The main logger.
 * @param {AsyncLoggerMiddleware[]} [moreLoggers] An optional list of more loggers.
 *
 * @returns {LoggerMiddleware} The new middleware.
 */
export function useAll(firstLogger: AsyncLoggerMiddleware, ...moreLoggers: AsyncLoggerMiddleware[]): LoggerMiddleware {
    const allMiddlewares = [firstLogger, ...moreLoggers];

    if (allMiddlewares.some(mw => typeof mw !== 'function')) {
        throw new TypeError('All arguments must be of type function');
    }

    return (type, args) => {
        let i = -1;

        const next: NextFunction = (error?) => {
            if (error) {
                return;  // error, we have to leave here
            }

            const currentMiddleware = allMiddlewares[++i];
            if (currentMiddleware) {
                currentMiddleware(type, args, next);
            }
        };

        next();
    };
}

/**
 * Creates a middleware, that tries to execute a main logger
 * and uses the first working fallback middleware, if it fails,
 * using a 'next function'.
 *
 * @example
 * ```
 * import log, { AsyncLoggerMiddleware, useFallback } from "@egomobile/log"
 *
 * const myFirstMiddleware: AsyncLoggerMiddleware = (type, args, done) => {
 *    try {
 *      // do your stuff here
 *
 *      done()  // tell the iteration, that we are finished here
 *    } catch (error) {
 *      done(error)  // you can explicitly tell the iteration
 *                   // that some failed here and we need to execute
 *                   // the upcoming fallback
 *    }
 * }
 *
 * // is only called, if 'myFirstMiddleware' fails
 * const mySecondMiddleware: AsyncLoggerMiddleware = (type, args, done) => {
 *   // do your stuff here
 *   //
 *   // if something fails here and throws an error
 *   // it is the same thing as calling 'done(error)'
 *
 *   done()  // tell, that we are OK here
 * }
 *
 * // is only called, if 'mySecondMiddleware' fails
 * const myThirdMiddleware: AsyncLoggerMiddleware = (type, args, done) => {
 *   // do your stuff here
 *
 *   done()
 * }
 *
 * log.use(useFallback(myFirstMiddleware, mySecondMiddleware, myThirdMiddleware))
 *
 * log('foo')
 * ```
 *
 * @param {AsyncLoggerMiddleware} mainLogger The main logger.
 * @param {AsyncLoggerMiddleware} firstFallback The first, required fallback.
 * @param {AsyncLoggerMiddleware[]} [moreFallbacks] An optional list of more fallbacks.
 *
 * @returns {LoggerMiddleware} The new middleware.
 */
export function useFallback(mainLogger: AsyncLoggerMiddleware, firstFallback: AsyncLoggerMiddleware, ...moreFallbacks: AsyncLoggerMiddleware[]): LoggerMiddleware {
    const allMiddlewares = [mainLogger, firstFallback, ...moreFallbacks];

    if (allMiddlewares.some(mw => typeof mw !== 'function')) {
        throw new TypeError('All arguments must be of type function');
    }

    return (type, args) => {
        let i = 0;
        let currentMiddleware: AsyncLoggerMiddleware | undefined = allMiddlewares[i];

        const next: NextFunction = (error?) => {
            if (!error) {
                return;  // nothing more to do here
            }

            currentMiddleware = allMiddlewares[++i];
            if (currentMiddleware!) {
                executeCurrentMiddleware();
            }
        };

        const executeCurrentMiddleware = () => {
            try {
                currentMiddleware!(type, args, next);
            } catch (ex) {
                next(ex);  // error => try next
            }
        };

        executeCurrentMiddleware();
    };
}

/**
 * Creates a middleware, wraps into a list of one or more filters
 * and executes it only, if all filters match all criteria (return
 * a truely value).
 *
 * @example
 * ```
 * import log, { consoleLogger, LoggerFilter, LogType, useFilter } from "@egomobile/log"
 *
 * const mySpecialFilter: LoggerFilter = (type, args) => {
 *   // return a truely value to indicate
 *   return type >= LogType.Debug &&
 *     process.env.NODE_ENV !== 'production'
 * }
 *
 * log.reset()
 *
 * // use console logger only with
 * // 'mySpecialFilter' instead
 * log.use( useFilter(consoleLogger(), mySpecialFilter) )
 *
 * log('foo')
 * ```
 *
 * @param {args} middleware The middleware to wrap.
 * @param {LoggerFilter} firstFilter The first filter.
 * @param {LoggerFilter[]} [moreFilters] An optional list of more filters.
 *
 * @returns {LoggerMiddleware} The new middleware.
 */
export function useFilter(middleware: LoggerMiddleware, firstFilter: LoggerFilter, ...moreFilters: LoggerFilter[]): LoggerMiddleware {
    if (typeof middleware !== 'function') {
        throw new TypeError('middleware must be of type function');
    }

    const allFilters = [firstFilter, ...moreFilters];

    if (allFilters.some(f => typeof f !== 'function')) {
        throw new TypeError('All filters must be of type function');
    }

    return (type, args) => {
        if (allFilters.every(f => f(type, args))) {
            middleware(type, args);
        }
    };
}
