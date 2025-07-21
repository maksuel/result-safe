# result-safe

![NPM Version](https://img.shields.io/npm/v/result-safe?style=for-the-badge)
![NPM Downloads](https://img.shields.io/npm/dm/result-safe?style=for-the-badge)
![License](https://img.shields.io/npm/l/result-safe?style=for-the-badge)

A tiny, type-safe utility for handling synchronous and asynchronous operation results without throwing exceptions. Get consistent `SafeResult` objects with clear `success` or `error` states.

---

## ✨ Why `result-safe`?

Traditional JavaScript error handling with `try/catch` can lead to verbose and inconsistent code, especially when dealing with a mix of synchronous and asynchronous operations. `result-safe` provides a functional approach to error management, allowing you to:

- **Avoid nested `try/catch` blocks:** Keep your business logic clean and focused.
- **Achieve type safety:** Benefit from clear TypeScript types (`SafeResult<T, E>`) for both success data and error objects.
- **Standardize error handling:** All operation results, whether from Promises or direct function calls, return a consistent object.
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

### `SafeResult<T, E>` Type

The returned `SafeResult` object will always have a `success` boolean flag, and either `data` (if successful) or `error` (if an exception occurred).

```typescript
type SafeSuccess<T> = {
  success: true;
  data: T;
  error?: never; // 'error' is not present
};

type SafeError<E> = {
  success: false;
  data?: never; // 'data' is not present
  error: E; // 'error' is always present
};

type SafeResult<T, E = Error> = SafeSuccess<T> | SafeError<E>;
```

### `safePromise(promise: Promise<T>): Promise<SafeResult<T, E>>`

Wraps an asynchronous operation (a Promise) to return a `SafeResult`.

```typescript
import { safePromise } from "result-safe";

// Example 1: Successful Promise
async function fetchData() {
  const promise = Promise.resolve("Data fetched successfully!");
  const result = await safePromise(promise);

  if (result.success) {
    console.log("Success:", result.data); // Output: Success: Data fetched successfully!
  } else {
    console.error("Error:", result.error.message);
  }
}
fetchData();

// Example 2: Rejected Promise
async function fetchWithError() {
  const promise = Promise.reject(new Error("Network error!"));
  const result = await safePromise(promise);

  if (result.success) {
    console.log("Success:", result.data);
  } else {
    console.error("Error:", result.error.message); // Output: Error: Network error!
  }
}
fetchWithError();

// Example 3: With a custom error type
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
  const result = await safePromise<string, CustomAPIError>(fetchUser(0));

  if (result.success) {
    console.log("User:", result.data);
  } else {
    console.error(
      "API Error:",
      result.error.message,
      "Status:",
      result.error.statusCode
    );
  }
}
getUserData();
```

### `safeSync<T, A extends any[], E = Error>(func: (...args: A) => T, ...args: A): SafeResult<T, E>`

Wraps a synchronous function to return a `SafeResult`.

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
  console.error("Error:", result1.error.message);
}

// Example 2: Synchronous function throwing an error
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
  console.error("Error:", result2.error.message); // Output: Error: Cannot divide by zero!
}

// Example 3: With a custom error type
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

const result3 = safeSync<string, [string], ValidationError>(
  validateInput,
  "abc"
);

if (result3.success) {
  console.log("Validation:", result3.data);
} else {
  console.error(
    "Validation Error:",
    result3.error.message,
    "Field:",
    result3.error.field
  );
}
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
