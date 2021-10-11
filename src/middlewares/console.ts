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

import { LoggerMiddleware, LogType } from '..';

/**
 * Creates a new logger middleware, that outputs to console.
 *
 * @returns {LoggerMiddleware} The new middleware.
 */
export function consoleLogger(): LoggerMiddleware {
    return (type, args) => {
        let doLog = console.log;
        if (type !== LogType.Default) {
            if (type === LogType.Debug) {
                doLog = console.debug;
            } else if (type === LogType.Error) {
                doLog = console.error;
            } else if (type === LogType.Warn) {
                doLog = console.warn;
            } else if (type === LogType.Trace) {
                doLog = console.trace;
            } else if (type === LogType.Info) {
                doLog = console.info;
            }
        }

        doLog(...args);
    };
}
