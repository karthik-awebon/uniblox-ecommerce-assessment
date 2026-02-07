## 1. Architecture: Service Layer Pattern

**Context**
We need to handle business logic (e.g., discount rules, cart management) separate from the HTTP transport layer to ensure the code is testable, modular, and independent of the framework.

**Options Considered**

- **Option A: Logic in Route Handlers**
  Write the business logic (database calls, validation) directly inside the Next.js `POST`/`GET` route functions.
- **Option B: Service Layer Pattern**
  Create dedicated classes/modules (e.g., `CartService`, `OrderService`) that handle pure business logic, while Route Handlers are restricted to managing request parsing and response formatting.

**Choice**

- **Option B (Service Layer Pattern)**

**Why**

- **Testability:** We can write unit tests for `CartService` in isolation without needing to mock HTTP requests, headers, or the Next.js request context.
- **Separation of Concerns:** The business logic remains framework-agnostic. If we switch interfaces later (e.g., from REST to GraphQL or Server Actions), the core logic remains untouched.
- **Clarity:** It keeps the Route Handlers clean and readable, focusing them solely on input validation and returning the correct HTTP status codes.

## 2. State Management: Singleton In-Memory Store

**Context**
The requirement specifies "no database needed," but Next.js App Router runs in a serverless-like environment where variable scope can be tricky. We need a reliable way to persist data across different API requests during runtime.

**Options Considered**

- **Option A: Global Variables in Module Scope:**
  Simple let orders = [] exported from a file.
- **Option B: Singleton Class Instance:**
  A class that instantiates only once and is exported to manage the state.

**Choice**

- **Option B (Singleton Class Instance)**

**Why**

- **Structure:** It mimics a real database connection pattern.
- **Safety:** It prevents multiple instances of the store from being created accidentally during hot-reloads (in development) or specific server runtimes.
- **Encapsulation:** It prevents direct mutation of the data array from random parts of the app; data can only be modified via defined methods (e.g., store.addOrder()).
