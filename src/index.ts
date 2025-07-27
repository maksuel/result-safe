import type { SafeError, SafeFailure, SafeResult, SafeSuccess } from "./@types";

function ensureSafeSuccess<T>(data: T): SafeSuccess<T> {
  return { success: true, data };
}

function ensureSafeFailure(error: unknown): SafeFailure<SafeError> {
  return {
    success: false,
    error: new Error("Safe Failure", { cause: error }),
  };
}

export async function safePromise<T>(
  promise: Promise<T>
): Promise<SafeResult<T>> {
  return promise.then(ensureSafeSuccess).catch(ensureSafeFailure);
}

export function safeSync<T, A extends any[] = []>(
  func: (...args: A) => T,
  ...args: A
): SafeResult<T> {
  try {
    const data = func(...args);
    return ensureSafeSuccess(data);
  } catch (error) {
    return ensureSafeFailure(error);
  }
}

export type { SafeError, SafeFailure, SafeResult, SafeSuccess };
