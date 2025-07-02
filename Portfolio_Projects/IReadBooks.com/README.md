# 📚 IReadBooks

**IReadBooks.com** is a full-stack web application that allows admins to track books they’ve read, are currently reading or plan to read. Users can browse these books, leave reviews, rate them, and engage with other readers through comments.

Built using:
- 🧠 React (with Vite) for the frontend
- ⚙️ Node.js & Express for the backend
- 🗃 PostgreSQL for data storage

---

## ✨ Features

### 👨‍💼 Admin:
- Add, edit and delete books
- Upload book covers
- Add, edit and delete book description
- Categorize books as **Read**, **Currently Reading**, or **Plan to Read**

### 👤 Users:
- Browse books across all categories
- Post comments and reviews
- Rate books (1 to 5 stars)
- Reset forgotten passwords via email

---

## 🛠 Tech Stack

**Frontend**
- React + Vite
- React Router
- Axios (API communication)

**Backend**
- Node.js + Express
- PostgreSQL
- Passport.js (for authentication)
- Bcrypt (password hashing)
- Nodemailer (email password reset)

---

## 🗂 Project Structure

```bash

IReadBooks/
├── backend/                        # Server-side code (Node.js, Express)
│   ├── node_modules/              
│   ├── .env                        # Environment variables (DB credentials, email, etc.)
│   ├── AdminAuth.js                # Middleware for admin auth
│   ├── mailer.js                   # Email sending logic (nodemailer)
│   ├── server.js                   # Main Express server, routes, logic
│   ├── package.json
│   └── package-lock.json
│
├── frontend/                       # Client-side code (React, Vite)
│   ├── node_modules/
│   ├── public/                     # Static assets (e.g., images, icons)
│   ├── src/                        # React source files
│   │   ├── Routes/                 # Contains all JSX files (pages/components)
│   │   │   ├── App.jsx             # Main React app & routing
│   │   │   ├── Home.jsx            # Component: the welcome page 
│   │   │   ├── PastBooks.jsx       # Component: the page containing the books already read
│   │   │   ├── SignUpForm.jsx      # User registration Form
│   │   │   ├── BookAds.jsx         # Component: advertising of new released books 
│   │   │   ├── ForgotPassword.jsx  # Password reset page
│   │   │   ├── LeaveAComment.jsx   # Leave a comment and rate the book page
│   │   │   └── ...                 # Other components/pages
│   │   ├── App.css                 # Global styles for the app
│   │   ├── global.css              # Additional global styles
│   │   ├── index.js                # Entry point for React app
│   ├── index.html                 
│   ├── vite.config.js
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore                      # Global git ignore file 
├── README.md                       # Project overview and documentation