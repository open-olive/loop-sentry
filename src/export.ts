// Possible necessary exports
// using this to not limit us in the future if we need to start
// setting other information like user/context/scopes/etc

export {
  Breadcrumb,
  BreadcrumbHint,
  Request,
  SdkInfo,
  Event,
  EventHint,
  EventStatus,
  Exception,
  Response,
  SeverityLevel,
  StackFrame,
  Stacktrace,
  Thread,
  User,
  Options,
} from '@sentry/types';

export {
  addGlobalEventProcessor,
  addBreadcrumb,
  captureException,
  captureEvent,
  captureMessage,
  configureScope,
  getHubFromCarrier,
  Hub,
  makeMain,
  Scope,
  startTransaction,
  SDK_VERSION,
} from '@sentry/core';

export {
  BrowserOptions,
  BrowserClient,
  setUser,
  setContext,
  setExtra,
  setExtras,
  setTag,
  setTags,
  withScope,
  forceLoad,
  lastEventId,
  onLoad,
  showReportDialog,
  flush,
  close,
  wrap,
  injectReportDialog,
  ReportDialogOptions,
  eventFromException,
  eventFromMessage,
} from '@sentry/browser';
