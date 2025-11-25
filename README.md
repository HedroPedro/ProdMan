# ProdMan

A simple stock manager built with Angular and Ruby on Rails

## 📖 About The Project

ProdMan is a complete stock management application with a modern Angular frontend and a Ruby on Rails backend API. It provides a full-featured interface for managing users, products, authentication, and inventory with real-time statistics and advanced filtering capabilities.

### Architecture

- **Frontend:** Angular 21 with Angular Material UI
- **Backend:** Ruby on Rails 8.1 as a stateless, token-based (JWT) API
- **Database:** MySQL 9.5
- **Containerization:** Docker & Docker Compose for both frontend and backend

## 🚀 Getting Started

Both frontend and backend are fully containerized with Docker Compose, making setup and development straightforward.

**Prerequisites:**

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/)

### Quick Start

1. **Clone the repository:**

   ```sh
   git clone https://github.com/HedroPedro/ProdMan.git
   cd ProdMan
   ```

2. **Start the Backend:**

   ```sh
   cd prodmanAPI
   docker-compose up --build
   ```

   The API will be available at: **`http://localhost:8080`**

3. **Start the Frontend (in a new terminal):**

   ```sh
   cd prodmanFront
   docker-compose up --build
   ```

   The frontend will be available at: **`http://localhost:4200`**

4. **Access the application:**

   Open your browser and navigate to `http://localhost:4200`

   - Create a new account or login with existing credentials
   - Start managing your products and users!

---

## 🎨 Frontend (Angular)

### Tech Stack

- **Framework:** Angular 21
- **UI Library:** Angular Material
- **Language:** TypeScript
- **Build Tool:** Angular CLI
- **Containerization:** Docker & Docker Compose

### ✨ Features

- **Modern UI:** Material Design components with responsive layout
- **Authentication:** Login and registration with JWT token management
- **Dashboard:** Real-time statistics for products and users
- **Product Management:** 
  - Full CRUD operations
  - Advanced filtering (stock levels, price ranges, dates)
  - Search functionality
  - Soft delete with restore capability
- **User Management:**
  - Full CRUD operations
  - User filtering by creation date
  - Soft delete with restore capability
- **Profile Management:** Edit your own profile from the topbar menu
- **URL Query Parameters:** Shareable filtered views via URL

### 🚀 Frontend Development Setup

1. **Navigate to frontend directory:**

   ```sh
   cd prodmanFront
   ```

2. **Build and start with Docker:**

   ```sh
   docker-compose up --build
   ```

3. **Access the application:**

   The frontend will be running at: **`http://localhost:4200`**

   **Note:** The frontend is configured to connect to the backend at `http://localhost:8080`. Make sure the backend is running first.

4. **Development features:**

   - Hot-reload enabled (changes are reflected automatically)
   - File watching with polling (works in Docker)
   - Development mode with source maps

5. **To stop the frontend:**

   Press `Ctrl+C` or run:

   ```sh
   docker-compose down
   ```

---

## 🛠️ Backend (Rails API)

### Tech Stack

  * **Framework:** Ruby on Rails 8.1.1
  * **Language:** Ruby 3.4.7
  * **Database:** MySQL 9.5.0
  * **API Type:** Stateless RESTful API
  * **Authentication:** JSON Web Tokens (JWT)
  * **Containerization:** Docker & Docker Compose

### ✨ Features

  * **JWT Authentication:** Secure user sign-up and login.
  * **Full CRUD:** Complete Create, Read, Update, and Delete operations for users and products.
  * **Soft Deletes:** Users and products are never truly deleted. They are marked with a `deleted_at` timestamp and can be restored, preserving data integrity.
  * **Error Handling:** Clear `404 Not Found` and `422/400` validation error messages.

### 🚀 Backend Development Setup

1.  **Navigate to backend directory:**

    ```sh
    cd prodmanAPI
    ```

2.  **Build the Docker images:**
    This command builds the custom Ruby image, installing all system dependencies (like `libmariadb-dev`) and Ruby gems.

    ```sh
    docker-compose build
    ```

3.  **Run the application:**
    This command will start the Rails `web` container and the `db` (MySQL) container. The `entrypoint.sh` script will automatically:

      * Wait for the database to be ready.
      * Run any pending database migrations (`db:migrate`).
      * Start the Rails server.

    ```sh
    docker-compose up
    ```

4.  **Access the API:**
    The API will be running and accessible at: **`http://localhost:8080`**

5.  **To stop the application:**
    Press `Ctrl+C` in the terminal where `docker-compose up` is running. To clean up the containers, run:

    ```sh
    docker-compose down
    ```

    > **Note:** To destroy the database volume and start completely fresh, run:
    > `docker-compose down -v`

### 🔑 API Endpoints

All protected routes require an `Authorization: Bearer <token>` header, which is obtained from the `/auth/login` endpoint.

#### Authentication (Public)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/signin` | Creates a new user (Signup). |
| `POST` | `/auth/login` | Authenticates a user and returns a JWT. |

#### Users (Protected)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/users` | Lists all active (not-deleted) users. |
| `GET` | `/users/{id}` | Gets a single user by ID. |
| `PATCH`| `/users/{id}` | Updates a user's details (e.g., name, password). |
| `DELETE`| `/users/{id}` | **Soft deletes** a user (sets `deleted_at`). |
| `PATCH` | `/users/{id}/restore`| Restores a soft-deleted user (sets `deleted_at` to `null`). |

#### Products (Protected)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/products` | Lists all active (not-deleted) products. Supports query parameters: `include_deleted`, `low_stock`, `out_of_stock`, `amount_available_lt`, `amount_available_gt`, `value_min`, `value_max`. |
| `POST` | `/products` | Creates a new product. |
| `GET` | `/products/{id}` | Gets a single product by ID. |
| `PATCH`| `/products/{id}` | Updates a product's details. |
| `DELETE`| `/products/{id}` | **Soft deletes** a product (sets `deleted_at`). |
| `PATCH` | `/products/{id}/restore`| Restores a soft-deleted product (sets `deleted_at` to `null`). |

#### Dashboard (Protected)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/dashboard/stats` | Returns aggregated statistics for products and users (total counts, stock levels, creation dates, etc.). |

#### Users (Protected - Query Parameters)

The `/users` endpoint supports the following query parameters:

- `include_deleted`: Include soft-deleted users (true/false)
- `created_after`: Filter users created after this date (YYYY-MM-DD)
- `created_before`: Filter users created before this date (YYYY-MM-DD)
- `created_last_days`: Filter users created in the last X days (integer)

#### Products (Protected - Query Parameters)

The `/products` endpoint supports the following query parameters:

- `include_deleted`: Include soft-deleted products (true/false)
- `low_stock`: Filter products with stock less than 10 (true/false)
- `out_of_stock`: Filter products with stock equal to 0 (true/false)
- `amount_available_lt`: Filter products with stock less than this value (integer)
- `amount_available_gt`: Filter products with stock greater than this value (integer)
- `value_min`: Filter products with value greater than or equal to this (decimal)
- `value_max`: Filter products with value less than or equal to this (decimal)

---

## 🌐 API Configuration

### Environment Variables

**Backend:**
- `DATABASE_HOST`: Database host (default: `db`)
- `DATABASE_USER`: Database user (default: `prodman_user`)
- `DATABASE_PASSWORD`: Database password (default: `prodman_password`)
- `DATABASE_NAME`: Database name (default: `prodman_api_development`)

**Frontend:**
- `NODE_ENV`: Node environment (default: `development`)
- `CHOKIDAR_USEPOLLING`: Enable file watching in Docker (default: `true`)
- `NG_CLI_ANALYTICS`: Disable Angular CLI analytics (default: `false`)

### API Base URL

The frontend is configured to connect to the backend at `http://localhost:8080`. This can be changed in:
- `prodmanFront/src/environments/environment.ts` (development)
- `prodmanFront/src/environments/environment.prod.ts` (production)

---

## 📝 Notes

- All error messages are in Portuguese (pt-BR)
- The application uses JWT tokens for authentication
- Soft deletes are used for both users and products to preserve data integrity
- The frontend supports URL query parameters for sharing filtered views
- Both frontend and backend support hot-reload in development mode
