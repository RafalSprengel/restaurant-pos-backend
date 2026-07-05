
<img width="2155" height="1363" alt="Zrzut ekranu 2026-01-06 125154" src="https://github.com/user-attachments/assets/3aea5291-1413-4f53-9152-81f60eef12d7" />

# 🍽️ Restaurant & Online Ordering System – Backend API

A scalable RESTful API built with **Node.js** and **Express.js**, powering a full restaurant ordering and management platform. It handles authentication, business logic, payments, reservations, messaging, and data persistence using **MongoDB**.

The API is designed to serve multiple client applications, including a customer-facing frontend and an administrative dashboard.

---

## 🧩 System Overview

The backend is structured as a **modular monolith** with clear separation of concerns:

- **Authentication & Authorization Layer**
- **Business Logic Layer** – Orders, Reservations, Messaging
- **Data Access Layer** – MongoDB via Mongoose
- **Integration Layer** – Stripe, Email services

---

## 🔐 Authentication & Authorization

- JWT-based authentication using **Passport.js**
- Role-based access control (**Customer**, **Staff**, **Admin**)
- Secure password hashing with **bcrypt**
- Protected routes with middleware-based authorization

---

## 🍽 Core Business Logic

### Orders System
- Create and manage customer orders
- Track order status lifecycle
- Retrieve user-specific order history

### Product & Category Management
- Full CRUD for menu products and categories
- API-driven structure for dynamic frontend rendering

### Table Reservation System
- Availability checking with conflict prevention
- Time-slot validation and reservation rules
- Support for configurable booking constraints

### Messaging System
- Contact form message handling
- Message storage and status tracking (read/unread)
- Optional email notifications via SMTP

---

## 💳 Payments

- Stripe API integration for secure payments
- Webhook handling for payment confirmation
- Server-side validation of transactions

---

## 🛠 Infrastructure & Security

- Centralized error handling and logging system
- CORS configuration for frontend communication
- Environment-based configuration management
- Request logging with Morgan
- Secure API structure with middleware layers

---

## 🗄 Data Layer

MongoDB database with **Mongoose ODM**. Schema-based data modeling for:

- Users
- Orders
- Products
- Reservations
- Messages

---

## 📁 Architecture

```
├── controllers/    # Business logic handlers
├── routes/         # API endpoints grouped by domain
├── middleware/      # Authentication, authorization, error handling
├── models/         # Database schemas
├── utils/          # Helper functions and services
└── config/         # Environment and service configuration
```

---

## 🚀 Purpose

This backend is designed as the core engine of a restaurant management ecosystem, providing secure, scalable, and modular API services for multiple frontend clients.

---

## 🧰 Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT, Passport.js, bcrypt |
| Payments | Stripe API |
| Email | SMTP |
| Logging | Morgan |

---

## 📄 License

This project is licensed under the MIT License.
