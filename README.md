# Sentry LDK

This repository is a library that wraps the [@sentry/browser](https://github.com/getsentry/sentry-javascript/tree/master/packages/browser) for the Loops.

## Usage

All logs except for `console.error` will add a breadcrumb automatically through the `Console` integration. When a `console.error`
is called it will then call the `captureException` method from sentry and climb up the call stack storing all of the logs/breadcrumbs
along the way. `Sentry.init()` should be called as soon as possible it is recommended that is added to loop start up logic.

Note: Since this is a wrapper library most methods in the sentry documentation still work as intended [Sentry Javascript Docs](https://docs.sentry.io/platforms/javascript/)
with a caveat loops run in custom runtime and not all features of sentry work (ex. integrations with things like the filesystem or history API)

```
// Loop Start up logic
import { ui, network } from '@oliveai/ldk';
import * as Sentry from 'sentry-loop-logging';

(async function main(): Promise<void> {
    Sentry.init({
      dsn: 'https://<dns url> ',
    });
    try {
      console.log('Starting Loop'); // Adds a breadcrumb with a level of log
      console.debug('Debug this'); // Adds a breadcrumb with a level of debug
      console.warn('Warning');  // Adds a breadcrumb with a level of warn
      const req: network.HTTPRequest = {
        url: 'https://google.com',
        body: 'super cool thing',
        method: 'POST',
      };
      const response = await network.httpRequest(req);
    } catch (err) {
      // if any call fails and throws an error it will fall here
      // and the console.error call will send the error to sentry
      console.error(err);
    }
})();
```

Above example in sentry would look something like this:

!["sentry example"](breadcrumbs.png)
