
<img width="2155" height="1363" alt="Zrzut ekranu 2026-01-06 125154" src="https://github.com/user-attachments/assets/3aea5291-1413-4f53-9152-81f60eef12d7" />

# Restaurant POS - Backend API

The RESTful API engine for the Restaurant Point of Sale system. Built with Node.js and Express, it handles business logic, database persistence, and secure third-party integrations.

## 🚀 Live Environment
- **Connected Frontend:** [https://restaurant.rafalsprengel.com/](https://restaurant.rafalsprengel.com/)

## 🔑 Core Functionalities
- **Secure Authentication**: Implementation of Passport.js with JWT strategies for stateless user sessions.
- **Payment Processing**: Full Stripe API integration for handling secure, server-side transactions.
- **Data Persistence**: Complex Mongoose schemas for managing products, categories, users, and orders.
- **Role-Based Access**: Middleware-driven protection for administrative routes and resources.
- **Error Tracking**: Custom middleware system that logs server errors to local files for production monitoring.
- **CORS & Security**: Configured for secure communication with the frontend application.

## 🛠 Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose (ODM)
- **Security**: Passport.js, JWT (JSON Web Tokens), Bcrypt (password hashing)
- **Payments**: Stripe SDK
- **Utilities**: Dotenv (environment management), Morgan (HTTP request logging)

## 📁 Project Structure
- `models/`: Mongoose schemas (User.js, Order.js, Product.js).
- `routes/`: Express router definitions for Auth, Products, and Payments.
- `middleware/`: Custom functions for auth validation and error logging.
- `logs/`: Directory for server-generated error log files.
- `server.js`: Main entry point and server configuration.

## 🚀 Setup & Installation
1. Clone the repository: `git clone https://github.com/RafalSprengel/restaurant-pos-backend`
2. Install dependencies: `npm install`
3. Configure environment: Create a `.env` file with the following keys:
   (Detailed example variables are provided in the .env.example file)
4. Start server: `npm start` (or `npm run dev` for development)

## 🔄 Status
This repository serves as the centralized backend service. It is architected to be consumed by the React-based frontend, ensuring a clear separation of concerns.
