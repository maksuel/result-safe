export type SafeSuccess<T> = {
  success: true;
  data: T;
  error?: never;
};

export type SafeError<E> = {
  success: false;
  data?: never;
  error: E;
};

export type SafeResult<T, E extends Error = Error> =
  | SafeSuccess<T>
  | SafeError<E>;
