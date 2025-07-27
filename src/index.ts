import type { SafeError, SafeFailure, SafeResult, SafeSuccess } from "./@types";

function ensureSafeFailure(error: unknown): SafeFailure {
  return {
    success: false,
    error: new Error("Safe Failure", { cause: error }),
  };
}

export async function safePromise<T>(
  promise: Promise<T>
): Promise<SafeResult<T>> {
  return promise
    .then((data: T): SafeSuccess<T> => ({ success: true, data }))
    .catch((error: unknown): SafeFailure => ensureSafeFailure(error));
}

export function safeSync<T, A extends any[] = []>(
  func: (...args: A) => T,
  ...args: A
): SafeResult<T> {
  try {
    const data = func(...args);
    return { success: true, data };
  } catch (error) {
    return ensureSafeFailure(error);
  }
}

export type { SafeError, SafeFailure, SafeResult, SafeSuccess };
