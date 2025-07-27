export interface SafeError extends Error {}

export type SafeSuccess<T> = {
  success: true;
  data: T;
  error?: never;
};

export type SafeFailure<E> = {
  success: false;
  data?: never;
  error: E;
};

export type SafeResult<T, E = SafeError> = SafeSuccess<T> | SafeFailure<E>;
