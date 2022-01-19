import { network } from '@oliveai/ldk';
import { Transports } from '@sentry/browser';
import {
  Event as SentryEvent,
  Response as SentryResponse,
  SentryRequest,
  SentryRequestType,
} from '@sentry/types';
import { eventStatusFromHttpCode, SyncPromise } from '@sentry/utils';

// Custom transport to use the network aptitude over Fecth/XHR
// I tried polyfilling the fetch apit using the example from the ldk
// it seemed not work as intended.
// example: https://github.com/open-olive/loop-development-kit/tree/main/ldk/javascript/examples/fetch
export default class LDKTransport extends Transports.BaseTransport {
  // Needed to create custom handleResponse since the _handleResponse method from the BaseTransport class
  // required different Fetch | XHR typed response and network.HTTPResponse cannot be trivially casted to this type
  protected handleResponse({
    requestType,
    response,
    headers,
    resolve,
    reject,
  }: {
    requestType: SentryRequestType;
    response: network.HTTPResponse;
    headers: Record<string, string>;
    resolve: (value?: SentryResponse | PromiseLike<SentryResponse> | null | undefined) => void;
    reject: (reason?: unknown) => void;
  }): void {
    const status = eventStatusFromHttpCode(response.statusCode);

    // Using sentry's default ratelimiting implementation
    // should this be a problem later we can overwrite it for one of our own
    const limited = this._handleRateLimit(headers);
    if (limited) {
      console.warn(
        `Too many ${requestType} request, backing off until: ${this._disabledUntil(requestType)}`
      );
    }

    if (status === 'success') {
      resolve({ status });
      return;
    }
    reject(response);
  }

  // NOTE: DO NOT change the name of this method it is an internal abstract method
  // that is expected Transpors.BaseTransport class and is called in the sendEvent method of that class
  protected async _sendRequest(
    sentryRequest: SentryRequest,
    payload: SentryEvent
  ): Promise<SentryResponse> {
    if (this._isRateLimited(sentryRequest.type)) {
      this.recordLostEvent('ratelimit_backoff', sentryRequest.type);

      // eslint-disable-next-line
      return Promise.reject({
        event: payload,
        type: sentryRequest.type,
        reason: `Transport for ${sentryRequest.type} requests locked till ${this._disabledUntil(
          sentryRequest.type
        )} due to too many request.`,
        status: 429,
      });
    }

    // Request to be sent to Sentry
    const req: network.HTTPRequest = {
      url: sentryRequest.url,
      body: sentryRequest.body,
      method: 'POST',
    };

    // Adding all request to a buffer which will sync all of the promises and eventually push them to sentry
    // the buffer will drain when this class or sentry gets dropped (out of scope)
    return this._buffer.add(
      () =>
        new SyncPromise<SentryResponse>((resolve, reject) => {
          network
            .httpRequest(req)
            .then((response) => {
              // converting network aptitude headers to Record<string, string>
              const headers = {
                'x-sentry-rate-limits': response.headers['X-Sentry-Rate-Limits'][0],
                'retry-after': response.headers['Retry-After'][0],
              };

              this.handleResponse({
                requestType: sentryRequest.type,
                response,
                headers,
                resolve,
                reject,
              });
            })
            .catch(reject);
        })
    );
  }
}
