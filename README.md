[![npm](https://img.shields.io/npm/v/egomobile/log.svg)](https://www.npmjs.com/package/egomobile/log)
[![last build](https://img.shields.io/github/workflow/status/egomobile/js-log/Publish)](https://github.com/egomobile/js-log/actions?query=workflow%3APublish)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/egomobile/js-log/pulls)

# js-log

> A logging framework written for [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) and in [TypeScript](https://www.typescriptlang.org/).

## Install

Execute the following command from your project folder, where your `package.json` file is stored:

```bash
npm install --save @egomobile/log
```

## Usage

```typescript
import log, { LogType } from "@egomobile/log";

// 'log' uses console by default
log("foo"); // default: debug
log.debug("foo"); // debug
log.error("foo"); // error
log.warn("foo"); // warning
log.info("foo"); // information
log.trace("foo"); // trace

// add one or more custom middlewares
log.use((type: LogType, args: any[]) => {
  // your code
});
```

## Documentation

The API documentation can be found [here](https://egomobile.github.io/js-log/).
