import { describe, it, expect, assert } from "vitest";
import { safePromise, safeSync } from "../src";
import type { SafeError } from "../src/@types";

// --- Testes para safePromise ---
describe("safePromise", () => {
  it("should return success for a resolved promise", async () => {
    const data = "Hello, world!";
    const promise = Promise.resolve(data);
    const result = await safePromise(promise);

    expect(result.success).toBe(true);
    expect(result.data).toBe(data);
    // @ts-ignore - 'error' should not exist on success result
    expect(result.error).toBeUndefined();
  });

  it("should return failure for a rejected promise with an Error", async () => {
    const errorMessage = "Something went wrong!";
    const error = new Error(errorMessage);
    const promise = Promise.reject(error);
    const result = await safePromise(promise);

    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();

    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe(errorMessage);
      expect(result.error.name).toBe("Error");
    } else {
      assert.fail("Promise should have rejected, but it succeeded.");
    }
  });

  it("should return failure for a rejected promise with a non-Error value", async () => {
    const nonErrorValue = "Fatal error as string!";
    const promise = Promise.reject(nonErrorValue);
    const result = await safePromise(promise);

    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();

    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error); // Should be converted to an Error instance
      expect(result.error.message).toBe(String(nonErrorValue)); // Message should be the string representation
    } else {
      assert.fail("Promise should have rejected, but it succeeded.");
    }
  });

  it("should handle custom error types extending Error", async () => {
    class CustomError extends Error {
      code: string;
      constructor(message: string, code: string) {
        super(message);
        this.name = "CustomError";
        this.code = code;
      }
    }
    const customError = new CustomError(
      "Failed to fetch user",
      "USER_NOT_FOUND"
    );
    const promise = Promise.reject(customError);
    const result = await safePromise(promise);

    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(CustomError);
    expect((result.error as CustomError).code).toBe("USER_NOT_FOUND");
  });
});

// --- Testes para safeSync ---
describe("safeSync", () => {
  it("should return success for a function that returns a value", () => {
    const sum = (a: number, b: number) => a + b;
    const result = safeSync(sum, 5, 3);

    expect(result.success).toBe(true);
    expect(result.data).toBe(8);
    // @ts-ignore
    expect(result.error).toBeUndefined();
  });

  it("should return failure for a function that throws an Error", () => {
    const throwError = () => {
      throw new Error("Sync error!");
    };
    const result = safeSync(throwError);

    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();

    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("Sync error!");
    } else {
      assert.fail("Function should have error, but it succeeded.");
    }
  });

  it("should return failure for a function that throws a non-Error value", () => {
    const throwString = () => {
      throw "String error!";
    };
    const result = safeSync(throwString);

    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();

    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error); // Should be converted to an Error instance
      expect(result.error.message).toBe("String error!");
    } else {
      assert.fail("Function should have error, but it succeeded.");
    }
  });

  it("should handle custom error types thrown by synchronous functions", () => {
    class CustomSyncError extends Error {
      severity: "low" | "medium" | "high";
      constructor(message: string, severity: "low" | "medium" | "high") {
        super(message);
        this.name = "CustomSyncError";
        this.severity = severity;
      }
    }
    const throwCustomSyncError = () => {
      throw new CustomSyncError("Validation failed", "high");
    };
    const result = safeSync(throwCustomSyncError);

    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(CustomSyncError);
    expect((result.error as CustomSyncError).severity).toBe("high");
  });
});
