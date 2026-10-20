# TaskFlow – Task Manager

TaskFlow is a full-stack task management web application that helps users organize, track, and manage their daily tasks through a simple and user-friendly interface.

## Features

- **User Authentication** – Register and log in securely.
- **Task Management** – Create, view, edit, complete, and delete tasks.
- **Task Search** – Find tasks quickly.
- **Filtering and Sorting** – Organize tasks based on their status and order.
- **Dashboard Statistics** – View total, completed, and pending tasks.
- **User-Specific Tasks** – Each user can access only their own tasks.
- **Database Persistence** – Store user accounts and tasks in MongoDB.
- **Responsive Interface** – A clean interface for managing daily work.

## Tech Stack

**Frontend**
- React
- Vite
- CSS

**Backend**
- Node.js
- Express.js
- REST API

**Database**
- MongoDB Atlas
- Mongoose

**Authentication and Security**
- JSON Web Tokens (JWT)
- bcryptjs for password hashing
- Protected API routes

**Version Control**
- Git
- GitHub

## Project Structure

```text
task-manager/
├── public/
├── server/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Task.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── tasks.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB Atlas account or another configured MongoDB database
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/jeevitharamesh1223-coder/Syntecxhub_Task-manager.git
cd Syntecxhub_Task-manager
```

### 2. Install Frontend Dependencies

From the project root directory, run:

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server` directory.

Add your own configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret
JWT_EXPIRES_IN=your_configured_expiry
```

Replace the example values with your actual configuration. Never commit your `.env` file
