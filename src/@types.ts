export interface SafeError<T = unknown> extends Error {}

export type SafeSuccess<T> = {
  success: true;
  data: T;
  error?: never;
};

export type SafeFailure<T> = {
  success: false;
  data?: never;
  error: SafeError<T>;
};

export type SafeResult<T> = SafeSuccess<T> | SafeFailure<T>;
