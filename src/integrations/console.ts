import { getCurrentHub } from '@sentry/core';
import { Integration } from '@sentry/types';
import { fill, severityFromString } from '@sentry/utils';

export default class Console implements Integration {
  public static id = 'Console';

  public name: string = Console.id;

  public logLevels = ['debug', 'info', 'warn', 'error', 'log'];

  public setupOnce() {
    this.logLevels.forEach((level) => {
      // eslint-disable-next-line
      fill(console, level, createConsoleWrapper(level));
    });
  }
}

function createConsoleWrapper(level: string): (originalConsoleMethod: () => void) => void {
  return function consoleWrapper(originalConsoleMethod: () => void): () => void {
    const sentryLevel = severityFromString(level);

    // When calling console.error it will automatically call captureException
    // all other log levels will addBreadcrumb to this exception when it gets sent
    if (level === 'error') {
      // eslint-disable-next-line
      return function (this: typeof console, ...args: []): void {
        if (getCurrentHub().getIntegration(Console)) {
          getCurrentHub().captureException(new Error(args.join(' ')));
        }
        originalConsoleMethod.apply(this, args);
      };
    }

    // eslint-disable-next-line
    return function (this: typeof console, ...args: []): void {
      if (getCurrentHub().getIntegration(Console)) {
        getCurrentHub().addBreadcrumb(
          {
            category: 'console',
            level: sentryLevel,
            message: args.join(' '),
          },
          {
            input: [...args],
            level,
          }
        );
      }
      originalConsoleMethod.apply(this, args);
    };
  };
}
