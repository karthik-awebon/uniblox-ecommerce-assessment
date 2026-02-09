# Architectural Decisions

This document records the key architectural decisions made during the development of the Uniblox E-commerce Assessment project. Each decision includes the context, options considered, the final choice, and the reasoning behind it.

## Table of Contents

1.  [Architecture: Service Layer Pattern](#1-architecture-service-layer-pattern)
2.  [State Management: Singleton In-Memory Store](#2-state-management-singleton-in-memory-store)
3.  [Automated vs. Manual Discount Generation](#3-automated-vs-manual-discount-generation)
4.  [Discount Validation: Explicit State Separation](#4-discount-validation-explicit-state-separation)
5.  [Linting as Architecture Guardrails](#5-linting-as-architecture-guardrails)

---

## 1. Architecture: Service Layer Pattern

**Status:** Decided

**Context**
We need to handle business logic (e.g., discount rules, cart management) separate from the HTTP transport layer to ensure the code is testable, modular, and independent of the framework.

**Options Considered**

- **Option A: Logic in Route Handlers**
  Write the business logic (database calls, validation) directly inside the Next.js `POST`/`GET` route functions.
- **Option B: Service Layer Pattern**
  Create dedicated classes/modules (e.g., `CartService`, `OrderService`) that handle pure business logic, while Route Handlers are restricted to managing request parsing and response formatting.

**Choice**

> **Option B (Service Layer Pattern)**

**Why**

- **Testability:** We can write unit tests for `CartService` in isolation without needing to mock HTTP requests, headers, or the Next.js request context.
- **Separation of Concerns:** The business logic remains framework-agnostic. If we switch interfaces later (e.g., from REST to GraphQL or Server Actions), the core logic remains untouched.
- **Clarity:** It keeps the Route Handlers clean and readable, focusing them solely on input validation and returning the correct HTTP status codes.

---

## 2. State Management: Singleton In-Memory Store

**Status:** Decided

**Context**
The requirement specifies "no database needed," but Next.js App Router runs in a serverless-like environment where variable scope can be tricky. We need a reliable way to persist data across different API requests during runtime.

**Options Considered**

- **Option A: Global Variables in Module Scope:**
  Simple `let orders = []` exported from a file.
- **Option B: Singleton Class Instance:**
  A class that instantiates only once and is exported to manage the state.

**Choice**

> **Option B (Singleton Class Instance)**

**Why**

- **Structure:** It mimics a real database connection pattern.
- **Safety:** It prevents multiple instances of the store from being created accidentally during hot-reloads (in development) or specific server runtimes.
- **Encapsulation:** It prevents direct mutation of the data array from random parts of the app; data can only be modified via defined methods (e.g., `store.addOrder()`).

---

## 3. Automated vs. Manual Discount Generation

**Status:** Decided

**Context**
The requirements mentioned an Admin API to "Generate a discount code if the condition is satisfied." However, the business logic dictates that "Every nth order gets a coupon code."

**Options Considered**

- **Option A (Literal Interpretation):** Create a `POST /api/admin/generate-discount` endpoint. The Admin must manually call this to check the order count and generate a code.
- **Option B (Event-Driven/Automated):** Move the generation logic into the `Checkout`. When the Nth order is placed, the system _automatically_ generates and returns the code in the response.

**Choice**

> **Option B (Automated)**

**Why**

1.  **User Experience:** Customers expect instant rewards. Waiting for an admin action to receive a coupon is a poor experience.
2.  **Atomicity:** Generating the code within the Checkout transaction ensures that the "Nth Order" state and the "Reward Issued" state remain perfectly synchronized.
3.  **Efficiency:** It removes the need for polling or manual intervention.

---

## 4. Discount Validation: Explicit State Separation

**Status:** Decided

**Context**
We need to ensure that a discount code is valid not just syntactically, but contextually (e.g., has it been used? Is the order valid?).

**Options Considered**

- **Option A: Boolean Flag on Order:** Simply marking an order as `isDiscounted: true`.
- **Option B: Dedicated Discount Object:** Storing generated discount codes in a separate Set or Map to track their lifecycle (Active, Used, Expired).

**Choice**

> **Option B (Dedicated Discount Object)**

**Why**

- **Scalability:** Allows for future features like "expiry dates" or "one-time use" logic.
- **Reporting:** Makes the "Admin API" requirement (counting total discounts given) much easier and more accurate (O(1) lookup vs iterating through all orders).
- **Validation:** We can verify if a code exists before applying it to the cart total, mimicking a real database query.

---

## 5. Linting as Architecture Guardrails

**Status:** Decided

**Context**
In large teams, architectural patterns (like Service Layers) often degrade when developers take shortcuts.

**Choice**

> I configured `no-restricted-imports` to prevent direct access to the Data Layer from the API Layer.

**Why**

- This enforces the Separation of Concerns pattern at the build level, rather than relying solely on code reviews.
