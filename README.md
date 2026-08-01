# 📝 Blogify

A full-stack blogging platform built with **vanilla PHP** (backend API) and **HTML / CSS / JavaScript** (frontend). Users can register, log in, and perform full CRUD operations on blog posts — all served through XAMPP/Apache.

🌐 **Live Demo:** [https://blogify.infinityfree.io/](https://blogify.infinityfree.io/)

---

## ✨ Features

- **Premium Landing Page** — Stunning dark-themed landing page with glassmorphism, animations, and a modern hero section (`app.html`)
- **User Authentication** — Register, login, logout with PHP sessions
- **Blog Post CRUD** — Create, read, update, and delete blog posts
- **Ownership Protection** — Users can only edit/delete their own posts
- **Search** — Search blog posts from the homepage
- **Responsive Design** — Mobile-friendly UI with modern styling
- **Dark / Light Theme** — Toggle between dark and light themes
- **Rich Text Toolbar** — Text formatting toolbar for post creation
- **Dashboard** — Authenticated users get a personal dashboard to manage posts
- **Individual Post View** — Dedicated page for each blog post

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | HTML5, CSS3, Vanilla JavaScript     |
| Backend    | PHP (REST-style API)                |
| Database   | MySQL (via PDO)                     |
| Server     | XAMPP (Apache + MySQL)              |
| Fonts      | Google Fonts (Merriweather, Open Sans) |

---

## 📁 Project Structure

```
Blog-app/
├── .env                  # Environment variables (DB credentials, URLs)
├── .gitignore            # Git ignore rules
├── README.md             # This file
├── app.html              # Landing page — premium hero, features & CTA
│
├── backend/
│   ├── config.php        # Loads .env and defines DB constants
│   ├── dp.php            # Database connection (PDO) + CORS headers
│   ├── auth.php          # Authentication API (register, login, logout, me)
│   ├── posts.php         # Blog posts API (GET, POST, PUT, DELETE)
│   ├── migrate.php       # One-time migration script to set up tables
│   └── init.sql          # Raw SQL schema (for manual import)
│
└── frontend/
    ├── index.html        # Homepage — lists all blog posts
    ├── blog.html         # Individual blog post view
    ├── login.html        # Login page
    ├── register.html     # Registration page
    ├── dashboard.html    # User dashboard (manage own posts)
    ├── style.css         # Main stylesheet
    ├── extra-styles.css  # Additional styles
    ├── home.js           # Homepage logic (fetch & display posts)
    ├── blog-view.js      # Single post view logic
    ├── dashboard.js      # Dashboard logic (CRUD operations)
    ├── script.js         # Auth-related scripts (login/register)
    ├── auth-menu.js      # Auth menu UI component
    ├── text-toolbar.js   # Rich text formatting toolbar
    └── theme.js          # Dark/light theme toggle logic
```

---

## 🚀 Getting Started

### Prerequisites

- [XAMPP](https://www.apachefriends.org/) (or any Apache + MySQL + PHP stack)
- PHP 7.4+ with PDO extension enabled
- MySQL 5.7+ or MariaDB

### 1. Clone the Repository

```bash
git clone https://github.com/Minhaj414/BlogAppDemo.git
cd BlogAppDemo
```

### 2. Place the Project in XAMPP

Copy or clone the project into your XAMPP `htdocs` directory:

```
C:\xampp\htdocs\Blog-app\
```

### 3. Configure Environment Variables

Create a `.env` file in the project root (copy from the example below):

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_NAME=blog
DB_USER=root
DB_PASS=
DB_CHARSET=utf8mb4

# API Configuration (adjust path to match your htdocs folder name)
API_URL=http://localhost/Blog-app/backend

# Frontend Configuration
FRONTEND_URL=http://localhost/Blog-app/frontend
```

> **Note:** Update `API_URL` and `FRONTEND_URL` if your folder name differs from `Blog-app`.

### 4. Start XAMPP

1. Open the **XAMPP Control Panel**
2. Start **Apache** and **MySQL**

### 5. Create the Database

You have **two options**:

**Option A — Run the migration script (recommended):**

Open your browser and visit:

```
http://localhost/Blog-app/backend/migrate.php
```

This will automatically create the `blog` database and the required tables.

**Option B — Import SQL manually:**

1. Open **phpMyAdmin** at `http://localhost/phpmyadmin`
2. Create a new database named `blog`
3. Import `backend/init.sql`

### 6. Open the App

Visit the landing page in your browser:

```
http://localhost/Blog-app/app.html
```

Or go directly to the blog homepage:

```
http://localhost/Blog-app/frontend/index.html
```

---

## 📡 API Endpoints

### Authentication — `backend/auth.php`

| Method | URL                            | Description                    | Auth Required |
| ------ | ------------------------------ | ------------------------------ | ------------- |
| POST   | `auth.php?action=register`     | Register a new user            | No            |
| POST   | `auth.php?action=login`        | Login (starts PHP session)     | No            |
| POST   | `auth.php?action=logout`       | Logout (destroys session)      | Yes           |
| GET    | `auth.php?action=me`           | Get current logged-in user     | Yes           |

**Register payload:**
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Login payload:**
```json
{
  "username": "john",
  "password": "secret123"
}
```

### Blog Posts — `backend/posts.php`

| Method | URL              | Description            | Auth Required |
| ------ | ---------------- | ---------------------- | ------------- |
| GET    | `posts.php`      | Get all blog posts     | No            |
| GET    | `posts.php?id=1` | Get a single post      | No            |
| POST   | `posts.php`      | Create a new post      | Yes           |
| PUT    | `posts.php`      | Update an existing post| Yes (owner)   |
| DELETE | `posts.php?id=1` | Delete a post          | Yes (owner)   |

**Create/Update payload:**
```json
{
  "title": "My First Blog Post",
  "content": "This is the content of my post."
}
```

---

## 🗄️ Database Schema

### `user` Table

| Column       | Type          | Description              |
| ------------ | ------------- | ------------------------ |
| `id`         | INT (PK, AI)  | Unique user ID           |
| `username`   | VARCHAR(100)  | Unique username          |
| `email`      | VARCHAR(255)  | User email               |
| `password`   | VARCHAR(255)  | Bcrypt hashed password   |
| `role`       | VARCHAR(50)   | User role (default: user)|
| `created_at` | TIMESTAMP     | Account creation date    |

### `blogPost` Table

| Column       | Type          | Description                        |
| ------------ | ------------- | ---------------------------------- |
| `id`         | INT (PK, AI)  | Unique post ID                     |
| `user_id`    | INT (FK)      | Author (references `user.id`)      |
| `title`      | VARCHAR(255)  | Post title                         |
| `content`    | TEXT          | Post body                          |
| `image`      | LONGTEXT      | Optional image data (base64)       |
| `created_at` | TIMESTAMP     | Creation date                      |
| `updated_at` | TIMESTAMP     | Last update date                   |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**MJM. Minhaj**

- [Portfolio](https://minhaj414.github.io/portfolio2/)
- [GitHub](https://github.com/minhaj414)
- [LinkedIn](https://www.linkedin.com/in/minhaj-it/)

---

## 📄 License

This project is open source and available for personal and educational use.
