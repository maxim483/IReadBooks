# 📚 IReadBooks

**IReadBooks.com** is a full-stack web application that enables admins to manage a digital bookshelf—tracking books they’ve read, are reading or plan to read. Users can explore the book collection, leave reviews, rate titles, and engage through comments.

Built using:
- 🧠 React (with Vite) for the frontend  
- ⚙️ Node.js & Express for the backend  
- 🗃 PostgreSQL for data storage  

---

## ✨ Features

### ✅ Fully Responsive Layout

Optimized for a seamless experience across all devices:

💻 **Laptops / Desktops**
- Homepage  
  ![Homepage - Laptop](AppImages/HomepageFull.png)
- Past Books  
  ![PastBooks - Laptop](AppImages/PastBooksFull.png)
- Sign Up  
  ![SignUp - Laptop](AppImages/SignUpFull.png)

📱 **Mobile Devices**
- Homepage  
  ![Homepage - Mobile](AppImages/HomepagePhone.png)
- Past Books  
  ![PastBooks - Mobile](AppImages/PastBooksPhone.png)
- Sign Up  
  ![SignUp - Mobile](AppImages/SignUpPhone.png)

📱‍💻 **Tablets**
- Homepage  
  ![Homepage - Tablet](AppImages/HomepageTablet.png)
- Past Books  
  ![PastBooks - Tablet](AppImages/PastBooksTablet.png)
- Sign Up  
  ![SignUp - Tablet](AppImages/SignUpTablet.png)

---

### 📢 New Book Release Promotions

A built-in **promotion engine** highlights newly released books across the app. These promotions function like in-app advertisements and are:

- Clickable book covers linking to external stores or publisher pages  
- Shown across pages and fully responsive

📸 **Examples:**
- Laptop view  
  ![Ads for laptop](AppImages/PastBooksFull.png)
- Tablet view  
  ![Ads for tablet](AppImages/PastBooksTablet2.png)
- Phone view  
  ![Ads for phone](AppImages/PastBooksPhone3.png)

---

### 👨‍💼 Admin Features

Admins can manage the entire book library:

- Add and delete books  
  ![Delete book](AppImages/PresentBooksAdminFull2.png)  
  ![Add book](AppImages/PresentBooksAdmin3.png)

- Upload book covers  
  ![Upload cover](AppImages/PresentBooksAdmin4.png)

- Add, edit, and delete descriptions  
  ![Edit description](AppImages/AddingDescriptionFull.png)

- Manage book status:
  - Move from **Future Books** to **Currently Reading** using "Mark as reading"
  - Move from **Currently Reading** to **Read Books** using "Mark as done reading"

  ![/futureBooks page](AppImages/FutureBooksAdminFull.png)  
  ![/presentBooks page](AppImages/PresentBooksAdminFull.png)

---

### 👤 User Features

Users can:

- Browse books in all categories  
  ![Homepage](AppImages/HomepageFull.png)  
  ![Past books](AppImages/PastBooksFull.png)  
  ![Present books](AppImages/PresentBooksFull.png)  
  ![Future books](AppImages/FutureBooksFull.png)

- Sort books by title and rating  
  ![Sort by title](AppImages/PastBooksFull.png)  
  ![Sort by rating](AppImages/PastBooksFull2.png)

- Sign up to post comments and rate books  
  ![Sign up](AppImages/SignUpFull.png)

- Sign in and sign out  
  ![Signed in welcome](AppImages/HomepageWelcomeNoteFull.png)  
  ![Signed in UI](AppImages/HomePageSignedinFull.png)  
  ![Signed out](AppImages/HomepageLogoutMessagePhone.png)

- Post comments and rate books (1 to 5 stars)  
  ![Leave comment and rate](AppImages/LeaveCommentFull.png)  
  ![Book with comments and ratings](AppImages/UserCommentsFull.png)

- Reset forgotten passwords via email  
  ![Password reset](AppImages/ForgotPasswordTablet.png)

---

## 🛠 Tech Stack

**Frontend**
- React + Vite
- React Router
- Axios

**Backend**
- Node.js + Express
- PostgreSQL
- Passport.js (authentication)
- Bcrypt (password hashing)
- Nodemailer (email/password reset)

---

## 🗂 Project Structure

```bash
IReadBooks/
├── backend/                        # Server-side code (Node.js, Express)
│   ├── node_modules/
│   ├── .env                        # Environment variables
│   ├── AdminAuth.js                # Admin auth middleware
│   ├── mailer.js                   # Email logic
│   ├── server.js                   # Main server file
│   ├── package.json
│   └── package-lock.json
│
├── frontend/                       # Client-side code (React, Vite)
│   ├── node_modules/
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── Routes/                 # React pages/components
│   │   │   ├── App.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── PastBooks.jsx
│   │   │   ├── SignUpForm.jsx
│   │   │   ├── BookAds.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── LeaveAComment.jsx
│   │   │   └── ...
│   │   ├── App.css
│   │   ├── global.css
│   │   ├── index.js
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── README.md



 