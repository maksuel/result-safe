import type { SafeError, SafeResult, SafeSuccess } from "./@types";

function ensureError<E extends Error = Error>(error: unknown): SafeError<E> {
  if (error instanceof Error) {
    return { success: false, error: error as E };
  } else {
    return { success: false, error: new Error(String(error)) as E };
  }
}

export async function safePromise<T, E extends Error = Error>(
  promise: Promise<T>
): Promise<SafeResult<T, E>> {
  return promise
    .then((data: T): SafeSuccess<T> => ({ success: true, data }))
    .catch((error: unknown): SafeError<E> => ensureError<E>(error));
}

export function safeSync<T, A extends any[] = [], E extends Error = Error>(
  func: (...args: A) => T,
  ...args: A
): SafeResult<T, E> {
  try {
    const data = func(...args);
    return { success: true, data };
  } catch (error) {
    return ensureError<E>(error);
  }
}
