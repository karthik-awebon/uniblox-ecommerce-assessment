# Uniblox E-commerce Assessment

A full-stack Next.js 14 application demonstrating a robust E-commerce backend with an in-memory data store, automated discount system, and real-time admin analytics.

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Jest](https://img.shields.io/badge/jest-%23C21325.svg?style=for-the-badge&logo=jest&logoColor=white)
![Zod](https://img.shields.io/badge/zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

## Table of Contents

- [🚀 Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚙️ Setup & Installation](#️-setup--installation)
- [🧪 Running Tests](#-running-tests)
- [📖 API Documentation](#-api-documentation)
- [📂 Project Structure](#-project-structure)
- [📝 Design Decisions](#-design-decisions)

---

## 🚀 Key Features

- **Shopping Cart System:** Full support for adding items, updating quantities, and calculating totals.
- **"N-th Order" Rewards Engine:** Automatically generates a discount coupon for every n-th order (Configurable).
- **Real-time Admin Dashboard:** A split-screen view that updates admin stats instantly upon user checkout (Event-driven UI).
- **User Simulation:** Built-in "User Switcher" to simulate different customers and test the discount logic without clearing cookies.
- **Service Layer Architecture:** Business logic is isolated from the HTTP transport layer for better testability and separation of concerns.
- **Singleton In-Memory Store:** A thread-safe(ish) in-memory storage pattern that mimics a real database connection.
- **Strict Validation:** Runtime payload checking with Zod to ensure data integrity.
- **Test-Driven Development:** Comprehensive Unit and Integration test suite.

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) / Node.js
- **Language:** TypeScript
- **State Management:** React Query (Server State) & React Context (Client State)
- **Styling:** Tailwind CSS + clsx/tailwind-merge
- **Testing:** Jest & React Testing Library
- **Validation:** Zod

## ⚙️ Setup & Installation

1.  **Clone the repository**

    ```bash
    git clone <your-repo-url>
    cd uniblox-ecommerce
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Configure Environment**

    Copy the example env file to create your local config:

    ```bash
    cp .env.example .env.local
    ```

    - `NTH_ORDER_THRESHOLD`: Determines the winning order (Default: 5).
    - `DISCOUNT_PERCENTAGE`: The value of the generated coupon (Default: 10).

4.  **Run the Development Server**

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:3000`.

## 🧪 Running Tests

This project follows Test-Driven Development (TDD) principles. The test suite covers the Store, Services, and API Endpoints.

```bash
# Run all tests (Unit & Integration)
npm test

# Run tests with coverage report
npm run coverage
```

## 📮 Postman Collection

To make testing easier, a comprehensive Postman collection is included in this repository.

**Location:** [`docs/uniblox_api.postman_collection.json`](./docs/uniblox_api.postman_collection.json)

### How to Import & Use

1.  **Open Postman** and click the **Import** button (top left).
2.  Drag and drop the file `docs/uniblox_api.postman_collection.json`.
3.  The collection **"Uniblox E-commerce"** will appear in your sidebar.

### ⚙️ Configuration

The collection comes with pre-configured variables so you don't need to manually change URLs or Headers.

| Variable      | Default Value           | Description                                        |
| :------------ | :---------------------- | :------------------------------------------------- |
| `{{baseUrl}}` | `http://localhost:3000` | The API root URL.                                  |
| `{{userId}}`  | `user-123`              | The mocked user ID sent in the `x-user-id` header. |

**💡 Pro Tip:** To test the "User Switching" logic or the N-th order reward:

1.  Click on the collection name **"Uniblox E-commerce"**.
2.  Go to the **Variables** tab.
3.  Change the `currentValue` of `userId` (e.g., to `user-456`) and save.
4.  All subsequent requests will now simulate this new user!

## 📖 API Documentation

### 1. Add to Cart

- **Endpoint:** `POST /api/cart/add`
- **Headers:** `x-user-id: <string>` (Required)
- **Body:**

  ```json
  {
    "productId": "prod-1",
    "quantity": 2,
    "price": 100
  }
  ```

### 2. Checkout

- **Endpoint:** `POST /api/checkout`
- **Headers:** `x-user-id: <string>` (Required)
- **Body:**

  ```json
  {
    "discountCode": "WINNER-123456" // Optional
  }
  ```

- **Response:** Returns the Order details. If the order is the n-th order, a `generatedCoupon` field will be included.

### 3. Admin Stats

- **Endpoint:** `GET /api/admin/stats`
- **Response:**

  ```json
  {
    "totalItemsPurchased": 15,
    "totalRevenue": 1500,
    "totalDiscountsGiven": 150,
    "totalDiscountCodes": 3
  }
  ```

## 📂 Project Structure

```
src/
├── app/          # Next.js App Router (Routes & Layouts)
│ ├── api/      # API Route Handlers (Controllers)
│ └── page.tsx  # Split-screen Dashboard
├── components/   # React Components
│ ├── admin/    # Admin Stats & Charts
│ ├── shop/     # Product List & Cart
│ └── providers/ # Query & Theme Providers
├── services/     # Business Logic Layer (Cart, Discount, Admin)
├── lib/
│ ├── db/       # In-Memory Singleton Store
│ ├── validators/ # Zod Schemas
│ └── utils/    # Error Handling & Helpers
└── __tests__/    # Jest Test Suites
```

## 📝 Design Decisions

Please refer to [`DECISIONS.md`](./DECISIONS.md) for a detailed explanation of architectural choices, including:

- In-Memory Store vs. Database: Trade-offs for this assessment.
- Automated Discount Generation: Why we moved generation logic to the Checkout flow instead of a manual Admin API.
- Service Layer Pattern: Separating concerns for testability.
