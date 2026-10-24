# 🚀 TaskFlow – Full Stack Task Manager

A modern full-stack **Task Manager Web Application** built with **React, Node.js, Express, MongoDB Atlas, and JWT Authentication**. Users can create an account, log in securely, and manage their personal tasks online.

## 🌐 Live Demo

**Live Website:** https://taskflow-frontend-i3ky.onrender.com

**Backend API:** https://taskflow-api-vry6.onrender.com

## 📌 Features

- User Registration and Login (JWT Authentication)
- Secure Protected Routes
- Create Tasks
- Edit Tasks
- Delete Tasks
- Mark Tasks as Completed
- Search Tasks
- Filter (All, Completed, Pending)
- Sort Tasks (Newest, Oldest, A–Z, Z–A)
- Task Statistics Dashboard
- Data Stored in MongoDB Atlas
- Fully Responsive Dark-Themed UI
- Live Deployment on Render

## 🛠 Tech Stack

### Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3

### Backend

- Node.js
- Express.js

### Database

- MongoDB Atlas
- Mongoose

### Authentication

- JSON Web Token (JWT)
- bcryptjs

### Deployment

- Render (Frontend)
- Render (Backend)
- GitHub

## 📷 Project Preview

> Add screenshots of your login page and dashboard here.

## 📂 Project Structure

<escape>task-manager/
│
├── src/                 # React Frontend
├── public/
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── package.json
└── README.md</escape>

## ⚙ Installation

### Clone the Repository

```bash
git clone https://github.com/jeevitharamesh1223-coder/Syntecxhub_Task-manager.git
cd Syntecxhub_Task-manager
```

### Install Frontend

```bash
npm install
```

### Install Backend

```bash
cd server
npm install
```

### Environment Variables

Create `server/.env`

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
PORT=5000
```

> Keep your `.env` file private and never commit it to GitHub.

### Run the Project

Backend

```bash
cd server
npm start
```

Frontend

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Testing

The deployed application has been tested for:

- User Registration
- Login
- JWT Authentication
- Task Creation
- Task Editing
- Task Completion
- Task Deletion
- Page Refresh Persistence
- Logout and Login Again

## Learning Outcomes

This project helped me practice:

- Full-stack application development
- REST API development
- JWT Authentication
- MongoDB Atlas integration
- React state management
- CRUD operations
- Git and GitHub workflow
- Cloud deployment using Render

## Author

**Jeevitha Ramesh**

- GitHub: https://github.com/jeevitharamesh1223-coder
- Live Project: https://taskflow-frontend-i3ky.onrender.com
