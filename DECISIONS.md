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
