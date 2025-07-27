import { describe, it, expect, assert } from "vitest";
import { safePromise, safeSync } from "../src";

/**
 * --- Testes para safePromise ---
 */
describe("safePromise", () => {
  it("should return success for a resolved promise", async () => {
    const data = "Hello, world!";
    const promise = Promise.resolve(data);
    const result = await safePromise(promise);

    expect(result.success).toBe(true);
    expect(result.data).toBe(data);
    expect(result.error).toBeUndefined();
  });

  it("should return failure for a rejected promise with an Error", async () => {
    const error = new Error("Something went wrong!");
    const promise = Promise.reject(error);
    const result = await safePromise(promise);

    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();

    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("Safe Failure");
      expect(result.error.name).toBe("Error");

      expect(result.error.cause).toBe(error); // The original error should be the cause
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
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("Safe Failure");
      expect(result.error.name).toBe("Error");

      expect(result.error.cause).toBe(nonErrorValue); // The original value should be the cause
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
    expect(result.data).toBeUndefined();

    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("Safe Failure");
      expect(result.error.name).toBe("Error");

      expect(result.error?.cause).toBeInstanceOf(CustomError);
      expect((result.error?.cause as CustomError).code).toBe("USER_NOT_FOUND");
    } else {
      assert.fail("Promise should have rejected, but it succeeded.");
    }
  });
});

/**
 * --- Testes para safeSync ---
 */
describe("safeSync", () => {
  it("should return success for a function that returns a value", () => {
    const sum = (a: number, b: number) => a + b;
    const result = safeSync(sum, 5, 3);

    expect(result.success).toBe(true);
    expect(result.data).toBe(8);
    expect(result.error).toBeUndefined();
  });

  it("should return failure for a function that throws an Error", () => {
    const errorMessage = "Sync error!";
    const throwError = () => {
      throw new Error(errorMessage);
    };
    const result = safeSync(throwError);

    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();

    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("Safe Failure");
      expect(result.error.name).toBe("Error");

      expect(result.error.cause).toBeInstanceOf(Error);
      expect((result.error.cause as Error).message).toBe(errorMessage);
    } else {
      assert.fail("Function should have error, but it succeeded.");
    }
  });

  it("should return failure for a function that throws a non-Error value", () => {
    const errorMessage = "String error!";
    const throwString = () => {
      throw errorMessage;
    };
    const result = safeSync(throwString);

    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();

    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("Safe Failure");
      expect(result.error.name).toBe("Error");

      expect(result.error.cause).toBe(errorMessage);
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
    expect(result.data).toBeUndefined();

    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("Safe Failure");
      expect(result.error.name).toBe("Error");

      expect(result.error.cause).toBeInstanceOf(CustomSyncError);
      expect((result.error.cause as CustomSyncError).severity).toBe("high");
    } else {
      assert.fail("Function should have error, but it succeeded.");
    }
  });
});
