export interface SafeError extends Error {}

export type SafeSuccess<T> = {
  success: true;
  data: T;
  error?: never;
};

export type SafeFailure = {
  success: false;
  data?: never;
  error: SafeError;
};

export type SafeResult<T> = SafeSuccess<T> | SafeFailure;
