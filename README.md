# result-safe

![NPM Version](https://img.shields.io/npm/v/result-safe?style=for-the-badge)
![NPM Downloads](https://img.shields.io/npm/dm/result-safe?style=for-the-badge)
![License](https://img.shields.io/npm/l/result-safe?style=for-the-badge)

A tiny, type-safe utility for handling synchronous and asynchronous operation results without throwing exceptions. Get consistent `SafeResult` objects with clear `success` or `error` states. It leverages `Error.cause` to preserve original errors while providing a standardized wrapper.

---

## ✨ Why `result-safe`?

Traditional JavaScript error handling with `try/catch` can lead to verbose and inconsistent code, especially when dealing with a mix of synchronous and asynchronous operations. `result-safe` provides a functional approach to error management, allowing you to:

- **Avoid nested `try/catch` blocks:** Keep your business logic clean and focused.
- **Achieve type safety:** Benefit from clear TypeScript types (`SafeResult<T>`) for both success data and error objects.
- **Standardize error handling:** All operation results, whether from Promises or direct function calls, return a consistent object. Every caught error is wrapped into a standard `Error` instance with the message "Safe Failure", preserving the original error in its `cause` property.
- **Improve readability:** Your code becomes easier to follow, as the success/error flow is explicitly defined by the `SafeResult` structure.

---

## 🚀 Installation

```bash
# Using npm
npm install result-safe

# Using yarn
yarn add result-safe

# Using pnpm
pnpm add result-safe
```

---

## 📖 Usage

`result-safe` provides two core functions: `safePromise` for asynchronous operations and `safeSync` for synchronous ones. Both return a `SafeResult` object.

### `SafeResult<T>` Type

The returned `SafeResult` object will always have a `success` boolean flag, and either `data` (if successful) or `error` (if an exception occurred).

The `error` property, in case of a `SafeFailure`, will always be an instance of `SafeError` (which extends `Error`). This `SafeError` instance will consistently have its `message` property set to `"Safe Failure"`. The **original error** that was thrown or rejected will be accessible via its `cause` property.

```typescript
// For successful operations
type SafeSuccess<T> = {
  success: true;
  data: T;
  error?: never; // 'error' is not present
};

// Your base error interface (extends built-in Error)
// The 'message' property of actual SafeError instances will always be "Safe Failure".
interface SafeError extends Error {}

// For failed operations
type SafeFailure<E> = {
  success: false;
  data?: never; // 'data' is not present
  error: E;
};

// The combined result type
type SafeResult<T, E = SafeError> = SafeSuccess<T> | SafeFailure<E>;
```

### `safePromise<T>(promise: Promise<T>): Promise<SafeResult<T>>`

Wraps an asynchronous operation (a Promise) to return a `SafeResult`. If the promise rejects with any value (an `Error` or a non-`Error` value), it will be automatically wrapped into a `SafeError` with "Safe Failure" as its message, and the original rejected value will be available via the `cause` property.

```typescript
import { safePromise } from "result-safe";

// Example 1: Successful Promise
async function fetchData() {
  const promise = Promise.resolve("Data fetched successfully!");
  const result = await safePromise(promise);

  if (result.success) {
    console.log("Success:", result.data); // Output: Success: Data fetched successfully!
  } else {
    // This branch should not be reached for a successful promise
    console.error("Unexpected error:", result.error.message);
  }
}
fetchData();

// Example 2: Rejected Promise with an Error object
async function fetchWithError() {
  const originalError = new Error("Network error!");
  const promise = Promise.reject(originalError);
  const result = await safePromise(promise);

  if (result.success) {
    console.log("Success:", result.data);
  } else {
    console.error("Wrapper Error Message:", result.error.message); // Output: Wrapper Error Message: Safe Failure
    console.error("Original Error (cause):", result.error.cause); // Output: Original Error (cause): Error: Network error!
    console.log(
      "Cause is instance of Error:",
      result.error.cause instanceof Error
    ); // Output: true
  }
}
fetchWithError();

// Example 3: Rejected Promise with a non-Error value (will be wrapped)
async function fetchWithNonError() {
  const nonErrorValue = "Something went wrong!"; // Rejecting with a string
  const promise = Promise.reject(nonErrorValue);
  const result = await safePromise(promise);

  if (result.success) {
    console.log("Success:", result.data);
  } else {
    console.error("Wrapper Error Message:", result.error.message); // Output: Wrapper Error Message: Safe Failure
    console.error("Original Error (cause):", result.error.cause); // Output: Original Error (cause): Something went wrong!
    console.log(
      "Cause is instance of Error:",
      result.error.cause instanceof Error
    ); // Output: false
  }
}
fetchWithNonError();

// Example 4: With a custom error type extending Error
class CustomAPIError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "CustomAPIError";
  }
}

async function fetchUser(id: number): Promise<string> {
  if (id === 0) {
    throw new CustomAPIError("User not found", 404);
  }
  return `User data for ID: ${id}`;
}

async function getUserData() {
  const result = await safePromise(fetchUser(0));

  if (result.success) {
    console.log("User:", result.data);
  } else {
    console.error("Wrapper Error Message:", result.error.message); // Output: Wrapper Error Message: Safe Failure

    // Check if the cause is your specific custom error type
    if (result.error.cause instanceof CustomAPIError) {
      console.error(
        "Original API Error:",
        result.error.cause.message,
        "Status:",
        result.error.cause.statusCode
      );
    } else {
      console.error("Original Unexpected Error (cause):", result.error.cause);
    }
  }
}
getUserData();
```

### `safeSync<T, A extends any[] = []>(func: (...args: A) => T, ...args: A): SafeResult<T>`

Wraps a synchronous function to return a `SafeResult`. If the function throws any value (an `Error` or a non-`Error` value), it will be automatically wrapped into a `SafeError` with "Safe Failure" as its message, and the original thrown value will be available via the `cause` property.

```typescript
import { safeSync } from "result-safe";

// Example 1: Successful synchronous function
function divide(a: number, b: number): number {
  return a / b;
}

const result1 = safeSync(divide, 10, 2);
if (result1.success) {
  console.log("Result of division:", result1.data); // Output: Result of division: 5
} else {
  // This branch should not be reached for a successful function
  console.error("Unexpected error:", result1.error.message);
}

// Example 2: Synchronous function throwing an Error object
function divideWithError(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Cannot divide by zero!");
  }
  return a / b;
}

const result2 = safeSync(divideWithError, 10, 0);
if (result2.success) {
  console.log("Result:", result2.data);
} else {
  console.error("Wrapper Error Message:", result2.error.message); // Output: Wrapper Error Message: Safe Failure
  console.error("Original Error (cause):", result2.error.cause); // Output: Original Error (cause): Error: Cannot divide by zero!
  console.log(
    "Cause is instance of Error:",
    result2.error.cause instanceof Error
  ); // Output: true
}

// Example 3: Synchronous function throwing a non-Error value (will be wrapped)
function parseNumber(input: string): number {
  if (isNaN(Number(input))) {
    throw "Invalid number format!"; // Throwing a string
  }
  return Number(input);
}

const result3 = safeSync(parseNumber, "abc");
if (result3.success) {
  console.log("Parsed:", result3.data);
} else {
  console.error("Wrapper Error Message:", result3.error.message); // Output: Wrapper Error Message: Safe Failure
  console.error("Original Error (cause):", result3.error.cause); // Output: Original Error (cause): Invalid number format!
  console.log(
    "Cause is instance of Error:",
    result3.error.cause instanceof Error
  ); // Output: false
}

// Example 4: With a custom error type extending Error
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateInput(input: string): string {
  if (input.length < 5) {
    throw new ValidationError("Input is too short", "username");
  }
  return "Input is valid!";
}

const result4 = safeSync(validateInput, "abc");

if (result4.success) {
  console.log("Validation:", result4.data);
} else {
  console.error("Wrapper Error Message:", result4.error.message); // Output: Wrapper Error Message: Safe Failure

  // Check if the cause is your specific custom error type
  if (result4.error.cause instanceof ValidationError) {
    console.error(
      "Original Validation Error:",
      result4.error.cause.message,
      "Field:",
      result4.error.cause.field
    );
  } else {
    console.error("Original Unexpected Error (cause):", result4.error.cause);
  }
}
```

### Extending `result-safe` Types for API Standardization

One of the powerful features of `result-safe` is that its core types (`SafeSuccess`, `SafeFailure`, `SafeResult`) are designed to be easily extended and customized. This makes them ideal for standardizing responses, whether for internal application logic or external API endpoints.

By extending these types, you can enforce specific structures for your success data and, critically, for your error payloads, ensuring consistency across your application or REST API.

Here's an improved example demonstrating how to create custom response types for a REST API, using `ResponseError` as the specific error structure you'd send over HTTP:

```typescript
import type { SafeFailure, SafeSuccess, SafeResult } from "result-safe";

/**
 * Defines a standardized error structure for API responses.
 * This is the JSON object you would send to the client on error.
 */
export type ResponseError = {
  code: string; // A machine-readable error code (e.g., "VALIDATION_FAILED", "NOT_FOUND")
  message: string; // A human-readable message
  statusCode: number; // The HTTP status code (e.g., 400, 404, 500)
  details?: unknown; // Optional: More specific error details (e.g., validation errors)
};

/**
 * Custom type for a successful API response.
 * It directly reuses SafeSuccess from 'result-safe'.
 */
export type ApiResponseSuccess<T> = SafeSuccess<T>;

/**
 * Custom type for a failed API response.
 * It specifies that the 'error' property of SafeFailure will contain a 'ResponseError'.
 */
export type ApiResponseFailure = SafeFailure<ResponseError>;

/**
 * The unified result type for all your API operations.
 * It combines ApiResponseSuccess for data and ApiResponseFailure for errors,
 * ensuring all API responses conform to a consistent pattern.
 */
export type ApiResponse<T> = SafeResult<T, ResponseError>;
```

---

## 🤝 Contributing

Contributions are always welcome\! If you find a bug, have a feature request, or want to improve the code, please feel free to open an issue or submit a pull request on the GitHub repository.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

---

## 🧑‍💻 Author

- **Maksuel Boni** - [GitHub Profile](https://github.com/maksuel)
