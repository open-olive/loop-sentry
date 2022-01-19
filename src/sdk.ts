import { Options } from '@sentry/types';
import * as Sentry from '@sentry/browser';
import { LDKTransport } from './transports';
import { Console } from './integrations';

export const defaultIntegrations = [new Console()];

// Wrapped init function from @sentry/browser package
export const init = (options: Options = {}): void => {
  const ldkOptions = options;
  if (ldkOptions.defaultIntegrations === undefined) {
    ldkOptions.defaultIntegrations = defaultIntegrations;
  }

  ldkOptions.transport = LDKTransport;
  Sentry.init(ldkOptions);
};
