import type { SafeError, SafeFailure, SafeResult, SafeSuccess } from "./@types";

function ensureSafeFailure<T>(error: unknown): SafeFailure<T> {
  if (error instanceof Error) {
    return { success: false, error };
  } else {
    return { success: false, error: new Error(String(error)) };
  }
}

export async function safePromise<T>(
  promise: Promise<T>
): Promise<SafeResult<T>> {
  return promise
    .then((data: T): SafeSuccess<T> => ({ success: true, data }))
    .catch((error: unknown): SafeFailure<T> => ensureSafeFailure<T>(error));
}

export function safeSync<T, A extends any[] = []>(
  func: (...args: A) => T,
  ...args: A
): SafeResult<T> {
  try {
    const data = func(...args);
    return { success: true, data };
  } catch (error) {
    return ensureSafeFailure<T>(error);
  }
}

export type { SafeError, SafeFailure, SafeResult, SafeSuccess };
