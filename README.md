# ProdMan

A simple stock manager done in Vue+Angular and Ruby On Rails

## 📖 About The Project

ProdMan is a complete backend API for a simple stock management application. It provides services for managing users, products, authentication, and inventory.

This backend is built with **Ruby on Rails 8.1** as a stateless, token-based (JWT) API. It uses a **MySQL 9.5** database and is fully containerized with **Docker** for easy setup and reliable deployment.

## 🚀 Frontend

*WRITE ABOUT FRONTEND*

-----

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

### 🚀 Getting Started (Docker)

The entire application is containerized with Docker Compose. This is the recommended way to run the project in a development environment.

**Prerequisites:**

  * [Docker](https://www.docker.com/products/docker-desktop/)
  * [Docker Compose](https://docs.docker.com/compose/)

**Installation:**

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/HedroPedro/ProdMan.git
    cd ProdMan/prodmanAPI
    ```

2.  **Ensure all Docker files are present:**
    You must have `Dockerfile`, `docker-compose.yml`, `entrypoint.sh`, and `.dockerignore` in the root of the project.

3.  **Build the Docker images:**
    This command builds the custom Ruby image, installing all system dependencies (like `libmariadb-dev`) and Ruby gems.

    ```sh
    docker-compose build
    ```

4.  **Run the application:**
    This command will start the Rails `web` container and the `db` (MySQL) container in the background. The `entrypoint.sh` script will automatically:

      * Wait for the database to be ready.
      * Run any pending database migrations (`db:migrate`).
      * Start the Rails server.

    ```sh
    docker-compose up
    ```

5.  **Access the API:**
    The API will be running and accessible at: **`http://localhost:8080`**

6.  **To stop the application:**
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
| `GET` | `/users/:id` | Gets a single user by ID. |
| `PATCH`| `/users/:id` | Updates a user's details (e.g., name, password). |
| `DELETE`| `/users/:id` | **Soft deletes** a user (sets `deleted_at`). |
| `PATCH` | `/users/:id/restore`| Restores a soft-deleted user (sets `deleted_at` to `null`). |

#### Products (Protected)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/products` | Lists all active (not-deleted) products. |
| `POST` | `/products` | Creates a new product. |
| `GET` | `/products/:id` | Gets a single product by ID. |
| `PATCH`| `/products/:id` | Updates a product's details. |
| `DELETE`| `/products/:id` | **Soft deletes** a product (sets `deleted_at`). |
| `PATCH` | `/products/:id/restore`| Restores a soft-deleted product (sets `deleted_at` to `null`). |